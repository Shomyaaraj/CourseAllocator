import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import {
  HiAcademicCap, HiHome, HiQueueList, HiClipboardDocumentCheck,
  HiArrowRightOnRectangle, HiBars3, HiBookOpen,
  HiBuildingOffice2, HiCalendarDays, HiCheckBadge, HiChevronDown,
  HiShieldCheck, HiClock, HiExclamationTriangle,
  HiChartBar, HiSparkles, HiIdentification, HiXMark,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

const SIDEBAR_LINKS = [
  { label: 'Dashboard', path: '/student', icon: HiHome },
  { label: 'Preferences', path: '/student/preferences', icon: HiQueueList },
  { label: 'Results', path: '/student/results', icon: HiClipboardDocumentCheck },
];

const sidebarStyle = {
  position: 'fixed',
  inset: '0 auto 0 0',
  zIndex: 40,
  width: 240,
  background: '#060a14',
  borderRight: '1px solid rgba(201,168,76,0.1)',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: "'DM Sans', sans-serif",
  transition: 'transform 0.3s ease',
};

const mainStyle = {
  marginLeft: 240,
  minHeight: '100vh',
  background: '#080d1a',
  fontFamily: "'DM Sans', sans-serif",
};

export default function StudentDashboard() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const [courses, setCourses] = useState([]);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchAppData() {
      try {
        const [settingsSnap, coursesSnap] = await Promise.all([
          getDoc(doc(db, 'settings', 'general')),
          getDocs(collection(db, 'courses')),
        ]);
        if (settingsSnap.exists()) setSettings(settingsSnap.data());
        setCourses(coursesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error('Failed to load app data:', e);
      }
    }
    fetchAppData();
  }, []);

  async function handleLogout() {
    try {
      await logout();
      toast.success('Logged out');
      navigate('/');
    } catch {
      toast.error('Logout failed');
    }
  }

  const isActive = (path) => location.pathname === path;
  const isExactDashboard = location.pathname === '/student';
  const activeLabel = SIDEBAR_LINKS.find(l => isActive(l.path))?.label || 'Dashboard';
  const initials = userProfile?.name?.charAt(0) || 'S';

  return (
    <div style={{ minHeight: '100vh', background: '#080d1a', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1024px) {
          .sidebar { transform: translateX(-100%) !important; }
          .sidebar.open { transform: translateX(0) !important; }
          .main-offset { margin-left: 0 !important; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.15); border-radius: 2px; }
      `}</style>

      {/* ── Sidebar ── */}
      <aside
        className={`sidebar ${sidebarOpen ? 'open' : ''}`}
        style={sidebarStyle}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

          {/* Logo */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '20px 20px 18px',
            borderBottom: '1px solid rgba(201,168,76,0.08)',
          }}>
            <div style={{
              width: 36, height: 36,
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.25)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <HiAcademicCap style={{ width: 18, height: 18, color: '#c9a84c' }} />
            </div>
            <div>
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 17, fontWeight: 700, color: '#c9a84c', lineHeight: 1.1,
              }}>VUCA</div>
              <div style={{ fontSize: 10, color: '#2a3548', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Student Portal
              </div>
            </div>
            {/* Mobile close */}
            <button
              className="sidebar-close"
              onClick={() => setSidebarOpen(false)}
              style={{
                marginLeft: 'auto', background: 'none', border: 'none',
                color: '#3a4a60', cursor: 'pointer', padding: 4,
                display: 'none',
              }}
            >
              <HiXMark style={{ width: 18, height: 18 }} />
            </button>
          </div>

          {/* Nav links */}
          <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Dashboard */}
            <Link
              to="/student"
              onClick={() => setSidebarOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 9,
                fontSize: 13, fontWeight: 500, textDecoration: 'none',
                transition: 'all 0.15s',
                background: isActive('/student') ? 'rgba(201,168,76,0.12)' : 'transparent',
                color: isActive('/student') ? '#c9a84c' : '#3a4a60',
                border: isActive('/student') ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
              }}
            >
              <HiHome style={{ width: 16, height: 16, flexShrink: 0 }} />
              Dashboard
            </Link>
            {/* Preferences */}
            <Link
              to="/student/preferences"
              onClick={() => setSidebarOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 9,
                fontSize: 13, fontWeight: 500, textDecoration: 'none',
                transition: 'all 0.15s',
                background: isActive('/student/preferences') ? 'rgba(201,168,76,0.12)' : 'transparent',
                color: isActive('/student/preferences') ? '#c9a84c' : '#3a4a60',
                border: isActive('/student/preferences') ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
              }}
            >
              <HiQueueList style={{ width: 16, height: 16, flexShrink: 0 }} />
              Preferences
            </Link>
            {/* Results */}
            <Link
              to="/student/results"
              onClick={() => setSidebarOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 9,
                fontSize: 13, fontWeight: 500, textDecoration: 'none',
                transition: 'all 0.15s',
                background: isActive('/student/results') ? 'rgba(201,168,76,0.12)' : 'transparent',
                color: isActive('/student/results') ? '#c9a84c' : '#3a4a60',
                border: isActive('/student/results') ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
              }}
            >
              <HiClipboardDocumentCheck style={{ width: 16, height: 16, flexShrink: 0 }} />
              Results
            </Link>
          </nav>

          {/* User + Logout */}
          <div style={{
            padding: '12px 10px',
            borderTop: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', marginBottom: 4,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#c9a84c',
              }}>
                {initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#8a94a8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userProfile?.name || 'Student'}
                </div>
                <div style={{ fontSize: 10, color: '#2a3548', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userProfile?.email}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '9px 12px',
                background: 'none', border: 'none',
                borderRadius: 9, cursor: 'pointer',
                fontSize: 13, fontWeight: 500, color: '#e24b4a',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(226,75,74,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <HiArrowRightOnRectangle style={{ width: 16, height: 16 }} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 30 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main Area ── */}
      <div className="main-offset" style={{ marginLeft: 240, minHeight: '100vh' }}>

        {/* Top bar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 20,
          background: 'rgba(8,13,26,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(201,168,76,0.08)',
          padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 60,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            {/* Mobile menu btn */}
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              style={{
                padding: 6, background: 'none', border: 'none',
                color: '#3a4a60', cursor: 'pointer', flexShrink: 0,
              }}
            >
              <HiBars3 style={{ width: 20, height: 20 }} />
            </button>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 16, fontWeight: 700, color: '#e8e2d0',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {activeLabel}
              </div>
              <div style={{ fontSize: 11, color: '#2a3548' }}>
                Welcome back, {userProfile?.name?.split(' ')[0] || 'Student'}
              </div>
            </div>
          </div>

          {/* Profile dropdown */}
          <div style={{ position: 'relative', flexShrink: 0 }} ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#c9a84c',
              }}>
                {initials}
              </div>
              <HiChevronDown style={{
                width: 14, height: 14, color: '#3a4a60',
                transform: profileOpen ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.2s',
              }} />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    width: 240,
                    background: '#0d1425',
                    border: '1px solid rgba(201,168,76,0.12)',
                    borderRadius: 14,
                    overflow: 'hidden',
                    zIndex: 50,
                  }}
                >
                  {/* Dropdown header */}
                  <div style={{
                    padding: '16px 16px 14px',
                    background: 'rgba(201,168,76,0.06)',
                    borderBottom: '1px solid rgba(201,168,76,0.08)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        background: 'rgba(201,168,76,0.1)',
                        border: '1px solid rgba(201,168,76,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 15, fontWeight: 700, color: '#c9a84c',
                      }}>
                        {initials}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#e8e2d0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {userProfile?.name || 'Student'}
                        </div>
                        <div style={{ fontSize: 11, color: '#3a4a60', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {userProfile?.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info rows */}
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
                      <HiIdentification style={{ width: 13, height: 13, color: '#3a4a60', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: '#3a4a60', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {userProfile?.registrationNumber || '—'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
                      <HiBuildingOffice2 style={{ width: 13, height: 13, color: '#3a4a60', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: '#3a4a60', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {userProfile?.department || '—'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
                      <HiCalendarDays style={{ width: 13, height: 13, color: '#3a4a60', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: '#3a4a60' }}>
                        Semester {userProfile?.semester || '—'}
                      </span>
                    </div>
                  </div>

                  {/* Sign out */}
                  <div style={{ padding: '8px' }}>
                    <button
                      onClick={() => { setProfileOpen(false); handleLogout(); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        width: '100%', padding: '9px 10px',
                        background: 'none', border: 'none', borderRadius: 8,
                        cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#e24b4a',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(226,75,74,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <HiArrowRightOnRectangle style={{ width: 15, height: 15 }} />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Page content */}
        <main style={{ padding: '24px' }}>
          {isExactDashboard
            ? <StudentOverview userProfile={userProfile} settings={settings} courses={courses} />
            : <Outlet />
          }
        </main>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Student Overview
───────────────────────────────────────── */
function StudentOverview({ userProfile, settings, courses }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [deadline, setDeadline] = useState(null);

  useEffect(() => {
    if (!settings?.preferenceDeadline) return;
    const dl = settings.preferenceDeadline;
    const date = dl?.seconds ? new Date(dl.seconds * 1000) : new Date(dl);
    setDeadline(date);
  }, [settings]);

  useEffect(() => {
    if (!deadline) return;
    const tick = () => {
      const diff = deadline.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft(null); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const deadlinePassed = deadline && deadline.getTime() < Date.now();

  const allocatedCourse = userProfile?.allocatedCourse
    ? courses.find(c => c.courseId === userProfile.allocatedCourse || c.id === userProfile.allocatedCourse)
    : null;

  const cardStyle = {
    background: '#0d1425',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14,
    overflow: 'hidden',
  };

  const sectionTitleStyle = {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 15, fontWeight: 700, color: '#e8e2d0',
  };

  return (
    <motion.div
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >

      {/* ── Deadline Banner ── */}
      {deadline && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            borderRadius: 14,
            padding: '20px 22px',
            background: deadlinePassed ? 'rgba(226,75,74,0.06)' : '#0d1425',
            border: deadlinePassed
              ? '1px solid rgba(226,75,74,0.2)'
              : '1px solid rgba(201,168,76,0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: timeLeft ? 16 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {deadlinePassed
                ? <HiExclamationTriangle style={{ width: 18, height: 18, color: '#e24b4a', flexShrink: 0 }} />
                : <HiClock style={{ width: 18, height: 18, color: '#c9a84c', flexShrink: 0 }} />
              }
              <div>
                <div style={{
                  fontSize: 13, fontWeight: 600,
                  color: deadlinePassed ? '#e24b4a' : '#c9a84c',
                  marginBottom: 3,
                }}>
                  {deadlinePassed ? 'Preference Deadline Passed' : 'Course Preference Deadline'}
                </div>
                <div style={{ fontSize: 11, color: '#2a3548' }}>
                  {deadline.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            {!deadlinePassed && (
              <Link
                to="/student/preferences"
                style={{
                  flexShrink: 0,
                  padding: '7px 14px',
                  background: '#c9a84c',
                  color: '#080d1a',
                  fontSize: 12, fontWeight: 700,
                  borderRadius: 8, textDecoration: 'none',
                  letterSpacing: '0.02em',
                }}
              >
                Submit Now →
              </Link>
            )}
          </div>

          {!deadlinePassed && timeLeft && (
            <div style={{ display: 'flex', gap: 8 }}>
              {/* Days */}
              <div style={{
                flex: 1, background: 'rgba(201,168,76,0.08)',
                border: '1px solid rgba(201,168,76,0.12)',
                borderRadius: 9, padding: '10px 8px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#c9a84c', lineHeight: 1 }}>
                  {String(timeLeft.days).padStart(2, '0')}
                </div>
                <div style={{ fontSize: 9, color: '#2a3548', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 3 }}>Days</div>
              </div>
              {/* Hours */}
              <div style={{
                flex: 1, background: 'rgba(201,168,76,0.08)',
                border: '1px solid rgba(201,168,76,0.12)',
                borderRadius: 9, padding: '10px 8px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#c9a84c', lineHeight: 1 }}>
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div style={{ fontSize: 9, color: '#2a3548', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 3 }}>Hours</div>
              </div>
              {/* Minutes */}
              <div style={{
                flex: 1, background: 'rgba(201,168,76,0.08)',
                border: '1px solid rgba(201,168,76,0.12)',
                borderRadius: 9, padding: '10px 8px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#c9a84c', lineHeight: 1 }}>
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div style={{ fontSize: 9, color: '#2a3548', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 3 }}>Min</div>
              </div>
              {/* Seconds */}
              <div style={{
                flex: 1, background: 'rgba(201,168,76,0.08)',
                border: '1px solid rgba(201,168,76,0.12)',
                borderRadius: 9, padding: '10px 8px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#c9a84c', lineHeight: 1 }}>
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div style={{ fontSize: 9, color: '#2a3548', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 3 }}>Sec</div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Profile Card ── */}
      <div style={cardStyle}>
        {/* Header strip */}
        <div style={{
          padding: '20px 22px',
          background: 'rgba(201,168,76,0.05)',
          borderBottom: '1px solid rgba(201,168,76,0.08)',
          backgroundImage: `linear-gradient(rgba(180,160,100,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(180,160,100,0.025) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Playfair Display', serif",
              fontSize: 22, fontWeight: 700, color: '#c9a84c',
            }}>
              {userProfile?.name?.charAt(0) || 'S'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 18, fontWeight: 700, color: '#f0ece0',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {userProfile?.name || 'Student'}
              </div>
              <div style={{ fontSize: 12, color: '#3a4a60', marginTop: 2 }}>
                {userProfile?.email}
              </div>
            </div>
          </div>
        </div>

        {/* Meta grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1, background: 'rgba(255,255,255,0.04)',
        }}>
          <div style={{ background: '#0d1425', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
              <HiIdentification style={{ width: 11, height: 11, color: '#3a4a60' }} />
              <span style={{ fontSize: 9, fontWeight: 600, color: '#3a4a60', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Reg. No.</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e8e2d0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userProfile?.registrationNumber || '—'}
            </div>
          </div>
          <div style={{ background: '#0d1425', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
              <HiBuildingOffice2 style={{ width: 11, height: 11, color: '#3a4a60' }} />
              <span style={{ fontSize: 9, fontWeight: 600, color: '#3a4a60', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Department</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e8e2d0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userProfile?.department || '—'}
            </div>
          </div>
          <div style={{ background: '#0d1425', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
              <HiCalendarDays style={{ width: 11, height: 11, color: '#3a4a60' }} />
              <span style={{ fontSize: 9, fontWeight: 600, color: '#3a4a60', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Semester</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e8e2d0' }}>
              {userProfile?.semester ? `Semester ${userProfile.semester}` : '—'}
            </div>
          </div>
          <div style={{ background: '#0d1425', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
              <HiChartBar style={{ width: 11, height: 11, color: '#3a4a60' }} />
              <span style={{ fontSize: 9, fontWeight: 600, color: '#3a4a60', textTransform: 'uppercase', letterSpacing: '0.08em' }}>CGPA</span>
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: '#c9a84c' }}>
              {userProfile?.cgpa != null ? `${Number(userProfile.cgpa).toFixed(2)}` : '—'}
              {userProfile?.cgpa != null && <span style={{ fontSize: 11, color: '#3a4a60', fontFamily: "'DM Sans', sans-serif" }}> / 10</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          style={{ ...cardStyle, padding: '20px' }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(55,138,221,0.1)',
            border: '1px solid rgba(55,138,221,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14,
          }}>
            <HiQueueList style={{ width: 17, height: 17, color: '#378add' }} />
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#e8e2d0', lineHeight: 1 }}>
            {userProfile?.preferences?.length || 0}
          </div>
          <div style={{ fontSize: 11, color: '#3a4a60', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, marginTop: 6 }}>
            Preferences Submitted
          </div>
        </motion.div>

        {/* Completed */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 }}
          style={{ ...cardStyle, padding: '20px' }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(29,158,117,0.1)',
            border: '1px solid rgba(29,158,117,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14,
          }}>
            <HiCheckBadge style={{ width: 17, height: 17, color: '#1d9e75' }} />
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#e8e2d0', lineHeight: 1 }}>
            {userProfile?.completedCourses?.length || 0}
          </div>
          <div style={{ fontSize: 11, color: '#3a4a60', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, marginTop: 6 }}>
            Completed Courses
          </div>
        </motion.div>

        {/* Status */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          style={{ ...cardStyle, padding: '20px' }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: userProfile?.allocatedCourse ? 'rgba(29,158,117,0.1)' : 'rgba(186,117,23,0.1)',
            border: userProfile?.allocatedCourse ? '1px solid rgba(29,158,117,0.15)' : '1px solid rgba(186,117,23,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14,
          }}>
            <HiChartBar style={{ width: 17, height: 17, color: userProfile?.allocatedCourse ? '#1d9e75' : '#ba7517' }} />
          </div>
          <div style={{
            fontSize: 16, fontWeight: 700,
            color: userProfile?.allocatedCourse ? '#1d9e75' : '#ba7517',
            lineHeight: 1, marginBottom: 6,
          }}>
            {userProfile?.allocatedCourse ? 'Allocated' : 'Pending'}
          </div>
          <div style={{ fontSize: 11, color: '#3a4a60', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>
            Allocation Status
          </div>
        </motion.div>
      </div>

      {/* ── Allocated Course ── */}
      {userProfile?.allocatedCourse && (
        <div style={{ ...cardStyle }}>
          <div style={{
            padding: '16px 20px',
            background: 'rgba(29,158,117,0.06)',
            borderBottom: '1px solid rgba(29,158,117,0.1)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <HiSparkles style={{ width: 16, height: 16, color: '#1d9e75' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1d9e75', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Allocated Course
            </span>
          </div>
          <div style={{ padding: '18px 20px' }}>
            {allocatedCourse ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                  background: 'rgba(29,158,117,0.1)',
                  border: '1px solid rgba(29,158,117,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <HiBookOpen style={{ width: 22, height: 22, color: '#1d9e75' }} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 16, fontWeight: 700, color: '#f0ece0', marginBottom: 4,
                  }}>
                    {allocatedCourse.courseName}
                  </div>
                  <div style={{ fontSize: 12, color: '#3a4a60', marginBottom: 10 }}>
                    {allocatedCourse.courseId}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {allocatedCourse.department && (
                      <span style={{
                        padding: '3px 10px', fontSize: 11, fontWeight: 500,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        color: '#5e6d85', borderRadius: 6,
                      }}>
                        {allocatedCourse.department}
                      </span>
                    )}
                    {allocatedCourse.timetableSlot && (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '3px 10px', fontSize: 11, fontWeight: 500,
                        background: 'rgba(55,138,221,0.08)',
                        border: '1px solid rgba(55,138,221,0.15)',
                        color: '#378add', borderRadius: 6,
                      }}>
                        <HiClock style={{ width: 10, height: 10 }} />
                        {allocatedCourse.timetableSlot}
                      </span>
                    )}
                    <span style={{
                      padding: '3px 10px', fontSize: 11, fontWeight: 600,
                      background: 'rgba(29,158,117,0.1)',
                      border: '1px solid rgba(29,158,117,0.2)',
                      color: '#1d9e75', borderRadius: 6,
                    }}>
                      Confirmed ✓
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 14, fontWeight: 500, color: '#e8e2d0' }}>
                {userProfile.allocatedCourse}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Available Courses ── */}
      <div style={cardStyle}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HiBookOpen style={{ width: 15, height: 15, color: '#c9a84c' }} />
            <span style={sectionTitleStyle}>Available Courses</span>
            <span style={{
              fontSize: 11, fontWeight: 600, color: '#c9a84c',
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.2)',
              padding: '2px 8px', borderRadius: 100,
            }}>
              {courses.length}
            </span>
          </div>
          <Link
            to="/student/preferences"
            style={{ fontSize: 12, fontWeight: 600, color: '#c9a84c', textDecoration: 'none' }}
          >
            Select Preferences →
          </Link>
        </div>

        {courses.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#2a3548', fontSize: 13 }}>
            No courses available yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {courses.slice(0, 5).map((course, idx) => {
              const seats = course.remainingSeats ?? course.seatCapacity ?? 0;
              const isFull = seats <= 0;
              return (
                <div
                  key={course.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '13px 20px',
                    borderTop: idx === 0 ? 'none' : '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                    background: 'rgba(201,168,76,0.06)',
                    border: '1px solid rgba(201,168,76,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <HiBookOpen style={{ width: 15, height: 15, color: '#c9a84c' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#e8e2d0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {course.courseName}
                    </div>
                    <div style={{ fontSize: 11, color: '#3a4a60', marginTop: 2 }}>
                      {course.courseId} · {course.department || 'General'}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      padding: '3px 9px', borderRadius: 100,
                      background: isFull ? 'rgba(226,75,74,0.08)' : 'rgba(29,158,117,0.08)',
                      border: isFull ? '1px solid rgba(226,75,74,0.15)' : '1px solid rgba(29,158,117,0.15)',
                      color: isFull ? '#e24b4a' : '#1d9e75',
                    }}>
                      {isFull ? 'Full' : `${seats} seats`}
                    </span>
                    {course.timetableSlot && (
                      <div style={{ fontSize: 10, color: '#2a3548', marginTop: 3 }}>
                        {course.timetableSlot}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {courses.length > 5 && (
          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid rgba(255,255,255,0.04)',
            background: 'rgba(255,255,255,0.01)',
          }}>
            <Link
              to="/student/preferences"
              style={{ fontSize: 12, fontWeight: 600, color: '#c9a84c', textDecoration: 'none' }}
            >
              View all {courses.length} courses →
            </Link>
          </div>
        )}
      </div>

      {/* ── Completed Courses ── */}
      {userProfile?.completedCourses?.length > 0 && (
        <div style={{ ...cardStyle, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <HiCheckBadge style={{ width: 15, height: 15, color: '#1d9e75' }} />
            <span style={sectionTitleStyle}>Completed Courses</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {userProfile.completedCourses.map(course => (
              <span
                key={course}
                style={{
                  padding: '5px 12px',
                  fontSize: 12, fontWeight: 500,
                  background: 'rgba(29,158,117,0.08)',
                  border: '1px solid rgba(29,158,117,0.15)',
                  color: '#1d9e75', borderRadius: 8,
                }}
              >
                {course}
              </span>
            ))}
          </div>
        </div>
      )}

    </motion.div>
  );
}