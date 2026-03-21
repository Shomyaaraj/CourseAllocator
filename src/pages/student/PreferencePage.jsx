import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useTheme } from 'styled-components';
import {
  HiArrowsUpDown, HiClock, HiCheckCircle, HiXCircle,
  HiSparkles, HiChevronUp, HiChevronDown, HiTrash, HiChartBar,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function PreferencePage() {
  const { currentUser, userProfile, setUserProfile } = useAuth();
  const theme = useTheme();
  const isDark = theme.mode === 'dark';

  const accentColor = theme.colors.accent;
  const textMain = isDark ? '#e8e2d0' : theme.colors.primary;
  const textMuted = isDark ? '#3a4a60' : theme.colors.textLight;
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : theme.colors.border;
  const cardBg = isDark ? '#0d1425' : theme.colors.cardBg;

  const cardStyle = {
    background: cardBg,
    border: '1px solid ' + borderColor,
    borderRadius: 14,
    padding: '24px',
  };

  const sectionTitleStyle = {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 16, fontWeight: 700, color: textMain, margin: '0 0 16px',
  };

  const labelStyle = {
    fontSize: 11, fontWeight: 600, color: textMuted,
    textTransform: 'uppercase', letterSpacing: '0.1em',
  };

  const badgeStyle = {
    fontSize: 11, fontWeight: 600, color: accentColor,
    background: isDark ? 'rgba(201,168,76,0.1)' : 'rgba(255,130,92,0.1)',
    border: '1px solid ' + (isDark ? 'rgba(201,168,76,0.2)' : 'rgba(255,130,92,0.2)'),
    padding: '3px 10px', borderRadius: 100,
  };

  const timerBoxStyle = {
    background: isDark ? 'rgba(201,168,76,0.08)' : 'rgba(255,130,92,0.06)',
    border: '1px solid ' + (isDark ? 'rgba(201,168,76,0.15)' : 'rgba(255,130,92,0.2)'),
    borderRadius: 10, padding: '10px 16px', textAlign: 'center', minWidth: 64,
  };

  const [courses, setCourses] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deadline, setDeadline] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [cgpaInput, setCgpaInput] = useState('');
  const [savingCgpa, setSavingCgpa] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const coursesSnap = await getDocs(collection(db, 'courses'));
        const coursesList = coursesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setCourses(coursesList);

        const settingsSnap = await getDoc(doc(db, 'settings', 'general'));
        if (settingsSnap.exists()) {
          const dl = settingsSnap.data().preferenceDeadline;
          if (dl) setDeadline(new Date(dl.seconds ? dl.seconds * 1000 : dl));
        }

        if (userProfile?.preferences?.length > 0) setPreferences(userProfile.preferences);
        if (userProfile?.cgpa != null) setCgpaInput(String(userProfile.cgpa));

        const recommended = coursesList.filter(c => {
          const deptMatch = c.department === userProfile?.department || c.department === 'Open Elective';
          const prereqsMet = !c.prerequisites?.length || c.prerequisites.every(p => userProfile?.completedCourses?.includes(p));
          const hasSeats = (c.remainingSeats ?? c.seatCapacity) > 0;
          return deptMatch && prereqsMet && hasSeats;
        }).slice(0, 5);
        setRecommendations(recommended);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load courses');
      }
      setLoading(false);
    }
    fetchData();
  }, [userProfile]);

  useEffect(() => {
    if (!deadline) return;
    const interval = setInterval(() => {
      const diff = deadline.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft(null); clearInterval(interval); }
      else setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const deadlinePassed = deadline && deadline.getTime() < Date.now();

  function addPreference(courseId) {
    if (preferences.includes(courseId)) return toast.error('Course already in preferences');
    if (preferences.length >= 6) return toast.error('Maximum 6 preferences allowed');
    setPreferences([...preferences, courseId]);
    toast.success('Course added to preferences');
  }

  function removePreference(courseId) {
    setPreferences(preferences.filter(id => id !== courseId));
  }

  function moveUp(index) {
    if (index === 0) return;
    const n = [...preferences];
    [n[index - 1], n[index]] = [n[index], n[index - 1]];
    setPreferences(n);
  }

  function moveDown(index) {
    if (index === preferences.length - 1) return;
    const n = [...preferences];
    [n[index + 1], n[index]] = [n[index], n[index + 1]];
    setPreferences(n);
  }

  async function saveCgpa() {
    const val = parseFloat(cgpaInput);
    if (!cgpaInput || isNaN(val) || val < 0 || val > 10) return toast.error('Enter a valid CGPA between 0 and 10');
    setSavingCgpa(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { cgpa: val });
      setUserProfile({ ...userProfile, cgpa: val });
      toast.success('CGPA updated!');
    } catch { toast.error('Failed to update CGPA'); }
    setSavingCgpa(false);
  }

  async function savePreferences() {
    if (deadlinePassed) return toast.error('Deadline has passed');
    if (preferences.length === 0) return toast.error('Please select at least one course');
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { preferences });
      setUserProfile({ ...userProfile, preferences });
      toast.success('Preferences saved successfully!');
    } catch { toast.error('Failed to save preferences'); }
    setSaving(false);
  }

  function getCourse(id) { return courses.find(c => c.id === id || c.courseId === id); }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ width: 36, height: 36, border: '3px solid ' + (isDark ? 'rgba(201,168,76,0.2)' : 'rgba(255,130,92,0.2)'), borderTopColor: accentColor, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const isDisabled = saving || deadlinePassed || preferences.length === 0;

  return (
    <motion.div
      style={{ fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column', gap: 20 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Deadline Timer */}
      {deadline && (
        <div style={{
          borderRadius: 14,
          border: deadlinePassed ? '1px solid rgba(226,75,74,0.2)' : '1px solid ' + (isDark ? 'rgba(201,168,76,0.15)' : 'rgba(255,130,92,0.25)'),
          background: deadlinePassed ? 'rgba(226,75,74,0.06)' : cardBg,
          padding: '20px 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <HiClock style={{ width: 18, height: 18, color: deadlinePassed ? '#e24b4a' : accentColor }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: deadlinePassed ? '#e24b4a' : accentColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {deadlinePassed ? 'Submission Deadline Passed' : 'Submission Deadline'}
            </span>
          </div>
          {!deadlinePassed && timeLeft && (
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { val: timeLeft.days, label: 'Days' },
                { val: timeLeft.hours, label: 'Hours' },
                { val: timeLeft.minutes, label: 'Min' },
                { val: timeLeft.seconds, label: 'Sec' },
              ].map(({ val, label }) => (
                <div key={label} style={timerBoxStyle}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: accentColor, lineHeight: 1 }}>
                    {String(val).padStart(2, '0')}
                  </div>
                  <div style={labelStyle}>{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CGPA Update Card */}
      <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', padding: '16px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 200px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: isDark ? 'rgba(201,168,76,0.1)' : 'rgba(255,130,92,0.1)',
            border: '1px solid ' + (isDark ? 'rgba(201,168,76,0.2)' : 'rgba(255,130,92,0.2)'),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <HiChartBar style={{ width: 17, height: 17, color: accentColor }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: textMain }}>Your CGPA</div>
            <div style={{ fontSize: 11, color: textMuted, marginTop: 1 }}>Used as priority in course allocation</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto' }}>
          <input
            type="number" min="0" max="10" step="0.01"
            value={cgpaInput}
            onChange={e => setCgpaInput(e.target.value)}
            placeholder="e.g. 8.50"
            style={{
              padding: '8px 12px', width: 100,
              background: isDark ? 'rgba(255,255,255,0.04)' : theme.colors.secondaryBg,
              border: '1px solid ' + borderColor,
              borderRadius: 8, color: textMain, fontSize: 14, outline: 'none',
              fontFamily: "'Playfair Display', serif", fontWeight: 600,
            }}
            onFocus={e => e.target.style.borderColor = accentColor}
            onBlur={e => e.target.style.borderColor = borderColor}
          />
          <button
            onClick={saveCgpa}
            disabled={savingCgpa}
            style={{
              padding: '8px 16px',
              background: savingCgpa ? (isDark ? 'rgba(201,168,76,0.15)' : 'rgba(255,130,92,0.15)') : accentColor,
              color: savingCgpa ? textMuted : '#080d1a',
              fontSize: 12, fontWeight: 700, border: 'none', borderRadius: 8,
              cursor: savingCgpa ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
            }}
          >
            {savingCgpa ? 'Saving…' : 'Update CGPA'}
          </button>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <HiSparkles style={{ width: 18, height: 18, color: accentColor }} />
            <span style={sectionTitleStyle}>Recommended for You</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {recommendations.map(course => {
              const cId = course.courseId || course.id;
              const isAdded = preferences.includes(cId);
              return (
                <div key={course.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: isDark ? 'rgba(201,168,76,0.04)' : 'rgba(255,130,92,0.04)',
                  border: '1px solid ' + (isDark ? 'rgba(201,168,76,0.1)' : 'rgba(255,130,92,0.15)'),
                  borderRadius: 10,
                }}>
                  <div style={{ minWidth: 0, marginRight: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: textMain, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.courseName}</div>
                    <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>{cId}</div>
                  </div>
                  <button
                    onClick={() => addPreference(cId)}
                    disabled={deadlinePassed || isAdded}
                    style={{
                      flexShrink: 0, padding: '5px 12px', fontSize: 12, fontWeight: 600,
                      background: isAdded ? 'rgba(29,158,117,0.1)' : (isDark ? 'rgba(201,168,76,0.1)' : 'rgba(255,130,92,0.1)'),
                      color: isAdded ? '#1d9e75' : accentColor,
                      border: isAdded ? '1px solid rgba(29,158,117,0.2)' : '1px solid ' + (isDark ? 'rgba(201,168,76,0.2)' : 'rgba(255,130,92,0.2)'),
                      borderRadius: 8, cursor: isAdded || deadlinePassed ? 'not-allowed' : 'pointer',
                      opacity: deadlinePassed ? 0.4 : 1,
                    }}
                  >
                    {isAdded ? 'Added' : 'Add'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Two-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Available Courses */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={sectionTitleStyle}>Available Courses</div>
            <span style={badgeStyle}>{courses.length} courses</span>
          </div>
          <div style={{ maxHeight: 480, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
            {courses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: textMuted, fontSize: 13 }}>No courses available yet.</div>
            ) : (
              courses.map(course => {
                const cId = course.courseId || course.id;
                const isSelected = preferences.includes(cId);
                const seats = course.remainingSeats ?? course.seatCapacity;
                return (
                  <div key={course.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: isSelected
                      ? (isDark ? 'rgba(201,168,76,0.06)' : 'rgba(255,130,92,0.05)')
                      : (isDark ? 'rgba(255,255,255,0.02)' : theme.colors.secondaryBg),
                    border: isSelected
                      ? '1px solid ' + (isDark ? 'rgba(201,168,76,0.2)' : 'rgba(255,130,92,0.25)')
                      : '1px solid ' + borderColor,
                    borderRadius: 10, transition: 'all 0.15s',
                  }}>
                    <div style={{ minWidth: 0, marginRight: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: textMain, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.courseName}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                        <span style={{ fontSize: 11, color: textMuted }}>{cId}</span>
                        <span style={{ fontSize: 11, color: textMuted }}>·</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: seats > 0 ? '#1d9e75' : '#e24b4a' }}>
                          {seats > 0 ? seats + ' seats' : 'Full'}
                        </span>
                      </div>
                      {course.prerequisites?.length > 0 && (
                        <div style={{ fontSize: 10, color: textMuted, marginTop: 2 }}>Prereq: {course.prerequisites.join(', ')}</div>
                      )}
                    </div>
                    <button
                      onClick={() => isSelected ? removePreference(cId) : addPreference(cId)}
                      disabled={deadlinePassed}
                      style={{
                        flexShrink: 0, padding: 6, background: 'none', border: 'none',
                        cursor: deadlinePassed ? 'not-allowed' : 'pointer',
                        color: isSelected ? '#e24b4a' : accentColor,
                        opacity: deadlinePassed ? 0.4 : 1, borderRadius: 8,
                      }}
                    >
                      {isSelected ? <HiXCircle style={{ width: 20, height: 20 }} /> : <HiCheckCircle style={{ width: 20, height: 20 }} />}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Ranked Preferences */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={sectionTitleStyle}>Your Ranked Preferences</div>
            <span style={badgeStyle}>{preferences.length} / 6</span>
          </div>

          {preferences.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', color: textMuted, textAlign: 'center' }}>
              <HiArrowsUpDown style={{ width: 36, height: 36, marginBottom: 12, color: isDark ? '#1e2a3a' : theme.colors.border }} />
              <div style={{ fontSize: 13 }}>Select courses from the left to rank them</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {preferences.map((prefId, idx) => {
                const course = getCourse(prefId);
                return (
                  <motion.div
                    key={prefId} layout
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px',
                      background: isDark ? 'rgba(255,255,255,0.02)' : theme.colors.secondaryBg,
                      border: '1px solid ' + borderColor,
                      borderRadius: 10,
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, flexShrink: 0,
                      background: isDark ? 'rgba(201,168,76,0.1)' : 'rgba(255,130,92,0.1)',
                      border: '1px solid ' + (isDark ? 'rgba(201,168,76,0.2)' : 'rgba(255,130,92,0.2)'),
                      borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: accentColor,
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: textMain, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {course?.courseName || prefId}
                      </div>
                      <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>{prefId}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                      <button onClick={() => moveUp(idx)} disabled={idx === 0} style={{ padding: 5, background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', color: textMuted, opacity: idx === 0 ? 0.3 : 1, borderRadius: 6 }}>
                        <HiChevronUp style={{ width: 15, height: 15 }} />
                      </button>
                      <button onClick={() => moveDown(idx)} disabled={idx === preferences.length - 1} style={{ padding: 5, background: 'none', border: 'none', cursor: idx === preferences.length - 1 ? 'not-allowed' : 'pointer', color: textMuted, opacity: idx === preferences.length - 1 ? 0.3 : 1, borderRadius: 6 }}>
                        <HiChevronDown style={{ width: 15, height: 15 }} />
                      </button>
                      <button onClick={() => removePreference(prefId)} style={{ padding: 5, background: 'none', border: 'none', cursor: 'pointer', color: '#e24b4a', borderRadius: 6 }}>
                        <HiTrash style={{ width: 15, height: 15 }} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div style={{ height: 1, background: isDark ? 'rgba(201,168,76,0.1)' : theme.colors.border, margin: '4px 0 16px' }} />

          <button
            onClick={savePreferences}
            disabled={isDisabled}
            style={{
              width: '100%', padding: '13px',
              background: isDisabled ? (isDark ? 'rgba(201,168,76,0.15)' : 'rgba(255,130,92,0.15)') : accentColor,
              color: isDisabled ? textMuted : '#080d1a',
              fontSize: 14, fontWeight: 700,
              border: '1px solid ' + (isDark ? 'rgba(201,168,76,0.2)' : 'rgba(255,130,92,0.2)'),
              borderRadius: 10, cursor: isDisabled ? 'not-allowed' : 'pointer',
              letterSpacing: '0.02em',
            }}
          >
            {saving ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ width: 14, height: 14, border: '2px solid ' + textMuted, borderTopColor: accentColor, borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                Saving…
              </span>
            ) : deadlinePassed ? 'Deadline Passed' : 'Save Preferences'}
          </button>
        </div>

      </div>
    </motion.div>
  );
}