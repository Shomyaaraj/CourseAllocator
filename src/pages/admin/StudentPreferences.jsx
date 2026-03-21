import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useTheme } from 'styled-components';
import { HiUserGroup, HiMagnifyingGlass, HiQueueList } from 'react-icons/hi2';

export default function StudentPreferences() {
  const theme = useTheme();
  const isDark = theme.mode === 'dark';

  const accentColor = theme.colors.accent;
  const textMain = isDark ? '#e8e2d0' : theme.colors.primary;
  const textMuted = isDark ? '#3a4a60' : theme.colors.textLight;
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : theme.colors.border;
  const cardBg = isDark ? '#0d1425' : theme.colors.cardBg;
  const mainBg = isDark ? '#080d1a' : theme.colors.background;
  const rowHoverBg = isDark ? 'rgba(255,255,255,0.02)' : theme.colors.secondaryBg;

  const thStyle = {
    textAlign: 'left',
    fontSize: 10,
    fontWeight: 600,
    color: textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    padding: '11px 18px',
    background: isDark ? '#080d1a' : theme.colors.secondaryBg,
    borderBottom: '1px solid ' + borderColor,
    whiteSpace: 'nowrap',
  };

  const tdStyle = {
    padding: '12px 18px',
    fontSize: 13,
    color: isDark ? '#8a94a8' : textMuted,
    borderBottom: '1px solid ' + (isDark ? 'rgba(255,255,255,0.03)' : borderColor),
    verticalAlign: 'middle',
  };

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [studentsSnap, coursesSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'courses')),
        ]);
        setStudents(
          studentsSnap.docs
            .filter(d => d.data().role === 'student')
            .map(d => ({ id: d.id, ...d.data() }))
        );
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
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{
          width: 36, height: 36,
          border: '3px solid ' + (isDark ? 'rgba(201,168,76,0.15)' : 'rgba(255,130,92,0.15)'),
          borderTopColor: accentColor,
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <motion.div
      style={{ fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column', gap: 18 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 22, fontWeight: 700, color: textMain, margin: '0 0 4px',
          }}>
            Student Preferences
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 2, background: accentColor }} />
            <p style={{ fontSize: 13, color: textMuted, margin: 0 }}>
              {withPrefs.length} submitted · {withoutPrefs.length} pending
            </p>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: 260 }}>
          <HiMagnifyingGlass style={{
            position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)',
            width: 15, height: 15,
            color: searchFocused ? accentColor : textMuted,
            pointerEvents: 'none',
            transition: 'color 0.2s',
          }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students…"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              width: '100%',
              padding: '9px 14px 9px 36px',
              background: cardBg,
              border: searchFocused
                ? '1px solid ' + accentColor
                : '1px solid ' + borderColor,
              borderRadius: 9,
              color: textMain,
              fontSize: 13,
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* ── Summary Strip ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 1,
        background: isDark ? 'rgba(255,255,255,0.05)' : borderColor,
        border: '1px solid ' + borderColor,
        borderRadius: 12, overflow: 'hidden',
      }}>
        <div style={{ background: cardBg, padding: '14px 18px', textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 24, fontWeight: 700, color: accentColor, lineHeight: 1,
          }}>
            {students.length}
          </div>
          <div style={{ fontSize: 10, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginTop: 4 }}>
            Total Students
          </div>
        </div>
        <div style={{ background: cardBg, padding: '14px 18px', textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 24, fontWeight: 700, color: '#1d9e75', lineHeight: 1,
          }}>
            {withPrefs.length}
          </div>
          <div style={{ fontSize: 10, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginTop: 4 }}>
            Submitted
          </div>
        </div>
        <div style={{ background: cardBg, padding: '14px 18px', textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 24, fontWeight: 700,
            color: withoutPrefs.length > 0 ? '#ba7517' : textMuted,
            lineHeight: 1,
          }}>
            {withoutPrefs.length}
          </div>
          <div style={{ fontSize: 10, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginTop: 4 }}>
            Pending
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{
        background: cardBg,
        border: '1px solid ' + borderColor,
        borderRadius: 14,
        overflow: 'hidden',
      }}>
        {/* Table header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '14px 18px',
          background: isDark ? 'rgba(201,168,76,0.04)' : 'rgba(255,130,92,0.04)',
          borderBottom: '1px solid ' + borderColor,
        }}>
          <HiQueueList style={{ width: 15, height: 15, color: accentColor }} />
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 15, fontWeight: 700, color: textMain,
          }}>
            Preference Submissions
          </span>
          <span style={{
            fontSize: 11, fontWeight: 600, color: accentColor,
            background: isDark ? 'rgba(201,168,76,0.1)' : 'rgba(255,130,92,0.1)',
            border: '1px solid ' + (isDark ? 'rgba(201,168,76,0.2)' : 'rgba(255,130,92,0.2)'),
            padding: '2px 8px', borderRadius: 100, marginLeft: 4,
          }}>
            {filtered.length}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: textMuted }}>
            <HiUserGroup style={{ width: 36, height: 36, margin: '0 auto 12px', color: isDark ? '#1e2a3a' : borderColor }} />
            <div style={{ fontSize: 14, fontWeight: 500, color: textMuted }}>No students found</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Student</th>
                  <th style={thStyle}>Reg No.</th>
                  <th style={thStyle}>Department</th>
                  <th style={thStyle}>Preferences</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student) => {
                  const hasPrefs = student.preferences?.length > 0;
                  return (
                    <tr
                      key={student.id}
                      style={{ transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = rowHoverBg}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Student name */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                            background: isDark ? 'rgba(201,168,76,0.1)' : 'rgba(255,130,92,0.1)',
                            border: '1px solid ' + (isDark ? 'rgba(201,168,76,0.2)' : 'rgba(255,130,92,0.2)'),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 700, color: accentColor,
                          }}>
                            {student.name?.charAt(0) || '?'}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 500, color: textMain }}>
                            {student.name}
                          </span>
                        </div>
                      </td>

                      {/* Reg No */}
                      <td style={tdStyle}>{student.registrationNumber || '—'}</td>

                      {/* Department */}
                      <td style={{
                        ...tdStyle,
                        maxWidth: 160,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {student.department || '—'}
                      </td>

                      {/* Preferences */}
                      <td style={tdStyle}>
                        {hasPrefs ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                            {student.preferences.map((pref, i) => (
                              <span
                                key={i}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 4,
                                  fontSize: 10, fontWeight: 500,
                                  padding: '3px 8px', borderRadius: 6,
                                  background: i === 0
                                    ? (isDark ? 'rgba(201,168,76,0.1)' : 'rgba(255,130,92,0.1)')
                                    : (isDark ? 'rgba(255,255,255,0.04)' : theme.colors.secondaryBg),
                                  border: i === 0
                                    ? '1px solid ' + (isDark ? 'rgba(201,168,76,0.2)' : 'rgba(255,130,92,0.2)')
                                    : '1px solid ' + borderColor,
                                  color: i === 0 ? accentColor : textMuted,
                                }}
                              >
                                <span style={{
                                  fontSize: 9, fontWeight: 700,
                                  color: i === 0 ? accentColor : textMuted,
                                }}>
                                  {i + 1}.
                                </span>
                                {getCourseName(pref)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: textMuted, fontSize: 13 }}>—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          fontSize: 11, fontWeight: 600,
                          padding: '4px 10px', borderRadius: 6,
                          background: hasPrefs
                            ? 'rgba(29,158,117,0.1)'
                            : 'rgba(186,117,23,0.1)',
                          border: hasPrefs
                            ? '1px solid rgba(29,158,117,0.2)'
                            : '1px solid rgba(186,117,23,0.2)',
                          color: hasPrefs ? '#1d9e75' : '#ba7517',
                        }}>
                          <span style={{
                            width: 5, height: 5, borderRadius: '50%',
                            background: hasPrefs ? '#1d9e75' : '#ba7517',
                            display: 'inline-block',
                          }} />
                          {hasPrefs ? 'Submitted' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </motion.div>
  );
}