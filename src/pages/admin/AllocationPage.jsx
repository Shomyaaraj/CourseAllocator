import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { runAllocation } from '../../utils/allocationEngine';
import { useTheme } from 'styled-components';
import {
  HiCpuChip, HiPlay, HiCheckBadge, HiExclamationTriangle,
  HiChartBar, HiInformationCircle, HiUsers,
  HiBookOpen, HiAcademicCap, HiSparkles, HiShieldCheck,
  HiXMark, HiArrowPath,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────
   Run-Mode Confirmation Modal
───────────────────────────────────────────── */
function RunModeModal({ open, onClose, onConfirm, unallocatedCount, totalCount, theme }) {
  const isDark = theme.mode === 'dark';
  const accentColor = theme.colors.accent;
  const textMain = isDark ? '#e8e2d0' : theme.colors.primary;
  const textMuted = isDark ? '#6a7a90' : theme.colors.textLight;
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : theme.colors.border;
  const cardBg = isDark ? '#0d1425' : theme.colors.cardBg;
  const overlayBg = isDark ? 'rgba(5,8,18,0.85)' : 'rgba(0,0,0,0.45)';

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: overlayBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
            padding: 20,
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            style={{
              background: cardBg,
              border: '1px solid ' + borderColor,
              borderRadius: 18,
              padding: '32px 28px',
              maxWidth: 460,
              width: '100%',
              boxShadow: isDark
                ? '0 24px 64px rgba(0,0,0,0.6)'
                : '0 24px 64px rgba(0,0,0,0.15)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: isDark ? 'rgba(201,168,76,0.1)' : 'rgba(255,130,92,0.1)',
                  border: '1px solid ' + (isDark ? 'rgba(201,168,76,0.2)' : 'rgba(255,130,92,0.2)'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <HiCpuChip style={{ width: 20, height: 20, color: accentColor }} />
                </div>
                <div>
                  <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 17, fontWeight: 700, color: textMain }}>
                    Run Allocation
                  </div>
                  <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>
                    Choose which students to process
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 28, height: 28, borderRadius: 8, border: 'none',
                  background: isDark ? 'rgba(255,255,255,0.05)' : theme.colors.secondaryBg,
                  color: textMuted, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <HiXMark style={{ width: 14, height: 14 }} />
              </button>
            </div>

            <div style={{ width: '100%', height: 1, background: borderColor, marginBottom: 22 }} />

            {/* Info note about random fallback */}
            <div style={{
              padding: '11px 14px',
              background: isDark ? 'rgba(127,119,221,0.07)' : 'rgba(127,119,221,0.06)',
              border: '1px solid rgba(127,119,221,0.18)',
              borderRadius: 10,
              marginBottom: 20,
              display: 'flex', alignItems: 'flex-start', gap: 9,
            }}>
              <HiSparkles style={{ width: 14, height: 14, color: '#7f77dd', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: isDark ? '#9d97e8' : '#5b56b0', margin: 0, lineHeight: 1.6 }}>
                Students with <strong>no preferences</strong> or who <strong>don't match any course</strong> will be automatically assigned a random available course.
              </p>
            </div>

            {/* Mode Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>

              {/* All Students */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onConfirm('all')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 18px',
                  background: isDark ? 'rgba(29,158,117,0.07)' : 'rgba(29,158,117,0.05)',
                  border: '1px solid rgba(29,158,117,0.2)',
                  borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(29,158,117,0.12)',
                  border: '1px solid rgba(29,158,117,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <HiArrowPath style={{ width: 17, height: 17, color: '#1d9e75' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1d9e75', marginBottom: 3 }}>
                    All Students
                  </div>
                  <div style={{ fontSize: 12, color: textMuted, lineHeight: 1.5 }}>
                    Clear all existing allocations and re-run from scratch for all <strong style={{ color: textMain }}>{totalCount}</strong> students.
                  </div>
                </div>
              </motion.button>

              {/* Unallocated Only */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onConfirm('unallocated')}
                disabled={unallocatedCount === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 18px',
                  background: unallocatedCount === 0
                    ? (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)')
                    : (isDark ? 'rgba(55,138,221,0.07)' : 'rgba(55,138,221,0.05)'),
                  border: '1px solid ' + (unallocatedCount === 0
                    ? borderColor
                    : 'rgba(55,138,221,0.2)'),
                  borderRadius: 12,
                  cursor: unallocatedCount === 0 ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  opacity: unallocatedCount === 0 ? 0.5 : 1,
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(55,138,221,0.12)',
                  border: '1px solid rgba(55,138,221,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <HiShieldCheck style={{ width: 17, height: 17, color: '#378add' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#378add', marginBottom: 3 }}>
                    Unallocated Students Only
                  </div>
                  <div style={{ fontSize: 12, color: textMuted, lineHeight: 1.5 }}>
                    Keep existing allocations and only process the <strong style={{ color: textMain }}>{unallocatedCount}</strong> unallocated student{unallocatedCount !== 1 ? 's' : ''}.
                    {unallocatedCount === 0 && ' (None currently unallocated)'}
                  </div>
                </div>
              </motion.button>

            </div>

            <button
              onClick={onClose}
              style={{
                width: '100%', padding: '10px',
                background: 'transparent',
                border: '1px solid ' + borderColor,
                borderRadius: 10, color: textMuted,
                fontSize: 13, fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────
   Main AllocationPage
───────────────────────────────────────────── */
export default function AllocationPage() {
  const theme = useTheme();
  const isDark = theme.mode === 'dark';

  const accentColor = theme.colors.accent;
  const textMain = isDark ? '#e8e2d0' : theme.colors.primary;
  const textMuted = isDark ? '#3a4a60' : theme.colors.textLight;
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : theme.colors.border;
  const cardBg = isDark ? '#0d1425' : theme.colors.cardBg;
  const rowHoverBg = isDark ? 'rgba(255,255,255,0.02)' : theme.colors.secondaryBg;
  const selectBg = isDark ? '#080d1a' : theme.colors.secondaryBg;
  const selectOptionBg = isDark ? '#080d1a' : '#ffffff';

  const pageStyle = { fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column', gap: 16 };
  const cardStyle = { background: cardBg, border: '1px solid ' + borderColor, borderRadius: 14, overflow: 'hidden' };
  const thStyle = {
    textAlign: 'left', fontSize: 10, fontWeight: 600, color: textMuted,
    textTransform: 'uppercase', letterSpacing: '0.1em', padding: '11px 16px',
    background: isDark ? '#080d1a' : theme.colors.secondaryBg,
    borderBottom: '1px solid ' + borderColor, whiteSpace: 'nowrap',
  };
  const tdStyle = {
    padding: '12px 16px', fontSize: 13,
    color: isDark ? '#8a94a8' : textMuted,
    borderBottom: '1px solid ' + (isDark ? 'rgba(255,255,255,0.03)' : borderColor),
    verticalAlign: 'middle',
  };

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const [studentsSnap, coursesSnap, allocSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'courses')),
        getDocs(collection(db, 'allocations')),
      ]);
      setStudents(
        studentsSnap.docs
          .filter(d => d.data().role === 'student')
          .map(d => ({ id: d.id, ...d.data() }))
      );
      setCourses(coursesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      const existingAllocs = allocSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllocations(existingAllocs);
      if (existingAllocs.length > 0) setHasRun(true);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  // Called when admin picks a mode from the modal
  async function handleRunAllocation(mode) {
    setShowModal(false);
    setRunning(true);

    try {
      if (mode === 'all') {
        /* ── Full reset ── */
        const existingSnap = await getDocs(collection(db, 'allocations'));
        const batch = writeBatch(db);
        existingSnap.forEach(d => batch.delete(d.ref));
        const usersSnap = await getDocs(collection(db, 'users'));
        usersSnap.docs
          .filter(d => d.data().role === 'student')
          .forEach(d => batch.update(d.ref, { allocatedCourse: null }));
        await batch.commit();

        const { allocations: results, updatedCourses } = runAllocation(students, courses);
        await writeResults(results, updatedCourses);

        const numAllocated = results.filter(r => r.allocatedCourse).length;
        const numRandom = results.filter(r => r.randomlyAssigned).length;
        toast.success(
          `Allocation complete — ${numAllocated}/${results.length} allocated` +
          (numRandom > 0 ? ` (${numRandom} randomly assigned)` : '') + '.'
        );

      } else {
        /* ── Unallocated only ── */
        // Use the set of student IDs that already have a course — this catches
        // new students who have NO allocation document at all.
        const allocatedStudentIds = new Set(
          allocations.filter(a => a.allocatedCourse).map(a => a.studentId)
        );
        const studentsToProcess = students.filter(s => !allocatedStudentIds.has(s.id));
        const skipIds = students.filter(s => allocatedStudentIds.has(s.id)).map(s => s.id);

        const { allocations: results, updatedCourses } = runAllocation(
          studentsToProcess,
          courses,
          skipIds
        );
        await writeResults(results, updatedCourses, /* partial */ true);

        const numAllocated = results.filter(r => r.allocatedCourse).length;
        const numRandom = results.filter(r => r.randomlyAssigned).length;
        toast.success(
          `Partial allocation complete — ${numAllocated}/${studentsToProcess.length} newly allocated` +
          (numRandom > 0 ? ` (${numRandom} randomly assigned)` : '') + '.'
        );
      }

      setHasRun(true);
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error('Allocation failed: ' + e.message);
    }
    setRunning(false);
  }

  async function writeResults(results, updatedCourses, partial = false) {
    const batch2 = writeBatch(db);

    if (!partial) {
      // For full run: write all new allocations
      for (const alloc of results) {
        const allocRef = doc(collection(db, 'allocations'));
        batch2.set(allocRef, alloc);
        if (alloc.allocatedCourse) {
          batch2.update(doc(db, 'users', alloc.studentId), {
            allocatedCourse: alloc.allocatedCourse,
          });
        }
      }
    } else {
      // For partial: only upsert the newly processed students
      const existingSnap = await getDocs(collection(db, 'allocations'));
      for (const alloc of results) {
        const existingDoc = existingSnap.docs.find(d => d.data().studentId === alloc.studentId);
        if (existingDoc) {
          batch2.update(existingDoc.ref, {
            allocatedCourse: alloc.allocatedCourse,
            courseName: alloc.courseName,
            timetableSlot: alloc.timetableSlot,
            preferenceRank: alloc.preferenceRank,
            randomlyAssigned: alloc.randomlyAssigned,
            unallocated: alloc.unallocated,
            timestamp: alloc.timestamp,
          });
        } else {
          const allocRef = doc(collection(db, 'allocations'));
          batch2.set(allocRef, alloc);
        }
        if (alloc.allocatedCourse) {
          batch2.update(doc(db, 'users', alloc.studentId), {
            allocatedCourse: alloc.allocatedCourse,
          });
        }
      }
    }

    // Update course seats
    for (const course of updatedCourses) {
      const courseDoc = courses.find(c => (c.courseId || c.id) === (course.courseId || course.id));
      if (courseDoc) {
        batch2.update(doc(db, 'courses', courseDoc.id), {
          remainingSeats: course.remainingSeats,
        });
      }
    }
    await batch2.commit();
    setAllocations(results);
  }

  async function handleOverride(alloc, newCourseId) {
    if (!newCourseId) return;
    const student = students.find(s => s.id === alloc.studentId);
    const newCourse = courses.find(c => (c.courseId || c.id) === newCourseId);
    const oldCourse = courses.find(c => (c.courseId || c.id) === alloc.allocatedCourse);
    if (!student || !newCourse) { toast.error("Invalid data"); return; }
    if ((newCourse.remainingSeats ?? 0) <= 0) { toast.error("No seats available in selected course"); return; }
    if (newCourse.prerequisites?.length > 0) {
      const done = student.completedCourses || [];
      if (!newCourse.prerequisites.every(p => done.includes(p))) { toast.error("Prerequisites not satisfied"); return; }
    }
    if (newCourse.timetableSlot && student.allocatedCourse) {
      const occupiedSlot = courses.find(c => (c.courseId || c.id) === student.allocatedCourse)?.timetableSlot;
      if (occupiedSlot === newCourse.timetableSlot) { toast.error("Timetable clash detected"); return; }
    }
    try {
      const allocSnap = await getDocs(collection(db, 'allocations'));
      const allocDoc = allocSnap.docs.find(d => d.data().studentId === alloc.studentId);
      const b = writeBatch(db);
      if (allocDoc) {
        b.update(allocDoc.ref, { allocatedCourse: newCourseId, courseName: newCourse.courseName, overridden: true });
      }
      b.update(doc(db, 'users', alloc.studentId), { allocatedCourse: newCourseId });
      if (oldCourse) b.update(doc(db, 'courses', oldCourse.id), { remainingSeats: (oldCourse.remainingSeats ?? 0) + 1 });
      b.update(doc(db, 'courses', newCourse.id), { remainingSeats: (newCourse.remainingSeats ?? 0) - 1 });
      await b.commit();
      toast.success("Override applied ✅");
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error("Override failed");
    }
  }

  const allocated = allocations.filter(a => a.allocatedCourse);
  const allocatedStudentIds = new Set(allocated.map(a => a.studentId));
  // True unallocated = all students minus those with an allocated course,
  // including new students who have no allocation document yet.
  const unallocatedCount = students.length - allocatedStudentIds.size;
  const randomlyAssigned = allocations.filter(a => a.randomlyAssigned);
  const studentsWithPrefs = students.filter(s => s.preferences?.length > 0);
  const studentsWithoutPrefs = students.filter(s => !s.preferences?.length);

  const displayedAllocations = allocations.filter(a => {
    if (filter === 'allocated') return !!a.allocatedCourse;
    if (filter === 'unallocated') return !a.allocatedCourse;
    if (filter === 'random') return !!a.randomlyAssigned;
    return true;
  });

  function cgpaBadgeStyle(cgpa) {
    if (cgpa >= 8) return { background: 'rgba(29,158,117,0.12)', color: '#1d9e75', border: '1px solid rgba(29,158,117,0.2)' };
    if (cgpa >= 6) return { background: 'rgba(55,138,221,0.12)', color: '#378add', border: '1px solid rgba(55,138,221,0.2)' };
    return { background: 'rgba(186,117,23,0.12)', color: '#ba7517', border: '1px solid rgba(186,117,23,0.2)' };
  }

  function prefBadgeStyle(rank) {
    if (rank === 1) return { background: isDark ? 'rgba(201,168,76,0.12)' : 'rgba(255,130,92,0.12)', color: accentColor, border: '1px solid ' + (isDark ? 'rgba(201,168,76,0.2)' : 'rgba(255,130,92,0.2)') };
    if (rank === 2) return { background: 'rgba(55,138,221,0.1)', color: '#378add', border: '1px solid rgba(55,138,221,0.15)' };
    return { background: isDark ? 'rgba(255,255,255,0.04)' : theme.colors.secondaryBg, color: textMuted, border: '1px solid ' + borderColor };
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{
          width: 36, height: 36,
          border: '3px solid ' + (isDark ? 'rgba(201,168,76,0.15)' : 'rgba(255,130,92,0.15)'),
          borderTopColor: accentColor, borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <motion.div style={pageStyle} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Run Mode Modal ── */}
      <RunModeModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleRunAllocation}
        unallocatedCount={unallocatedCount}
        totalCount={students.length}
        theme={theme}
      />

      {/* ── Algorithm Info Banner ── */}
      <div style={{
        ...cardStyle,
        border: '1px solid ' + (isDark ? 'rgba(201,168,76,0.15)' : 'rgba(255,130,92,0.2)'),
        padding: '20px 22px',
        backgroundImage: 'linear-gradient(rgba(180,160,100,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(180,160,100,0.025) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: isDark ? 'rgba(201,168,76,0.1)' : 'rgba(255,130,92,0.1)',
            border: '1px solid ' + (isDark ? 'rgba(201,168,76,0.2)' : 'rgba(255,130,92,0.2)'),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <HiCpuChip style={{ width: 22, height: 22, color: accentColor }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 16, fontWeight: 700, color: textMain, marginBottom: 6 }}>
              Gale-Shapley Stable Matching Algorithm
            </div>
            <div style={{ width: 40, height: 2, background: accentColor, marginBottom: 10 }} />
            <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.7, margin: 0 }}>
              Students propose in preference order. Highest-CGPA students are accepted first.
              Students with no preferences or no matching course are <strong style={{ color: isDark ? '#9d97e8' : '#5b56b0' }}>randomly assigned</strong> to any available seat.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            disabled={running || students.length === 0}
            style={{
              flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '11px 20px',
              background: running || students.length === 0 ? 'rgba(29,158,117,0.15)' : '#1d9e75',
              color: running || students.length === 0 ? textMuted : '#080d1a',
              fontSize: 13, fontWeight: 700,
              border: 'none', borderRadius: 10,
              cursor: running || students.length === 0 ? 'not-allowed' : 'pointer',
              opacity: students.length === 0 ? 0.5 : 1,
              letterSpacing: '0.02em',
              transition: 'all 0.2s',
              alignSelf: 'flex-start',
            }}
          >
            {running ? (
              <>
                <span style={{
                  width: 14, height: 14,
                  border: '2px solid ' + textMuted, borderTopColor: '#1d9e75',
                  borderRadius: '50%', display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
                }} />
                Running…
              </>
            ) : (
              <>
                <HiPlay style={{ width: 15, height: 15 }} />
                Run Allocation
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Pre-run Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <div style={{ ...cardStyle, padding: '18px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, marginBottom: 12, background: 'rgba(55,138,221,0.1)', border: '1px solid rgba(55,138,221,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HiUsers style={{ width: 17, height: 17, color: '#378add' }} />
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: textMain, lineHeight: 1 }}>{students.length}</div>
          <div style={{ fontSize: 11, color: textMuted, fontWeight: 500, marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Students</div>
        </div>
        <div style={{ ...cardStyle, padding: '18px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, marginBottom: 12, background: 'rgba(127,119,221,0.1)', border: '1px solid rgba(127,119,221,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HiAcademicCap style={{ width: 17, height: 17, color: '#7f77dd' }} />
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: textMain, lineHeight: 1 }}>{studentsWithPrefs.length}</div>
          <div style={{ fontSize: 11, color: textMuted, fontWeight: 500, marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>With Preferences</div>
        </div>
        <div style={{ ...cardStyle, padding: '18px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, marginBottom: 12, background: isDark ? 'rgba(201,168,76,0.1)' : 'rgba(255,130,92,0.1)', border: '1px solid ' + (isDark ? 'rgba(201,168,76,0.15)' : 'rgba(255,130,92,0.2)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HiBookOpen style={{ width: 17, height: 17, color: accentColor }} />
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: textMain, lineHeight: 1 }}>{courses.length}</div>
          <div style={{ fontSize: 11, color: textMuted, fontWeight: 500, marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Courses Available</div>
        </div>
        <div style={{ ...cardStyle, padding: '18px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, marginBottom: 12, background: 'rgba(186,117,23,0.1)', border: '1px solid rgba(186,117,23,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HiExclamationTriangle style={{ width: 17, height: 17, color: '#ba7517' }} />
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: textMain, lineHeight: 1 }}>{studentsWithoutPrefs.length}</div>
          <div style={{ fontSize: 11, color: textMuted, fontWeight: 500, marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>No Preferences</div>
        </div>
      </div>

      {/* ── Post-run Summary ── */}
      {hasRun && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1,
          background: isDark ? 'rgba(255,255,255,0.05)' : borderColor,
          border: '1px solid ' + borderColor,
          borderRadius: 14, overflow: 'hidden',
        }}>
          <div style={{ background: cardBg, padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 8 }}>Processed</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: textMain }}>{allocations.length}</div>
          </div>
          <div style={{ background: cardBg, padding: '20px', textAlign: 'center', borderLeft: '1px solid rgba(29,158,117,0.15)' }}>
            <div style={{ fontSize: 11, color: '#1d9e75', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 8 }}>Allocated</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#1d9e75' }}>{allocated.length}</div>
          </div>
          <div style={{ background: cardBg, padding: '20px', textAlign: 'center', borderLeft: '1px solid rgba(127,119,221,0.15)' }}>
            <div style={{ fontSize: 11, color: '#7f77dd', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 8 }}>Randomly Assigned</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#7f77dd' }}>{randomlyAssigned.length}</div>
          </div>
          <div style={{ background: cardBg, padding: '20px', textAlign: 'center', borderLeft: '1px solid rgba(226,75,74,0.15)' }}>
            <div style={{ fontSize: 11, color: '#e24b4a', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 8 }}>Unallocated</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#e24b4a' }}>{unallocatedCount}</div>
          </div>
        </div>
      )}

      {/* ── Results Table ── */}
      {hasRun && allocations.length > 0 && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid ' + borderColor }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <HiChartBar style={{ width: 15, height: 15, color: accentColor }} />
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 15, fontWeight: 700, color: textMain }}>Allocation Results</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: accentColor, background: isDark ? 'rgba(201,168,76,0.1)' : 'rgba(255,130,92,0.1)', border: '1px solid ' + (isDark ? 'rgba(201,168,76,0.2)' : 'rgba(255,130,92,0.2)'), padding: '2px 8px', borderRadius: 100 }}>
                {displayedAllocations.length}
              </span>
            </div>
            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 4, background: isDark ? 'rgba(255,255,255,0.03)' : theme.colors.secondaryBg, border: '1px solid ' + borderColor, borderRadius: 9, padding: 3 }}>
              {[
                { key: 'all', label: 'All' },
                { key: 'allocated', label: 'Allocated', activeColor: 'rgba(29,158,117,0.2)', textColor: '#1d9e75' },
                { key: 'random', label: 'Random', activeColor: 'rgba(127,119,221,0.2)', textColor: '#7f77dd' },
                { key: 'unallocated', label: 'Unallocated', activeColor: 'rgba(226,75,74,0.15)', textColor: '#e24b4a' },
              ].map(({ key, label, activeColor, textColor }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  style={{
                    padding: '5px 12px', fontSize: 11, fontWeight: 600,
                    borderRadius: 7, border: 'none', cursor: 'pointer',
                    background: filter === key ? (activeColor || accentColor) : 'transparent',
                    color: filter === key ? (textColor || '#080d1a') : textMuted,
                    transition: 'all 0.15s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Student</th>
                  <th style={thStyle}>Reg No.</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>CGPA</th>
                  <th style={thStyle}>Department</th>
                  <th style={thStyle}>Allocated Course</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Pref Rank</th>
                  <th style={thStyle}>Override</th>
                </tr>
              </thead>
              <tbody>
                {displayedAllocations.map((alloc, idx) => (
                  <tr
                    key={idx}
                    style={{ transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = rowHoverBg}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Student */}
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                          background: isDark ? 'rgba(201,168,76,0.1)' : 'rgba(255,130,92,0.1)',
                          border: '1px solid ' + (isDark ? 'rgba(201,168,76,0.2)' : 'rgba(255,130,92,0.2)'),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700, color: accentColor,
                        }}>
                          {alloc.studentName?.charAt(0) || '?'}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: textMain }}>{alloc.studentName}</span>
                      </div>
                    </td>

                    {/* Reg No */}
                    <td style={tdStyle}>{alloc.registrationNumber || '—'}</td>

                    {/* CGPA */}
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      {alloc.cgpa != null ? (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, ...cgpaBadgeStyle(alloc.cgpa) }}>
                          {Number(alloc.cgpa).toFixed(2)}
                        </span>
                      ) : <span style={{ fontSize: 12, color: textMuted }}>—</span>}
                    </td>

                    {/* Department */}
                    <td style={{ ...tdStyle, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {alloc.department || '—'}
                    </td>

                    {/* Allocated Course */}
                    <td style={tdStyle}>
                      {alloc.allocatedCourse ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 500, color: textMain }}>
                              {alloc.courseName || alloc.allocatedCourse}
                            </span>
                            {/* Random assignment badge */}
                            {alloc.randomlyAssigned && (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 3,
                                fontSize: 10, fontWeight: 600, color: '#7f77dd',
                                background: 'rgba(127,119,221,0.1)',
                                border: '1px solid rgba(127,119,221,0.2)',
                                padding: '2px 6px', borderRadius: 5,
                              }}>
                                <HiSparkles style={{ width: 9, height: 9 }} />
                                Random
                              </span>
                            )}
                          </div>
                          {alloc.timetableSlot && (
                            <div style={{ fontSize: 10, color: textMuted, marginTop: 2 }}>{alloc.timetableSlot}</div>
                          )}
                        </div>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#e24b4a', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.15)', padding: '3px 8px', borderRadius: 6 }}>
                          <HiExclamationTriangle style={{ width: 11, height: 11 }} />
                          Unallocated
                        </span>
                      )}
                    </td>

                    {/* Pref Rank */}
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      {alloc.preferenceRank ? (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 6, ...prefBadgeStyle(alloc.preferenceRank) }}>
                          #{alloc.preferenceRank}
                        </span>
                      ) : alloc.randomlyAssigned ? (
                        <span style={{ fontSize: 11, color: '#7f77dd' }}>—</span>
                      ) : (
                        <span style={{ color: textMuted, fontSize: 12 }}>—</span>
                      )}
                    </td>

                    {/* Override */}
                    <td style={tdStyle}>
                      <select
                        defaultValue=""
                        onChange={e => handleOverride(alloc, e.target.value)}
                        style={{ fontSize: 11, fontWeight: 500, padding: '6px 10px', background: selectBg, border: '1px solid ' + borderColor, borderRadius: 8, color: textMuted, outline: 'none', cursor: 'pointer', minWidth: 130 }}
                        onFocus={e => e.target.style.borderColor = accentColor}
                        onBlur={e => e.target.style.borderColor = borderColor}
                      >
                        <option value="" style={{ background: selectOptionBg }}>Manual Override</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.courseId || c.id} style={{ background: selectOptionBg }}>
                            {c.courseName}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', padding: '12px 20px', borderTop: '1px solid ' + borderColor, background: isDark ? 'rgba(255,255,255,0.01)' : theme.colors.secondaryBg }}>
            <span style={{ fontSize: 10, color: textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>CGPA:</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#1d9e75' }}><span style={{ width: 8, height: 8, borderRadius: 3, background: '#1d9e75', display: 'inline-block' }} />≥ 8.0</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#378add' }}><span style={{ width: 8, height: 8, borderRadius: 3, background: '#378add', display: 'inline-block' }} />6.0–7.9</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#ba7517' }}><span style={{ width: 8, height: 8, borderRadius: 3, background: '#ba7517', display: 'inline-block' }} />{'< 6.0'}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#7f77dd', marginLeft: 8 }}>
              <HiSparkles style={{ width: 11, height: 11 }} /> Random = auto-assigned (no preference / no match)
            </span>
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: textMuted }}>
              <HiInformationCircle style={{ width: 13, height: 13 }} />
              Pref rank #1 = first choice
            </span>
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {!hasRun && (
        <div style={{ ...cardStyle, padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: isDark ? 'rgba(201,168,76,0.08)' : 'rgba(255,130,92,0.08)', border: '1px solid ' + (isDark ? 'rgba(201,168,76,0.15)' : 'rgba(255,130,92,0.2)'), display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <HiCpuChip style={{ width: 32, height: 32, color: accentColor }} />
          </div>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 700, color: textMain, marginBottom: 10 }}>No Allocation Run Yet</div>
          <div style={{ width: 40, height: 2, background: accentColor, margin: '0 auto 14px' }} />
          <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.7, maxWidth: 400, margin: '0 auto' }}>
            Click <strong style={{ color: isDark ? '#8a94a8' : theme.colors.primary }}>Run Allocation</strong> to execute the Gale-Shapley algorithm. Students without preferences will be randomly assigned to available seats.
          </p>
        </div>
      )}
    </motion.div>
  );
}