import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { HiUserGroup, HiMagnifyingGlass, HiQueueList } from 'react-icons/hi2';

export default function StudentPreferences() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [studentsSnap, coursesSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'courses')),
        ]);
        setStudents(studentsSnap.docs.filter(d => d.data().role === 'student').map(d => ({ id: d.id, ...d.data() })));
        setCourses(coursesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    fetchData();
  }, []);

  function getCourseName(courseId) {
    const c = courses.find(c => c.courseId === courseId || c.id === courseId);
    return c?.courseName || courseId;
  }

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.registrationNumber?.toLowerCase().includes(search.toLowerCase()) ||
    s.department?.toLowerCase().includes(search.toLowerCase())
  );

  const withPrefs = filtered.filter(s => s.preferences?.length > 0);
  const withoutPrefs = filtered.filter(s => !s.preferences?.length);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-navy-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold font-display text-slate-900">Student Preferences</h2>
          <p className="text-sm text-slate-400">{withPrefs.length} submitted, {withoutPrefs.length} pending</p>
        </div>
        <div className="relative max-w-xs w-full">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
            placeholder="Search students..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Student</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Reg No.</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Department</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Preferences</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => (
                <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-navy-100 rounded-lg flex items-center justify-center text-xs font-bold text-navy-700">
                        {student.name?.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-slate-800">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-500">{student.registrationNumber}</td>
                  <td className="px-5 py-3 text-sm text-slate-500">{student.department}</td>
                  <td className="px-5 py-3">
                    {student.preferences?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {student.preferences.map((pref, i) => (
                          <span key={i} className="px-2 py-0.5 bg-navy-50 text-navy-700 text-[10px] font-medium rounded">
                            {i + 1}. {getCourseName(pref)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                      student.preferences?.length > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {student.preferences?.length > 0 ? 'Submitted' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <HiUserGroup className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-sm">No students found</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
