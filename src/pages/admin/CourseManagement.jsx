import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import {
  HiPlus, HiPencilSquare, HiTrash, HiXMark,
  HiBookOpen, HiClock, HiCalendarDays,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

const emptyForm = {
  courseId: '', courseName: '', department: '',
  seatCapacity: '', prerequisites: '',
  day: '', startTime: '', endTime: '',
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 9,
  color: '#e8e2d0',
  fontSize: 13,
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
  appearance: 'none',
};

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: '#3a4a60',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: 7,
};

const cardStyle = {
  background: '#0d1425',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 14,
  padding: '20px',
  position: 'relative',
  transition: 'border-color 0.2s',
};

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  useEffect(() => { fetchCourses(); }, []);

  async function fetchCourses() {
    try {
      const snap = await getDocs(collection(db, 'courses'));
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      toast.error('Failed to load courses');
    }
    setLoading(false);
  }

  function parseTimetableSlot(slot) {
    if (!slot) return { day: '', startTime: '', endTime: '' };
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
      prerequisites: Array.isArray(course.prerequisites)
        ? course.prerequisites.join(', ')
        : '',
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
      return toast.error('Please select a complete day and time range');
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
        setCourses(prev => prev.map(c => c.id === editing ? { ...c, ...data } : c));
        toast.success('Course updated!');
      } else {
        const docRef = await addDoc(collection(db, 'courses'), data);
        setCourses(prev => [...prev, { id: docRef.id, ...data }]);
        toast.success('Course added!');
      }
      setShowForm(false);
    } catch {
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
    } catch {
      toast.error('Failed to delete');
    }
  }

  function getInputStyle(field) {
    return {
      ...inputStyle,
      borderColor: focusedField === field
        ? 'rgba(201,168,76,0.45)'
        : 'rgba(255,255,255,0.08)',
    };
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{
          width: 36, height: 36,
          border: '3px solid rgba(201,168,76,0.15)',
          borderTopColor: '#c9a84c',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <motion.div
      style={{ fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column', gap: 20 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 22, fontWeight: 700, color: '#f0ece0', margin: '0 0 4px',
          }}>
            Course Management
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 2, background: '#c9a84c' }} />
            <p style={{ fontSize: 13, color: '#3a4a60', margin: 0 }}>
              {courses.length} course{courses.length !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>
        <button
          onClick={openAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 18px',
            background: '#c9a84c',
            color: '#080d1a',
            fontSize: 13, fontWeight: 700,
            border: 'none', borderRadius: 10,
            cursor: 'pointer', letterSpacing: '0.02em',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <HiPlus style={{ width: 16, height: 16 }} />
          Add Course
        </button>
      </div>

      {/* ── Course Cards Grid ── */}
      {courses.length === 0 ? (
        <div style={{
          background: '#0d1425',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14, padding: '60px 24px', textAlign: 'center',
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16,
            background: 'rgba(201,168,76,0.08)',
            border: '1px solid rgba(201,168,76,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <HiBookOpen style={{ width: 28, height: 28, color: '#c9a84c' }} />
          </div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 18, fontWeight: 700, color: '#e8e2d0', marginBottom: 8,
          }}>
            No Courses Yet
          </div>
          <div style={{ width: 36, height: 2, background: '#c9a84c', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 13, color: '#3a4a60' }}>
            Click "Add Course" to create your first course.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 14,
        }}>
          {courses.map((course, idx) => (
            <motion.div
              key={course.id}
              style={cardStyle}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
            >
              {/* Card top row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 11,
                  background: 'rgba(201,168,76,0.1)',
                  border: '1px solid rgba(201,168,76,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <HiBookOpen style={{ width: 19, height: 19, color: '#c9a84c' }} />
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => openEdit(course)}
                    style={{
                      padding: 6, background: 'none',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 8, cursor: 'pointer',
                      color: '#3a4a60', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = '#c9a84c';
                      e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)';
                      e.currentTarget.style.background = 'rgba(201,168,76,0.08)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = '#3a4a60';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.background = 'none';
                    }}
                  >
                    <HiPencilSquare style={{ width: 14, height: 14 }} />
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    style={{
                      padding: 6, background: 'none',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 8, cursor: 'pointer',
                      color: '#3a4a60', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = '#e24b4a';
                      e.currentTarget.style.borderColor = 'rgba(226,75,74,0.25)';
                      e.currentTarget.style.background = 'rgba(226,75,74,0.08)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = '#3a4a60';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.background = 'none';
                    }}
                  >
                    <HiTrash style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>

              {/* Course info */}
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 15, fontWeight: 700, color: '#e8e2d0', marginBottom: 3,
              }}>
                {course.courseName}
              </div>
              <div style={{ fontSize: 11, color: '#3a4a60', marginBottom: 12 }}>
                {course.courseId}
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {course.department && (
                  <span style={{
                    fontSize: 11, fontWeight: 500,
                    padding: '3px 9px', borderRadius: 6,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    color: '#5e6d85',
                  }}>
                    {course.department}
                  </span>
                )}
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  padding: '3px 9px', borderRadius: 6,
                  background: 'rgba(29,158,117,0.08)',
                  border: '1px solid rgba(29,158,117,0.15)',
                  color: '#1d9e75',
                }}>
                  {course.remainingSeats ?? course.seatCapacity}/{course.seatCapacity} seats
                </span>
                {course.timetableSlot && (
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 11, fontWeight: 500,
                    padding: '3px 9px', borderRadius: 6,
                    background: 'rgba(55,138,221,0.08)',
                    border: '1px solid rgba(55,138,221,0.15)',
                    color: '#378add',
                  }}>
                    <HiClock style={{ width: 10, height: 10 }} />
                    {course.timetableSlot}
                  </span>
                )}
              </div>

              {/* Prerequisites */}
              {course.prerequisites?.length > 0 && (
                <div style={{
                  fontSize: 10, color: '#2a3548', marginTop: 10,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  Prereq: {course.prerequisites.join(', ')}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Form Modal ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 16,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
              onClick={() => setShowForm(false)}
            />

            {/* Modal */}
            <motion.div
              style={{
                position: 'relative',
                width: '100%', maxWidth: 520,
                background: '#0d1425',
                border: '1px solid rgba(201,168,76,0.15)',
                borderRadius: 16,
                overflow: 'hidden',
                maxHeight: '90vh',
                overflowY: 'auto',
                fontFamily: "'DM Sans', sans-serif",
              }}
              initial={{ scale: 0.93, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
            >
              {/* Modal header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '18px 22px',
                background: 'rgba(201,168,76,0.05)',
                borderBottom: '1px solid rgba(201,168,76,0.1)',
                position: 'sticky', top: 0, zIndex: 10,
                backdropFilter: 'blur(8px)',
              }}>
                <div>
                  <div style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 17, fontWeight: 700, color: '#f0ece0',
                  }}>
                    {editing ? 'Edit Course' : 'Add New Course'}
                  </div>
                  <div style={{ width: 32, height: 2, background: '#c9a84c', marginTop: 6 }} />
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: 7, background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 8, cursor: 'pointer', color: '#3a4a60',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#e8e2d0'}
                  onMouseLeave={e => e.currentTarget.style.color = '#3a4a60'}
                >
                  <HiXMark style={{ width: 16, height: 16 }} />
                </button>
              </div>

              {/* Form body */}
              <form onSubmit={handleSubmit} style={{ padding: '22px' }}>

                {/* Row: Course ID + Capacity */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={labelStyle}>Course ID *</label>
                    <input
                      type="text"
                      value={form.courseId}
                      onChange={e => setForm({ ...form, courseId: e.target.value })}
                      placeholder="CS301"
                      required
                      style={getInputStyle('courseId')}
                      onFocus={() => setFocusedField('courseId')}
                      onBlur={() => setFocusedField('')}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Capacity *</label>
                    <input
                      type="number"
                      min="1"
                      value={form.seatCapacity}
                      onChange={e => setForm({ ...form, seatCapacity: e.target.value })}
                      placeholder="60"
                      required
                      style={getInputStyle('seatCapacity')}
                      onFocus={() => setFocusedField('seatCapacity')}
                      onBlur={() => setFocusedField('')}
                    />
                  </div>
                </div>

                {/* Course Name */}
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Course Name *</label>
                  <input
                    type="text"
                    value={form.courseName}
                    onChange={e => setForm({ ...form, courseName: e.target.value })}
                    placeholder="Machine Learning"
                    required
                    style={getInputStyle('courseName')}
                    onFocus={() => setFocusedField('courseName')}
                    onBlur={() => setFocusedField('')}
                  />
                </div>

                {/* Department */}
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Department</label>
                  <select
                    value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                    style={getInputStyle('department')}
                    onFocus={() => setFocusedField('department')}
                    onBlur={() => setFocusedField('')}
                  >
                    <option value="" style={{ background: '#080d1a' }}>Select department (optional)</option>
                    <option value="Computer Science & Engineering" style={{ background: '#080d1a' }}>Computer Science & Engineering</option>
                    <option value="Electronics & Communication" style={{ background: '#080d1a' }}>Electronics & Communication</option>
                    <option value="Electrical Engineering" style={{ background: '#080d1a' }}>Electrical Engineering</option>
                    <option value="Mechanical Engineering" style={{ background: '#080d1a' }}>Mechanical Engineering</option>
                    <option value="Civil Engineering" style={{ background: '#080d1a' }}>Civil Engineering</option>
                    <option value="Information Technology" style={{ background: '#080d1a' }}>Information Technology</option>
                    <option value="Chemical Engineering" style={{ background: '#080d1a' }}>Chemical Engineering</option>
                    <option value="Biotechnology" style={{ background: '#080d1a' }}>Biotechnology</option>
                    <option value="Business Administration" style={{ background: '#080d1a' }}>Business Administration</option>
                    <option value="Mathematics" style={{ background: '#080d1a' }}>Mathematics</option>
                    <option value="Physics" style={{ background: '#080d1a' }}>Physics</option>
                    <option value="Chemistry" style={{ background: '#080d1a' }}>Chemistry</option>
                    <option value="General" style={{ background: '#080d1a' }}>General</option>
                  </select>
                </div>

                {/* Timetable Slot */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <HiCalendarDays style={{ width: 13, height: 13, color: '#c9a84c' }} />
                    Timetable Slot
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {/* Day */}
                    <div>
                      <div style={{ fontSize: 10, color: '#2a3548', marginBottom: 5, fontWeight: 500 }}>Day</div>
                      <select
                        value={form.day}
                        onChange={e => setForm({ ...form, day: e.target.value })}
                        style={{ ...getInputStyle('day'), fontSize: 12 }}
                        onFocus={() => setFocusedField('day')}
                        onBlur={() => setFocusedField('')}
                      >
                        <option value="" style={{ background: '#080d1a' }}>— Day —</option>
                        <option value="Monday" style={{ background: '#080d1a' }}>Monday</option>
                        <option value="Tuesday" style={{ background: '#080d1a' }}>Tuesday</option>
                        <option value="Wednesday" style={{ background: '#080d1a' }}>Wednesday</option>
                        <option value="Thursday" style={{ background: '#080d1a' }}>Thursday</option>
                        <option value="Friday" style={{ background: '#080d1a' }}>Friday</option>
                        <option value="Saturday" style={{ background: '#080d1a' }}>Saturday</option>
                      </select>
                    </div>
                    {/* Start Time */}
                    <div>
                      <div style={{ fontSize: 10, color: '#2a3548', marginBottom: 5, fontWeight: 500 }}>Start</div>
                      <select
                        value={form.startTime}
                        onChange={e => setForm({ ...form, startTime: e.target.value })}
                        style={{ ...getInputStyle('startTime'), fontSize: 12 }}
                        onFocus={() => setFocusedField('startTime')}
                        onBlur={() => setFocusedField('')}
                      >
                        <option value="" style={{ background: '#080d1a' }}>— Start —</option>
                        {TIME_SLOTS.map(t => (
                          <option key={t.value} value={t.value} style={{ background: '#080d1a' }}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* End Time */}
                    <div>
                      <div style={{ fontSize: 10, color: '#2a3548', marginBottom: 5, fontWeight: 500 }}>End</div>
                      <select
                        value={form.endTime}
                        onChange={e => setForm({ ...form, endTime: e.target.value })}
                        style={{ ...getInputStyle('endTime'), fontSize: 12 }}
                        onFocus={() => setFocusedField('endTime')}
                        onBlur={() => setFocusedField('')}
                      >
                        <option value="" style={{ background: '#080d1a' }}>— End —</option>
                        {TIME_SLOTS
                          .filter(t => !form.startTime || t.value > form.startTime)
                          .map(t => (
                            <option key={t.value} value={t.value} style={{ background: '#080d1a' }}>
                              {t.label}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Preview */}
                  {form.day && form.startTime && form.endTime && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      marginTop: 10, padding: '7px 12px',
                      background: 'rgba(201,168,76,0.06)',
                      border: '1px solid rgba(201,168,76,0.15)',
                      borderRadius: 8,
                      fontSize: 11, fontWeight: 500, color: '#c9a84c',
                    }}>
                      <HiCalendarDays style={{ width: 13, height: 13 }} />
                      {form.day} · {TIME_SLOTS.find(t => t.value === form.startTime)?.label} – {TIME_SLOTS.find(t => t.value === form.endTime)?.label}
                    </div>
                  )}
                </div>

                {/* Prerequisites */}
                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>
                    Prerequisites{' '}
                    <span style={{ color: '#2a3548', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                      (comma-separated)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.prerequisites}
                    onChange={e => setForm({ ...form, prerequisites: e.target.value })}
                    placeholder="CS101, CS201"
                    style={getInputStyle('prerequisites')}
                    onFocus={() => setFocusedField('prerequisites')}
                    onBlur={() => setFocusedField('')}
                  />
                </div>

                {/* Gold divider */}
                <div style={{ height: 1, background: 'rgba(201,168,76,0.1)', marginBottom: 20 }} />

                {/* Submit */}
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    width: '100%', padding: '13px',
                    background: saving ? 'rgba(201,168,76,0.15)' : '#c9a84c',
                    color: saving ? '#3a4a60' : '#080d1a',
                    fontSize: 14, fontWeight: 700,
                    border: 'none', borderRadius: 10,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    letterSpacing: '0.02em', transition: 'all 0.2s',
                  }}
                >
                  {saving ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <span style={{
                        width: 14, height: 14,
                        border: '2px solid #3a4a60',
                        borderTopColor: '#c9a84c',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'spin 0.7s linear infinite',
                      }} />
                      Saving…
                    </span>
                  ) : editing ? 'Update Course' : 'Add Course'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}