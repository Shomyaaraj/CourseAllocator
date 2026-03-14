import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { runAllocation } from '../../utils/allocationEngine';
import { HiCpuChip, HiPlay, HiCheckBadge, HiExclamationTriangle, HiArrowPath, HiPencilSquare } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function AllocationPage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);

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
    if (!confirm('Run the allocation algorithm? This will replace any existing allocations.')) return;
    setRunning(true);
    try {
      // Clear existing allocations
      const existingSnap = await getDocs(collection(db, 'allocations'));
      const batch = writeBatch(db);
      existingSnap.forEach(d => batch.delete(d.ref));
      await batch.commit();

      // Run algorithm
      const { allocations: results, updatedCourses } = runAllocation(students, courses);

      // Save allocations to Firestore
      for (const alloc of results) {
        await setDoc(doc(collection(db, 'allocations')), alloc);
        // Update user's allocatedCourse
        if (alloc.allocatedCourse) {
          await updateDoc(doc(db, 'users', alloc.studentId), {
            allocatedCourse: alloc.courseName || alloc.allocatedCourse,
          });
        }
      }

      // Update course remaining seats
      for (const course of updatedCourses) {
        const courseDoc = courses.find(c => (c.courseId || c.id) === (course.courseId || course.id));
        if (courseDoc) {
          await updateDoc(doc(db, 'courses', courseDoc.id), {
            remainingSeats: course.remainingSeats,
          });
        }
      }

      setAllocations(results);
      setHasRun(true);
      toast.success(`Allocation complete! ${results.filter(r => r.allocatedCourse).length} students allocated.`);
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error('Allocation failed');
    }
    setRunning(false);
  }

  async function handleOverride(alloc, newCourseId) {
    const courseName = courses.find(c => (c.courseId || c.id) === newCourseId)?.courseName || newCourseId;
    try {
      // Find allocation doc
      const allocSnap = await getDocs(collection(db, 'allocations'));
      const allocDoc = allocSnap.docs.find(d => d.data().studentId === alloc.studentId);
      if (allocDoc) {
        await updateDoc(allocDoc.ref, { allocatedCourse: newCourseId, courseName, overridden: true });
      }
      await updateDoc(doc(db, 'users', alloc.studentId), { allocatedCourse: courseName });
      toast.success('Override saved');
      fetchData();
    } catch (e) { toast.error('Override failed'); }
  }

  const allocated = allocations.filter(a => a.allocatedCourse);
  const unallocated = allocations.filter(a => !a.allocatedCourse);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-navy-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <HiCpuChip className="w-5 h-5 text-navy-500" />
              <h2 className="text-lg font-semibold font-display text-slate-900">Allocation Engine</h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              {students.filter(s => s.preferences?.length > 0).length} students with preferences | {courses.length} courses available
            </p>
          </div>
          <button
            onClick={handleRunAllocation}
            disabled={running}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
          >
            {running ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Running...
              </>
            ) : (
              <>
                <HiPlay className="w-5 h-5" />
                Run Allocation
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary */}
      {hasRun && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-xs text-slate-400 font-medium">Total Processed</p>
            <p className="text-2xl font-bold text-slate-900">{allocations.length}</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5">
            <p className="text-xs text-emerald-600 font-medium">Allocated</p>
            <p className="text-2xl font-bold text-emerald-700">{allocated.length}</p>
          </div>
          <div className="bg-rose-50 rounded-2xl border border-rose-200 p-5">
            <p className="text-xs text-rose-600 font-medium">Unallocated</p>
            <p className="text-2xl font-bold text-rose-700">{unallocated.length}</p>
          </div>
        </div>
      )}

      {/* Results Table */}
      {hasRun && allocations.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Allocation Results</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Student</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Reg No.</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Allocated Course</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Pref Rank</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Override</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((alloc, idx) => (
                  <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-5 py-3 text-sm font-medium text-slate-800">{alloc.studentName}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{alloc.registrationNumber}</td>
                    <td className="px-5 py-3">
                      {alloc.allocatedCourse ? (
                        <span className="text-sm font-medium text-emerald-700">{alloc.courseName || alloc.allocatedCourse}</span>
                      ) : (
                        <span className="text-sm text-rose-500 flex items-center gap-1">
                          <HiExclamationTriangle className="w-3.5 h-3.5" /> Unallocated
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {alloc.preferenceRank ? (
                        <span className="px-2 py-0.5 bg-navy-50 text-navy-700 text-xs font-medium rounded">#{alloc.preferenceRank}</span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <select
                        className="text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) handleOverride(alloc, e.target.value);
                        }}
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
        </div>
      )}
    </motion.div>
  );
}
