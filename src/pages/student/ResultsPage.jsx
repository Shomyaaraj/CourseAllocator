import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import {
  HiCheckBadge,
  HiClock,
  HiBookOpen,
  HiExclamationTriangle,
  HiQueueList,
  HiChartBar,
  HiCalendarDays,
  HiBuildingOffice2,
  HiSparkles,
} from 'react-icons/hi2';

const pageStyle = {
  fontFamily: "'DM Sans', sans-serif",
  maxWidth: 680,
  margin: '0 auto',
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

const metaLabelStyle = {
  display: 'flex', alignItems: 'center', gap: 5,
  fontSize: 10, fontWeight: 600,
  color: '#3a4a60',
  textTransform: 'uppercase', letterSpacing: '0.1em',
  marginBottom: 5,
};

const metaValueStyle = {
  fontSize: 14, fontWeight: 600, color: '#e8e2d0',
};

export default function ResultsPage() {
  const { currentUser, userProfile } = useAuth();
  const [allocation, setAllocation] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllocation() {
      try {
        const q = query(
          collection(db, 'allocations'),
          where('studentId', '==', currentUser.uid)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const allocData = { id: snap.docs[0].id, ...snap.docs[0].data() };
          setAllocation(allocData);
          if (allocData.allocatedCourse) {
            const coursesSnap = await getDocs(collection(db, 'courses'));
            const course = coursesSnap.docs
              .map(d => ({ id: d.id, ...d.data() }))
              .find(c => (c.courseId || c.id) === allocData.allocatedCourse);
            if (course) setCourseDetails(course);
          }
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchAllocation();
  }, [currentUser]);

  // ── Loading ──
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

  // ── Results Pending ──
  if (!allocation && !userProfile?.allocatedCourse) {
    return (
      <motion.div
        style={{ maxWidth: 440, margin: '0 auto', textAlign: 'center', padding: '80px 0', fontFamily: "'DM Sans', sans-serif" }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{
          width: 72, height: 72,
          background: 'rgba(201,168,76,0.08)',
          border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <HiClock style={{ width: 36, height: 36, color: '#c9a84c' }} />
        </div>
        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 24, fontWeight: 700, color: '#f0ece0', marginBottom: 10,
        }}>
          Results Pending
        </h2>
        <div style={{ width: 40, height: 2, background: '#c9a84c', margin: '0 auto 16px' }} />
        <p style={{ fontSize: 14, color: '#3a4a60', lineHeight: 1.7 }}>
          Course allocation has not been run yet. Once the administrator runs the
          Gale-Shapley algorithm, your result will appear here.
        </p>
      </motion.div>
    );
  }

  // ── Not Allocated ──
  if (allocation?.unallocated || (!allocation?.allocatedCourse && !userProfile?.allocatedCourse)) {
    return (
      <motion.div
        style={{ maxWidth: 480, margin: '0 auto', padding: '60px 0', fontFamily: "'DM Sans', sans-serif" }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 72, height: 72,
            background: 'rgba(226,75,74,0.08)',
            border: '1px solid rgba(226,75,74,0.2)',
            borderRadius: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <HiExclamationTriangle style={{ width: 36, height: 36, color: '#e24b4a' }} />
          </div>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 24, fontWeight: 700, color: '#f0ece0', marginBottom: 10,
          }}>
            Not Allocated
          </h2>
          <div style={{ width: 40, height: 2, background: '#e24b4a', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 14, color: '#3a4a60', lineHeight: 1.7 }}>
            Unfortunately, none of your preferred courses had seats available for
            your priority level. Please contact your administrator.
          </p>
        </div>

        {allocation?.preferences?.length > 0 && (
          <div style={{
            background: '#0d1425',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14, padding: '20px 20px',
          }}>
            <div style={{
              fontSize: 11, fontWeight: 600, color: '#3a4a60',
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14,
            }}>
              Your Preferences
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {allocation.preferences.map((pref, i) => (
                <div key={pref} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 9,
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                    background: 'rgba(201,168,76,0.1)',
                    border: '1px solid rgba(201,168,76,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: '#c9a84c',
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 13, color: '#5e6d85' }}>{pref}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  // ── Allocated ──
  const courseName = allocation?.courseName || courseDetails?.courseName || userProfile?.allocatedCourse || '—';
  const courseId = allocation?.allocatedCourse || '—';
  const prefRank = allocation?.preferenceRank;
  const timetableSlot = allocation?.timetableSlot || courseDetails?.timetableSlot;
  const department = courseDetails?.department;
  const allocatedAt = allocation?.timestamp
    ? new Date(allocation.timestamp.seconds ? allocation.timestamp.seconds * 1000 : allocation.timestamp)
    : null;

  return (
    <motion.div
      style={pageStyle}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Success Header ── */}
      <div style={{
        background: '#0d1425',
        border: '1px solid rgba(29,158,117,0.2)',
        borderRadius: 14,
        padding: '28px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle green glow */}
        <div style={{
          position: 'absolute', top: 0, left: '50%',
          transform: 'translateX(-50%)',
          width: 300, height: 120,
          background: 'radial-gradient(ellipse, rgba(29,158,117,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, delay: 0.2 }}
          style={{
            width: 68, height: 68,
            background: 'rgba(29,158,117,0.12)',
            border: '1px solid rgba(29,158,117,0.3)',
            borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            position: 'relative', zIndex: 2,
          }}
        >
          <HiCheckBadge style={{ width: 36, height: 36, color: '#1d9e75' }} />
        </motion.div>

        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 26, fontWeight: 700, color: '#f0ece0',
          margin: '0 0 8px', position: 'relative', zIndex: 2,
        }}>
          Course Allocated!
        </h2>
        <p style={{ fontSize: 13, color: '#3a4a60', margin: '0 0 16px', position: 'relative', zIndex: 2 }}>
          Your course has been assigned via Gale-Shapley stable matching
        </p>

        {prefRank && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 14px',
            background: 'rgba(201,168,76,0.1)',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: 100,
            fontSize: 12, fontWeight: 600, color: '#c9a84c',
            position: 'relative', zIndex: 2,
          }}>
            <HiSparkles style={{ width: 14, height: 14 }} />
            {prefRank === 1 ? 'First Choice Allocated!' : `Preference #${prefRank} Allocated`}
          </div>
        )}
      </div>

      {/* ── Course Details Card ── */}
      <div style={cardStyle}>
        {/* Card header */}
        <div style={{
          padding: '18px 24px',
          background: 'rgba(29,158,117,0.06)',
          borderBottom: '1px solid rgba(29,158,117,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
            <HiBookOpen style={{ width: 15, height: 15, color: '#1d9e75' }} />
            <span style={{
              fontSize: 10, fontWeight: 600, color: '#1d9e75',
              textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>
              Allocated Course
            </span>
          </div>
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 22, fontWeight: 700, color: '#f0ece0', marginBottom: 4,
          }}>
            {courseName}
          </div>
          {courseId !== courseName && (
            <div style={{ fontSize: 12, color: '#3a4a60' }}>{courseId}</div>
          )}
        </div>

        {/* Meta grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1,
          background: 'rgba(255,255,255,0.04)',
        }}>
          {department && (
            <div style={{ background: '#0d1425', padding: '16px 20px' }}>
              <div style={metaLabelStyle}>
                <HiBuildingOffice2 style={{ width: 12, height: 12 }} />
                Department
              </div>
              <div style={metaValueStyle}>{department}</div>
            </div>
          )}
          {timetableSlot && (
            <div style={{ background: '#0d1425', padding: '16px 20px' }}>
              <div style={metaLabelStyle}>
                <HiCalendarDays style={{ width: 12, height: 12 }} />
                Schedule
              </div>
              <div style={metaValueStyle}>{timetableSlot}</div>
            </div>
          )}
          {prefRank && (
            <div style={{ background: '#0d1425', padding: '16px 20px' }}>
              <div style={metaLabelStyle}>
                <HiQueueList style={{ width: 12, height: 12 }} />
                Preference Rank
              </div>
              <div style={metaValueStyle}>
                #{prefRank} of {allocation?.preferences?.length || '?'}
              </div>
            </div>
          )}
          {allocatedAt && (
            <div style={{ background: '#0d1425', padding: '16px 20px' }}>
              <div style={metaLabelStyle}>
                <HiClock style={{ width: 12, height: 12 }} />
                Allocated On
              </div>
              <div style={metaValueStyle}>
                {allocatedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          )}
        </div>

        {/* Override notice */}
        {allocation?.overridden && (
          <div style={{
            padding: '10px 20px',
            background: 'rgba(186,117,23,0.08)',
            borderTop: '1px solid rgba(186,117,23,0.15)',
          }}>
            <span style={{ fontSize: 12, color: '#ba7517', fontWeight: 500 }}>
              ⚡ This allocation was manually overridden by an administrator
            </span>
          </div>
        )}
      </div>

      {/* ── Preferences vs Result ── */}
      {userProfile?.preferences?.length > 0 && (
        <div style={cardStyle}>
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <HiQueueList style={{ width: 16, height: 16, color: '#c9a84c' }} />
              <span style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 15, fontWeight: 700, color: '#e8e2d0',
              }}>
                Your Preference Rankings
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {userProfile.preferences.map((pref, idx) => {
                const isAllocated =
                  pref === allocation?.allocatedCourse ||
                  pref === (courseDetails?.courseId || courseDetails?.id);
                return (
                  <div
                    key={pref}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '11px 14px',
                      background: isAllocated
                        ? 'rgba(29,158,117,0.07)'
                        : 'rgba(255,255,255,0.02)',
                      border: isAllocated
                        ? '1px solid rgba(29,158,117,0.2)'
                        : '1px solid rgba(255,255,255,0.05)',
                      borderRadius: 10,
                      transition: 'all 0.15s',
                    }}
                  >
                    {/* Rank badge */}
                    <div style={{
                      width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                      background: isAllocated
                        ? 'rgba(29,158,117,0.15)'
                        : 'rgba(201,168,76,0.08)',
                      border: isAllocated
                        ? '1px solid rgba(29,158,117,0.3)'
                        : '1px solid rgba(201,168,76,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700,
                      color: isAllocated ? '#1d9e75' : '#c9a84c',
                    }}>
                      {idx + 1}
                    </div>

                    {/* Course ID */}
                    <span style={{
                      flex: 1, fontSize: 13,
                      color: isAllocated ? '#e8e2d0' : '#5e6d85',
                      fontWeight: isAllocated ? 500 : 400,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {pref}
                    </span>

                    {/* Allocated badge */}
                    {isAllocated && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        flexShrink: 0,
                        fontSize: 11, fontWeight: 600, color: '#1d9e75',
                        background: 'rgba(29,158,117,0.1)',
                        border: '1px solid rgba(29,158,117,0.2)',
                        padding: '3px 10px', borderRadius: 100,
                      }}>
                        <HiCheckBadge style={{ width: 12, height: 12 }} />
                        Allocated
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── CGPA Strip ── */}
      {userProfile?.cgpa && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '16px 20px',
          background: '#0d1425',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: 'rgba(201,168,76,0.08)',
            border: '1px solid rgba(201,168,76,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <HiChartBar style={{ width: 18, height: 18, color: '#c9a84c' }} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#3a4a60', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 3 }}>
              CGPA used for priority ranking
            </div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 20, fontWeight: 700, color: '#c9a84c',
            }}>
              {Number(userProfile.cgpa).toFixed(2)}
              <span style={{ fontSize: 13, color: '#3a4a60', fontFamily: "'DM Sans', sans-serif", marginLeft: 4 }}>
                / 10.0
              </span>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
}