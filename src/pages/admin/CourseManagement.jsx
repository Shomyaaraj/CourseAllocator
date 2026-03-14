import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { HiPlus, HiPencilSquare, HiTrash, HiXMark, HiBookOpen, HiClock, HiCalendarDays } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Generate half-hour time slots from 07:00 to 20:00
const TIME_SLOTS = (() => {
  const slots = [];
  for (let h = 7; h <= 19; h++) {
    ['00', '30'].forEach(m => {
      const hh = h.toString().padStart(2, '0');
      const label12 = `${h > 12 ? h - 12 : h}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
      slots.push({ value: `${hh}:${m}`, label: label12 });
    });
  }
  slots.push({ value: '20:00', label: '8:00 PM' });
  return slots;
})();

const DEPARTMENTS = [
  'Computer Science & Engineering', 'Electronics & Communication',
  'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
  'Information Technology', 'Chemical Engineering', 'Biotechnology',
  'Business Administration', 'Mathematics', 'Physics', 'Chemistry', 'General'
];

const emptyForm = {
  courseId: '', courseName: '', department: '',
  seatCapacity: '', prerequisites: '',
  day: '', startTime: '', endTime: '',
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
    } catch (e) {
      toast.error('Failed to load courses');
    }
    setLoading(false);
  }

  /** Parse stored timetableSlot string back into day/startTime/endTime */
  function parseTimetableSlot(slot) {
    if (!slot) return { day: '', startTime: '', endTime: '' };
    // Format: "Monday 09:00–10:30"
    const match = slot.match(/^(\w+)\s+([\d:]+)–([\d:]+)$/);
    if (match) return { day: match[1], startTime: match[2], endTime: match[3] };
    return { day: '', startTime: '', endTime: '' };
  }

  function buildTimetableSlot(day, startTime, endTime) {
    if (!day && !startTime && !endTime) return '';
    return `${day} ${startTime}–${endTime}`;
  }

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(course) {
    setEditing(course.id);
    const { day, startTime, endTime } = parseTimetableSlot(course.timetableSlot);
    setForm({
      courseId: course.courseId || '',
      courseName: course.courseName || '',
      department: course.department || '',
      seatCapacity: course.seatCapacity?.toString() || '',
      prerequisites: Array.isArray(course.prerequisites) ? course.prerequisites.join(', ') : '',
      day, startTime, endTime,
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.courseId || !form.courseName || !form.seatCapacity) {
      return toast.error('Course ID, name and capacity are required');
    }
    if ((form.startTime || form.endTime) && (!form.day || !form.startTime || !form.endTime)) {
      return toast.error('Please select a complete day and time range for the timetable slot');
    }

    setSaving(true);
    const timetableSlot = buildTimetableSlot(form.day, form.startTime, form.endTime);
    const data = {
      courseId: form.courseId,
      courseName: form.courseName,
      department: form.department,
      seatCapacity: parseInt(form.seatCapacity),
      remainingSeats: parseInt(form.seatCapacity),
      prerequisites: form.prerequisites
        ? form.prerequisites.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      timetableSlot,
    };

    try {
      if (editing) {
        await updateDoc(doc(db, 'courses', editing), data);
        // Update in place
        setCourses(prev =>
          prev.map(c => (c.id === editing ? { ...c, ...data } : c))
        );
        toast.success('Course updated!');
      } else {
        const docRef = await addDoc(collection(db, 'courses'), data);
        // ✅ Optimistically add the new course to state immediately
        setCourses(prev => [...prev, { id: docRef.id, ...data }]);
        toast.success('Course added!');
      }
      setShowForm(false);
    } catch (e) {
      console.error(e);
      toast.error('Failed to save course');
    }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this course?')) return;
    try {
      await deleteDoc(doc(db, 'courses', id));
      setCourses(prev => prev.filter(c => c.id !== id));
      toast.success('Course deleted');
    } catch (e) {
      toast.error('Failed to delete');
    }
  }

  const inputClass =
    'w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-navy-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold font-display text-slate-900">Course Management</h2>
          <p className="text-sm text-slate-400">{courses.length} course{courses.length !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-navy-600 to-navy-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-navy-500/25 hover:shadow-navy-500/40 transition-all"
        >
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
            transition={{ delay: idx * 0.04 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-navy-50 rounded-xl flex items-center justify-center">
                <HiBookOpen className="w-5 h-5 text-navy-500" />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(course)}
                  className="p-1.5 text-slate-400 hover:text-navy-600 hover:bg-navy-50 rounded-lg transition-colors"
                >
                  <HiPencilSquare className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <HiTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-0.5">{course.courseName}</h3>
            <p className="text-xs text-slate-400 mb-3">{course.courseId}</p>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <span className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md">{course.department || 'General'}</span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md">
                {course.remainingSeats ?? course.seatCapacity}/{course.seatCapacity} seats
              </span>
              {course.timetableSlot && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md">
                  <HiClock className="w-3 h-3" />
                  {course.timetableSlot}
                </span>
              )}
            </div>
            {course.prerequisites?.length > 0 && (
              <p className="text-[10px] text-slate-400 mt-2 truncate">
                Prereq: {course.prerequisites.join(', ')}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <HiBookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium mb-1">No courses yet</p>
          <p className="text-xs">Click "Add Course" to create your first course.</p>
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <motion.div
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
                <h3 className="text-base font-semibold font-display">
                  {editing ? 'Edit Course' : 'Add New Course'}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  <HiXMark className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Row 1 – Course ID & Capacity */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Course ID *</label>
                    <input
                      type="text"
                      value={form.courseId}
                      onChange={e => setForm({ ...form, courseId: e.target.value })}
                      className={inputClass}
                      placeholder="CS301"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Capacity *</label>
                    <input
                      type="number"
                      min="1"
                      value={form.seatCapacity}
                      onChange={e => setForm({ ...form, seatCapacity: e.target.value })}
                      className={inputClass}
                      placeholder="60"
                      required
                    />
                  </div>
                </div>

                {/* Course Name */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Course Name *</label>
                  <input
                    type="text"
                    value={form.courseName}
                    onChange={e => setForm({ ...form, courseName: e.target.value })}
                    className={inputClass}
                    placeholder="Machine Learning"
                    required
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
                  <select
                    value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                    className={`${inputClass} appearance-none`}
                  >
                    <option value="">Select department (optional)</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* Timetable Slot – Day + Time pickers */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-2">
                    <HiCalendarDays className="w-3.5 h-3.5 text-navy-400" />
                    Timetable Slot
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Day */}
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Day</label>
                      <select
                        value={form.day}
                        onChange={e => setForm({ ...form, day: e.target.value })}
                        className={`${inputClass} text-xs`}
                      >
                        <option value="">— Day —</option>
                        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    {/* Start Time */}
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Start</label>
                      <select
                        value={form.startTime}
                        onChange={e => setForm({ ...form, startTime: e.target.value })}
                        className={`${inputClass} text-xs`}
                      >
                        <option value="">— Start —</option>
                        {TIME_SLOTS.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    {/* End Time */}
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">End</label>
                      <select
                        value={form.endTime}
                        onChange={e => setForm({ ...form, endTime: e.target.value })}
                        className={`${inputClass} text-xs`}
                      >
                        <option value="">— End —</option>
                        {TIME_SLOTS
                          .filter(t => !form.startTime || t.value > form.startTime)
                          .map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                      </select>
                    </div>
                  </div>
                  {form.day && form.startTime && form.endTime && (
                    <p className="text-[10px] text-navy-500 mt-1.5 font-medium">
                      📅 {form.day} · {TIME_SLOTS.find(t => t.value === form.startTime)?.label} – {TIME_SLOTS.find(t => t.value === form.endTime)?.label}
                    </p>
                  )}
                </div>

                {/* Prerequisites */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Prerequisites <span className="text-slate-400 font-normal">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={form.prerequisites}
                    onChange={e => setForm({ ...form, prerequisites: e.target.value })}
                    className={inputClass}
                    placeholder="CS101, CS201"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-gradient-to-r from-navy-600 to-navy-700 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 hover:from-navy-700 hover:to-navy-800"
                >
                  {saving
                    ? <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving…
                      </span>
                    : editing ? 'Update Course' : 'Add Course'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
