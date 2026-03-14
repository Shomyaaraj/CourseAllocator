import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { HiPlus, HiPencilSquare, HiTrash, HiXMark, HiBookOpen } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const emptyForm = {
  courseId: '', courseName: '', department: '',
  seatCapacity: '', prerequisites: '', timetableSlot: ''
};

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCourses(); }, []);

  async function fetchCourses() {
    try {
      const snap = await getDocs(collection(db, 'courses'));
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { toast.error('Failed to load courses'); }
    setLoading(false);
  }

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(course) {
    setEditing(course.id);
    setForm({
      courseId: course.courseId || '',
      courseName: course.courseName || '',
      department: course.department || '',
      seatCapacity: course.seatCapacity?.toString() || '',
      prerequisites: Array.isArray(course.prerequisites) ? course.prerequisites.join(', ') : '',
      timetableSlot: course.timetableSlot || '',
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.courseId || !form.courseName || !form.seatCapacity) {
      return toast.error('Please fill required fields');
    }
    setSaving(true);
    const data = {
      courseId: form.courseId,
      courseName: form.courseName,
      department: form.department,
      seatCapacity: parseInt(form.seatCapacity),
      remainingSeats: parseInt(form.seatCapacity),
      prerequisites: form.prerequisites ? form.prerequisites.split(',').map(s => s.trim()).filter(Boolean) : [],
      timetableSlot: form.timetableSlot,
    };
    try {
      if (editing) {
        await updateDoc(doc(db, 'courses', editing), data);
        toast.success('Course updated!');
      } else {
        await addDoc(collection(db, 'courses'), data);
        toast.success('Course added!');
      }
      setShowForm(false);
      fetchCourses();
    } catch (e) { toast.error('Failed to save course'); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this course?')) return;
    try {
      await deleteDoc(doc(db, 'courses', id));
      toast.success('Course deleted');
      fetchCourses();
    } catch (e) { toast.error('Failed to delete'); }
  }

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all";

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-navy-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold font-display text-slate-900">Course Management</h2>
          <p className="text-sm text-slate-400">{courses.length} courses total</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-navy-600 to-navy-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-navy-500/25 hover:shadow-navy-500/40 transition-all">
          <HiPlus className="w-4 h-4" /> Add Course
        </button>
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course, idx) => (
          <motion.div
            key={course.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-navy-50 rounded-xl flex items-center justify-center">
                <HiBookOpen className="w-5 h-5 text-navy-500" />
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(course)} className="p-1.5 text-slate-400 hover:text-navy-600 hover:bg-navy-50 rounded-lg transition-colors">
                  <HiPencilSquare className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(course.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                  <HiTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">{course.courseName}</h3>
            <p className="text-xs text-slate-400 mb-3">{course.courseId}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 bg-slate-50 text-slate-500 rounded-md">{course.department || 'General'}</span>
              <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md">
                {course.remainingSeats ?? course.seatCapacity}/{course.seatCapacity} seats
              </span>
              {course.timetableSlot && (
                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md">{course.timetableSlot}</span>
              )}
            </div>
            {course.prerequisites?.length > 0 && (
              <p className="text-[10px] text-slate-400 mt-2">Prerequisites: {course.prerequisites.join(', ')}</p>
            )}
          </motion.div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <HiBookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm">No courses yet. Add your first course.</p>
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <motion.div
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold font-display">{editing ? 'Edit Course' : 'Add New Course'}</h3>
                <button onClick={() => setShowForm(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                  <HiXMark className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Course ID *</label>
                    <input type="text" value={form.courseId} onChange={e => setForm({...form, courseId: e.target.value})} className={inputClass} placeholder="CS301" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Capacity *</label>
                    <input type="number" value={form.seatCapacity} onChange={e => setForm({...form, seatCapacity: e.target.value})} className={inputClass} placeholder="60" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Course Name *</label>
                  <input type="text" value={form.courseName} onChange={e => setForm({...form, courseName: e.target.value})} className={inputClass} placeholder="Machine Learning" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
                    <input type="text" value={form.department} onChange={e => setForm({...form, department: e.target.value})} className={inputClass} placeholder="CSE" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Timetable Slot</label>
                    <input type="text" value={form.timetableSlot} onChange={e => setForm({...form, timetableSlot: e.target.value})} className={inputClass} placeholder="Mon 10-11" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Prerequisites (comma-separated)</label>
                  <input type="text" value={form.prerequisites} onChange={e => setForm({...form, prerequisites: e.target.value})} className={inputClass} placeholder="CS101, CS201" />
                </div>
                <button
                  type="submit" disabled={saving}
                  className="w-full py-3 bg-gradient-to-r from-navy-600 to-navy-700 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editing ? 'Update Course' : 'Add Course'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
