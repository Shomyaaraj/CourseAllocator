import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc, setDoc, writeBatch } from 'firebase/firestore';
import { runAllocation } from '../../utils/allocationEngine';
import {
  HiCpuChip, HiPlay, HiCheckBadge, HiExclamationTriangle,
  HiArrowPath, HiChartBar, HiInformationCircle, HiUsers,
  HiBookOpen, HiAcademicCap
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function AllocationPage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'allocated' | 'unallocated'

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const [studentsSnap, coursesSnap, allocSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'courses')),
        getDocs(collection(db, 'allocations')),
      ]);
      setStudents(studentsSnap.docs.filter(d => d.data().role === 'student').map(d => ({ id: d.id, ...d.data() })));
      setCourses(coursesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      const existingAllocs = allocSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllocations(existingAllocs);
      if (existingAllocs.length > 0) setHasRun(true);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function handleRunAllocation() {
    if (!confirm('Run the Gale-Shapley allocation? This will replace any existing allocations.')) return;
    setRunning(true);
    try {
      // 1. Clear existing allocations
      const existingSnap = await getDocs(collection(db, 'allocations'));
      const batch = writeBatch(db);
      existingSnap.forEach(d => batch.delete(d.ref));

      // Also clear allocatedCourse on all students
      const usersSnap = await getDocs(collection(db, 'users'));
      usersSnap.docs
        .filter(d => d.data().role === 'student')
        .forEach(d => batch.update(d.ref, { allocatedCourse: null }));

      await batch.commit();

      // 2. Run Gale-Shapley algorithm
      const { allocations: results, updatedCourses } = runAllocation(students, courses);

      // 3. Write allocation records + update user profiles
      const writeBatch2 = writeBatch(db);
      for (const alloc of results) {
        const allocRef = doc(collection(db, 'allocations'));
        writeBatch2.set(allocRef, alloc);
        if (alloc.allocatedCourse) {
          writeBatch2.update(doc(db, 'users', alloc.studentId), {
            allocatedCourse: alloc.allocatedCourse,
          });
        }
      }

      // 4. Update course remaining seats
      for (const course of updatedCourses) {
        const courseDoc = courses.find(c => (c.courseId || c.id) === (course.courseId || course.id));
        if (courseDoc) {
          writeBatch2.update(doc(db, 'courses', courseDoc.id), {
            remainingSeats: course.remainingSeats,
          });
        }
      }

      await writeBatch2.commit();

      setAllocations(results);
      setHasRun(true);
      const numAllocated = results.filter(r => r.allocatedCourse).length;
      toast.success(`✅ Stable allocation complete — ${numAllocated}/${results.length} students allocated.`);
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error('Allocation failed: ' + e.message);
    }
    setRunning(false);
  }

  async function handleOverride(alloc, newCourseId) {
    if (!newCourseId) return;
    const courseObj = courses.find(c => (c.courseId || c.id) === newCourseId);
    const courseName = courseObj?.courseName || newCourseId;
    try {
      const allocSnap = await getDocs(collection(db, 'allocations'));
      const allocDoc = allocSnap.docs.find(d => d.data().studentId === alloc.studentId);
      const b = writeBatch(db);
      if (allocDoc) {
        b.update(allocDoc.ref, { allocatedCourse: newCourseId, courseName, overridden: true });
      }
      b.update(doc(db, 'users', alloc.studentId), { allocatedCourse: newCourseId });
      await b.commit();
      toast.success('Override saved');
      fetchData();
    } catch (e) { toast.error('Override failed'); }
  }

  const allocated = allocations.filter(a => a.allocatedCourse);
  const unallocated = allocations.filter(a => !a.allocatedCourse);

  const studentsWithPrefs = students.filter(s => s.preferences?.length > 0);
  const studentsWithoutPrefs = students.filter(s => !s.preferences?.length);

  const displayedAllocations = allocations.filter(a => {
    if (filter === 'allocated') return !!a.allocatedCourse;
    if (filter === 'unallocated') return !a.allocatedCourse;
    return true;
  });

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-navy-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Algorithm Info */}
      <div className="bg-gradient-to-r from-navy-800 to-navy-900 rounded-2xl p-5 text-white">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <HiCpuChip className="w-5 h-5 text-gold-300" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold">Gale-Shapley Stable Matching Algorithm</h2>
            <p className="text-white/50 text-xs mt-1 leading-relaxed">
              Students propose to courses in preference order. Courses accept the highest-CGPA students and eject lower-priority students when seats fill. This guarantees stability — no student and course would mutually prefer each other over their current assignment.
            </p>
          </div>
          <button
            onClick={handleRunAllocation}
            disabled={running || studentsWithPrefs.length === 0}
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50"
          >
            {running ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Running…
              </>
            ) : (
              <>
                <HiPlay className="w-4 h-4" />
                Run Allocation
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pre-run stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Students', value: students.length, icon: HiUsers, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'With Preferences', value: studentsWithPrefs.length, icon: HiAcademicCap, color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: 'Courses Available', value: courses.length, icon: HiBookOpen, color: 'text-navy-500', bg: 'bg-navy-50' },
          { label: 'No Preferences', value: studentsWithoutPrefs.length, icon: HiExclamationTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
        ].map((card, i) => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className={`w-8 h-8 ${card.bg} rounded-lg flex items-center justify-center mb-2`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <p className="text-xl font-bold text-slate-900">{card.value}</p>
            <p className="text-[11px] text-slate-400 font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Post-run summary */}
      {hasRun && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
            <p className="text-xs text-slate-400 font-medium mb-1">Processed</p>
            <p className="text-2xl font-bold text-slate-900">{allocations.length}</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4 text-center">
            <p className="text-xs text-emerald-600 font-medium mb-1">Allocated</p>
            <p className="text-2xl font-bold text-emerald-700">{allocated.length}</p>
          </div>
          <div className="bg-rose-50 rounded-2xl border border-rose-200 p-4 text-center">
            <p className="text-xs text-rose-600 font-medium mb-1">Unallocated</p>
            <p className="text-2xl font-bold text-rose-700">{unallocated.length}</p>
          </div>
        </div>
      )}

      {/* Results Table */}
      {hasRun && allocations.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900">Allocation Results</h3>
            <div className="flex items-center gap-2">
              {['all', 'allocated', 'unallocated'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors capitalize ${
                    filter === f
                      ? 'bg-navy-600 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">Student</th>
                  <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Reg No.</th>
                  <th className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">CGPA</th>
                  <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Department</th>
                  <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Allocated Course</th>
                  <th className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Pref Rank</th>
                  <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayedAllocations.map((alloc, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-navy-100 rounded-lg flex items-center justify-center text-navy-700 text-xs font-bold shrink-0">
                          {alloc.studentName?.charAt(0) || '?'}
                        </div>
                        <span className="text-sm font-medium text-slate-800">{alloc.studentName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{alloc.registrationNumber || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      {alloc.cgpa != null ? (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          alloc.cgpa >= 8 ? 'bg-emerald-50 text-emerald-700'
                          : alloc.cgpa >= 6 ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                        }`}>
                          {Number(alloc.cgpa).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[120px] truncate">{alloc.department || '—'}</td>
                    <td className="px-4 py-3">
                      {alloc.allocatedCourse ? (
                        <div>
                          <p className="text-sm font-medium text-slate-800">{alloc.courseName || alloc.allocatedCourse}</p>
                          {alloc.timetableSlot && (
                            <p className="text-[10px] text-slate-400">{alloc.timetableSlot}</p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                          <HiExclamationTriangle className="w-3 h-3" /> Unallocated
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {alloc.preferenceRank ? (
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          alloc.preferenceRank === 1 ? 'bg-gold-100 text-gold-700'
                          : alloc.preferenceRank === 2 ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                        }`}>
                          #{alloc.preferenceRank}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-navy-300 focus:outline-none focus:ring-1 focus:ring-navy-400 transition-colors"
                        defaultValue=""
                        onChange={(e) => handleOverride(alloc, e.target.value)}
                      >
                        <option value="">Manual Override</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.courseId || c.id}>{c.courseName}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CGPA Legend */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-4 flex-wrap">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">CGPA Colors:</span>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> ≥ 8.0 (High)</span>
            <span className="inline-flex items-center gap-1 text-xs text-blue-700"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> 6.0 – 7.9</span>
            <span className="inline-flex items-center gap-1 text-xs text-amber-700"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> &lt; 6.0</span>
            <span className="ml-auto text-[10px] text-slate-400 flex items-center gap-1">
              <HiInformationCircle className="w-3 h-3" />
              Pref rank #1 = first choice allocated
            </span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasRun && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 bg-navy-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HiCpuChip className="w-7 h-7 text-navy-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-2">No allocation run yet</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Click <strong>Run Allocation</strong> to execute the Gale-Shapley stable matching algorithm across all students and their preferences.
          </p>
        </div>
      )}
    </motion.div>
  );
}
