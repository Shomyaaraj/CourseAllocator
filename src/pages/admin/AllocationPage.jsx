import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../../firebase';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { runAllocation } from '../../utils/allocationEngine';
import {
  HiCpuChip, HiPlay, HiCheckBadge, HiExclamationTriangle,
  HiChartBar, HiInformationCircle, HiUsers,
  HiBookOpen, HiAcademicCap,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

const pageStyle = {
  fontFamily: "'DM Sans', sans-serif",
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

const cardStyle = {
  background: '#0d1425',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 14,
  overflow: 'hidden',
};

const thStyle = {
  textAlign: 'left',
  fontSize: 10,
  fontWeight: 600,
  color: '#3a4a60',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  padding: '11px 16px',
  background: '#080d1a',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: '12px 16px',
  fontSize: 13,
  color: '#8a94a8',
  borderBottom: '1px solid rgba(255,255,255,0.03)',
  verticalAlign: 'middle',
};

export default function AllocationPage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [filter, setFilter] = useState('all');

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

  async function handleRunAllocation() {
    if (!confirm('Run the Gale-Shapley allocation? This will replace any existing allocations.')) return;
    setRunning(true);
    try {
      const existingSnap = await getDocs(collection(db, 'allocations'));
      const batch = writeBatch(db);
      existingSnap.forEach(d => batch.delete(d.ref));
      const usersSnap = await getDocs(collection(db, 'users'));
      usersSnap.docs
        .filter(d => d.data().role === 'student')
        .forEach(d => batch.update(d.ref, { allocatedCourse: null }));
      await batch.commit();

      const { allocations: results, updatedCourses } = runAllocation(students, courses);

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
      toast.success(`Stable allocation complete — ${numAllocated}/${results.length} students allocated.`);
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
    } catch {
      toast.error('Override failed');
    }
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

  function cgpaBadgeStyle(cgpa) {
    if (cgpa >= 8) return { background: 'rgba(29,158,117,0.12)', color: '#1d9e75', border: '1px solid rgba(29,158,117,0.2)' };
    if (cgpa >= 6) return { background: 'rgba(55,138,221,0.12)', color: '#378add', border: '1px solid rgba(55,138,221,0.2)' };
    return { background: 'rgba(186,117,23,0.12)', color: '#ba7517', border: '1px solid rgba(186,117,23,0.2)' };
  }

  function prefBadgeStyle(rank) {
    if (rank === 1) return { background: 'rgba(201,168,76,0.12)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.2)' };
    if (rank === 2) return { background: 'rgba(55,138,221,0.1)', color: '#378add', border: '1px solid rgba(55,138,221,0.15)' };
    return { background: 'rgba(255,255,255,0.04)', color: '#5e6d85', border: '1px solid rgba(255,255,255,0.07)' };
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
      style={pageStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Algorithm Info Banner ── */}
      <div style={{
        ...cardStyle,
        background: '#0d1425',
        border: '1px solid rgba(201,168,76,0.15)',
        padding: '20px 22px',
        backgroundImage: `linear-gradient(rgba(180,160,100,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(180,160,100,0.025) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: 'rgba(201,168,76,0.1)',
            border: '1px solid rgba(201,168,76,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <HiCpuChip style={{ width: 22, height: 22, color: '#c9a84c' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 16, fontWeight: 700, color: '#f0ece0', marginBottom: 6,
            }}>
              Gale-Shapley Stable Matching Algorithm
            </div>
            <div style={{ width: 40, height: 2, background: '#c9a84c', marginBottom: 10 }} />
            <p style={{ fontSize: 13, color: '#3a4a60', lineHeight: 1.7, margin: 0 }}>
              Students propose to courses in preference order. Courses accept the highest-CGPA
              students and eject lower-priority students when seats fill. This guarantees
              stability — no student and course would mutually prefer each other over their
              current assignment.
            </p>
          </div>
          <button
            onClick={handleRunAllocation}
            disabled={running || studentsWithPrefs.length === 0}
            style={{
              flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '11px 20px',
              background: running || studentsWithPrefs.length === 0
                ? 'rgba(29,158,117,0.15)'
                : '#1d9e75',
              color: running || studentsWithPrefs.length === 0 ? '#3a4a60' : '#080d1a',
              fontSize: 13, fontWeight: 700,
              border: 'none', borderRadius: 10,
              cursor: running || studentsWithPrefs.length === 0 ? 'not-allowed' : 'pointer',
              opacity: studentsWithPrefs.length === 0 ? 0.5 : 1,
              letterSpacing: '0.02em',
              transition: 'all 0.2s',
              alignSelf: 'flex-start',
            }}
          >
            {running ? (
              <>
                <span style={{
                  width: 14, height: 14,
                  border: '2px solid #3a4a60',
                  borderTopColor: '#1d9e75',
                  borderRadius: '50%',
                  display: 'inline-block',
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
        {/* Total Students */}
        <div style={{ ...cardStyle, padding: '18px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, marginBottom: 12,
            background: 'rgba(55,138,221,0.1)',
            border: '1px solid rgba(55,138,221,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <HiUsers style={{ width: 17, height: 17, color: '#378add' }} />
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#e8e2d0', lineHeight: 1 }}>
            {students.length}
          </div>
          <div style={{ fontSize: 11, color: '#3a4a60', fontWeight: 500, marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Total Students
          </div>
        </div>

        {/* With Preferences */}
        <div style={{ ...cardStyle, padding: '18px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, marginBottom: 12,
            background: 'rgba(127,119,221,0.1)',
            border: '1px solid rgba(127,119,221,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <HiAcademicCap style={{ width: 17, height: 17, color: '#7f77dd' }} />
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#e8e2d0', lineHeight: 1 }}>
            {studentsWithPrefs.length}
          </div>
          <div style={{ fontSize: 11, color: '#3a4a60', fontWeight: 500, marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            With Preferences
          </div>
        </div>

        {/* Courses Available */}
        <div style={{ ...cardStyle, padding: '18px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, marginBottom: 12,
            background: 'rgba(201,168,76,0.1)',
            border: '1px solid rgba(201,168,76,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <HiBookOpen style={{ width: 17, height: 17, color: '#c9a84c' }} />
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#e8e2d0', lineHeight: 1 }}>
            {courses.length}
          </div>
          <div style={{ fontSize: 11, color: '#3a4a60', fontWeight: 500, marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Courses Available
          </div>
        </div>

        {/* No Preferences */}
        <div style={{ ...cardStyle, padding: '18px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, marginBottom: 12,
            background: 'rgba(186,117,23,0.1)',
            border: '1px solid rgba(186,117,23,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <HiExclamationTriangle style={{ width: 17, height: 17, color: '#ba7517' }} />
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#e8e2d0', lineHeight: 1 }}>
            {studentsWithoutPrefs.length}
          </div>
          <div style={{ fontSize: 11, color: '#3a4a60', fontWeight: 500, marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            No Preferences
          </div>
        </div>
      </div>

      {/* ── Post-run Summary ── */}
      {hasRun && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1, background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14, overflow: 'hidden',
        }}>
          {/* Processed */}
          <div style={{ background: '#0d1425', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#3a4a60', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 8 }}>
              Processed
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#e8e2d0' }}>
              {allocations.length}
            </div>
          </div>
          {/* Allocated */}
          <div style={{ background: '#0d1425', padding: '20px', textAlign: 'center', borderLeft: '1px solid rgba(29,158,117,0.15)', borderRight: '1px solid rgba(29,158,117,0.15)' }}>
            <div style={{ fontSize: 11, color: '#1d9e75', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 8 }}>
              Allocated
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#1d9e75' }}>
              {allocated.length}
            </div>
          </div>
          {/* Unallocated */}
          <div style={{ background: '#0d1425', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#e24b4a', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 8 }}>
              Unallocated
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#e24b4a' }}>
              {unallocated.length}
            </div>
          </div>
        </div>
      )}

      {/* ── Results Table ── */}
      {hasRun && allocations.length > 0 && (
        <div style={cardStyle}>

          {/* Table header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <HiChartBar style={{ width: 15, height: 15, color: '#c9a84c' }} />
              <span style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 15, fontWeight: 700, color: '#e8e2d0',
              }}>
                Allocation Results
              </span>
              <span style={{
                fontSize: 11, fontWeight: 600, color: '#c9a84c',
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.2)',
                padding: '2px 8px', borderRadius: 100,
              }}>
                {displayedAllocations.length}
              </span>
            </div>

            {/* Filter tabs */}
            <div style={{
              display: 'flex', gap: 4,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 9, padding: 3,
            }}>
              <button
                onClick={() => setFilter('all')}
                style={{
                  padding: '5px 12px', fontSize: 11, fontWeight: 600,
                  borderRadius: 7, border: 'none', cursor: 'pointer',
                  background: filter === 'all' ? '#c9a84c' : 'transparent',
                  color: filter === 'all' ? '#080d1a' : '#3a4a60',
                  transition: 'all 0.15s',
                }}
              >
                All
              </button>
              <button
                onClick={() => setFilter('allocated')}
                style={{
                  padding: '5px 12px', fontSize: 11, fontWeight: 600,
                  borderRadius: 7, border: 'none', cursor: 'pointer',
                  background: filter === 'allocated' ? 'rgba(29,158,117,0.2)' : 'transparent',
                  color: filter === 'allocated' ? '#1d9e75' : '#3a4a60',
                  transition: 'all 0.15s',
                }}
              >
                Allocated
              </button>
              <button
                onClick={() => setFilter('unallocated')}
                style={{
                  padding: '5px 12px', fontSize: 11, fontWeight: 600,
                  borderRadius: 7, border: 'none', cursor: 'pointer',
                  background: filter === 'unallocated' ? 'rgba(226,75,74,0.15)' : 'transparent',
                  color: filter === 'unallocated' ? '#e24b4a' : '#3a4a60',
                  transition: 'all 0.15s',
                }}
              >
                Unallocated
              </button>
            </div>
          </div>

          {/* Table */}
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
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Student */}
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                          background: 'rgba(201,168,76,0.1)',
                          border: '1px solid rgba(201,168,76,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700, color: '#c9a84c',
                        }}>
                          {alloc.studentName?.charAt(0) || '?'}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#e8e2d0' }}>
                          {alloc.studentName}
                        </span>
                      </div>
                    </td>

                    {/* Reg No */}
                    <td style={tdStyle}>{alloc.registrationNumber || '—'}</td>

                    {/* CGPA */}
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      {alloc.cgpa != null ? (
                        <span style={{
                          fontSize: 11, fontWeight: 700,
                          padding: '3px 8px', borderRadius: 6,
                          ...cgpaBadgeStyle(alloc.cgpa),
                        }}>
                          {Number(alloc.cgpa).toFixed(2)}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: '#2a3548' }}>—</span>
                      )}
                    </td>

                    {/* Department */}
                    <td style={{ ...tdStyle, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {alloc.department || '—'}
                    </td>

                    {/* Allocated Course */}
                    <td style={tdStyle}>
                      {alloc.allocatedCourse ? (
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: '#e8e2d0' }}>
                            {alloc.courseName || alloc.allocatedCourse}
                          </div>
                          {alloc.timetableSlot && (
                            <div style={{ fontSize: 10, color: '#3a4a60', marginTop: 2 }}>
                              {alloc.timetableSlot}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          fontSize: 11, fontWeight: 600, color: '#e24b4a',
                          background: 'rgba(226,75,74,0.08)',
                          border: '1px solid rgba(226,75,74,0.15)',
                          padding: '3px 8px', borderRadius: 6,
                        }}>
                          <HiExclamationTriangle style={{ width: 11, height: 11 }} />
                          Unallocated
                        </span>
                      )}
                    </td>

                    {/* Pref Rank */}
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      {alloc.preferenceRank ? (
                        <span style={{
                          fontSize: 11, fontWeight: 700,
                          padding: '3px 9px', borderRadius: 6,
                          ...prefBadgeStyle(alloc.preferenceRank),
                        }}>
                          #{alloc.preferenceRank}
                        </span>
                      ) : (
                        <span style={{ color: '#2a3548', fontSize: 12 }}>—</span>
                      )}
                    </td>

                    {/* Override */}
                    <td style={tdStyle}>
                      <select
                        defaultValue=""
                        onChange={e => handleOverride(alloc, e.target.value)}
                        style={{
                          fontSize: 11, fontWeight: 500,
                          padding: '6px 10px',
                          background: '#080d1a',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 8,
                          color: '#5e6d85',
                          outline: 'none',
                          cursor: 'pointer',
                          minWidth: 130,
                        }}
                        onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                      >
                        <option value="" style={{ background: '#080d1a' }}>Manual Override</option>
                        {courses.map(c => (
                          <option
                            key={c.id}
                            value={c.courseId || c.id}
                            style={{ background: '#080d1a' }}
                          >
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

          {/* CGPA Legend footer */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
            padding: '12px 20px',
            borderTop: '1px solid rgba(255,255,255,0.04)',
            background: 'rgba(255,255,255,0.01)',
          }}>
            <span style={{ fontSize: 10, color: '#2a3548', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              CGPA:
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#1d9e75' }}>
              <span style={{ width: 8, height: 8, borderRadius: 3, background: '#1d9e75', display: 'inline-block' }} />
              ≥ 8.0 High
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#378add' }}>
              <span style={{ width: 8, height: 8, borderRadius: 3, background: '#378add', display: 'inline-block' }} />
              6.0 – 7.9
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#ba7517' }}>
              <span style={{ width: 8, height: 8, borderRadius: 3, background: '#ba7517', display: 'inline-block' }} />
              {'< 6.0'}
            </span>
            <span style={{
              marginLeft: 'auto',
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 11, color: '#2a3548',
            }}>
              <HiInformationCircle style={{ width: 13, height: 13 }} />
              Pref rank #1 = first choice allocated
            </span>
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {!hasRun && (
        <div style={{ ...cardStyle, padding: '60px 24px', textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'rgba(201,168,76,0.08)',
            border: '1px solid rgba(201,168,76,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <HiCpuChip style={{ width: 32, height: 32, color: '#c9a84c' }} />
          </div>
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 20, fontWeight: 700, color: '#e8e2d0', marginBottom: 10,
          }}>
            No Allocation Run Yet
          </div>
          <div style={{ width: 40, height: 2, background: '#c9a84c', margin: '0 auto 14px' }} />
          <p style={{ fontSize: 13, color: '#3a4a60', lineHeight: 1.7, maxWidth: 400, margin: '0 auto' }}>
            Click <strong style={{ color: '#8a94a8' }}>Run Allocation</strong> above to execute the
            Gale-Shapley stable matching algorithm across all students and their preferences.
          </p>
        </div>
      )}

    </motion.div>
  );
}