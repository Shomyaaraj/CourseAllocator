import { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import {
  HiAcademicCap, HiHome, HiBookOpen, HiUserGroup, HiCog6Tooth,
  HiArrowRightOnRectangle, HiBars3, HiChartBar, HiCpuChip,
  HiUsers, HiDocumentText, HiCheckBadge, HiClock,
  HiCalendarDays, HiExclamationTriangle, HiShieldCheck, HiXMark,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const SIDEBAR_LINKS = [
  { label: 'Dashboard',   path: '/admin',            icon: HiHome },
  { label: 'Courses',     path: '/admin/courses',    icon: HiBookOpen },
  { label: 'Preferences', path: '/admin/preferences',icon: HiUserGroup },
  { label: 'Allocation',  path: '/admin/allocation', icon: HiCpuChip },
  { label: 'Reports',     path: '/admin/reports',    icon: HiChartBar },
  { label: 'Settings',    path: '/admin/settings',   icon: HiCog6Tooth },
];

const CHART_COLORS = ['#c9a84c', '#1d9e75', '#378add', '#e24b4a', '#7f77dd', '#ba7517'];

export default function AdminDashboard() {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
  const isExactDashboard = location.pathname === '/admin';
  const activeLabel = SIDEBAR_LINKS.find(l => isActive(l.path))?.label || 'Dashboard';
  const initials = userProfile?.name?.charAt(0) || 'A';

  return (
    <div style={{ minHeight: '100vh', background: '#080d1a', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1024px) {
          .admin-sidebar { transform: translateX(-100%) !important; }
          .admin-sidebar.open { transform: translateX(0) !important; }
          .admin-main { margin-left: 0 !important; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.15); border-radius: 2px; }
        .recharts-tooltip-wrapper .recharts-default-tooltip {
          background: #0d1425 !important;
          border: 1px solid rgba(201,168,76,0.15) !important;
          border-radius: 8px !important;
          color: #e8e2d0 !important;
        }
      `}</style>

      {/* ── Sidebar ── */}
      <aside
        className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}
        style={{
          position: 'fixed',
          inset: '0 auto 0 0',
          zIndex: 40,
          width: 240,
          background: '#060a14',
          borderRight: '1px solid rgba(201,168,76,0.1)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease',
        }}
      >
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
            <HiShieldCheck style={{ width: 18, height: 18, color: '#c9a84c' }} />
          </div>
          <div>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 17, fontWeight: 700, color: '#c9a84c', lineHeight: 1.1,
            }}>VUCA</div>
            <div style={{ fontSize: 10, color: '#2a3548', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Admin Panel
            </div>
          </div>
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
            style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              color: '#3a4a60', cursor: 'pointer', padding: 4,
            }}
          >
            <HiXMark style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Link
            to="/admin"
            onClick={() => setSidebarOpen(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 9,
              fontSize: 13, fontWeight: 500, textDecoration: 'none',
              transition: 'all 0.15s',
              background: isActive('/admin') ? 'rgba(201,168,76,0.12)' : 'transparent',
              color: isActive('/admin') ? '#c9a84c' : '#3a4a60',
              border: isActive('/admin') ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
            }}
          >
            <HiHome style={{ width: 16, height: 16, flexShrink: 0 }} />
            Dashboard
          </Link>
          <Link
            to="/admin/courses"
            onClick={() => setSidebarOpen(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 9,
              fontSize: 13, fontWeight: 500, textDecoration: 'none',
              transition: 'all 0.15s',
              background: isActive('/admin/courses') ? 'rgba(201,168,76,0.12)' : 'transparent',
              color: isActive('/admin/courses') ? '#c9a84c' : '#3a4a60',
              border: isActive('/admin/courses') ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
            }}
          >
            <HiBookOpen style={{ width: 16, height: 16, flexShrink: 0 }} />
            Courses
          </Link>
          <Link
            to="/admin/preferences"
            onClick={() => setSidebarOpen(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 9,
              fontSize: 13, fontWeight: 500, textDecoration: 'none',
              transition: 'all 0.15s',
              background: isActive('/admin/preferences') ? 'rgba(201,168,76,0.12)' : 'transparent',
              color: isActive('/admin/preferences') ? '#c9a84c' : '#3a4a60',
              border: isActive('/admin/preferences') ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
            }}
          >
            <HiUserGroup style={{ width: 16, height: 16, flexShrink: 0 }} />
            Preferences
          </Link>
          <Link
            to="/admin/allocation"
            onClick={() => setSidebarOpen(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 9,
              fontSize: 13, fontWeight: 500, textDecoration: 'none',
              transition: 'all 0.15s',
              background: isActive('/admin/allocation') ? 'rgba(201,168,76,0.12)' : 'transparent',
              color: isActive('/admin/allocation') ? '#c9a84c' : '#3a4a60',
              border: isActive('/admin/allocation') ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
            }}
          >
            <HiCpuChip style={{ width: 16, height: 16, flexShrink: 0 }} />
            Allocation
          </Link>
          <Link
            to="/admin/reports"
            onClick={() => setSidebarOpen(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 9,
              fontSize: 13, fontWeight: 500, textDecoration: 'none',
              transition: 'all 0.15s',
              background: isActive('/admin/reports') ? 'rgba(201,168,76,0.12)' : 'transparent',
              color: isActive('/admin/reports') ? '#c9a84c' : '#3a4a60',
              border: isActive('/admin/reports') ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
            }}
          >
            <HiChartBar style={{ width: 16, height: 16, flexShrink: 0 }} />
            Reports
          </Link>
          <Link
            to="/admin/settings"
            onClick={() => setSidebarOpen(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 9,
              fontSize: 13, fontWeight: 500, textDecoration: 'none',
              transition: 'all 0.15s',
              background: isActive('/admin/settings') ? 'rgba(201,168,76,0.12)' : 'transparent',
              color: isActive('/admin/settings') ? '#c9a84c' : '#3a4a60',
              border: isActive('/admin/settings') ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
            }}
          >
            <HiCog6Tooth style={{ width: 16, height: 16, flexShrink: 0 }} />
            Settings
          </Link>
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
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
                {userProfile?.name || 'Admin'}
              </div>
              <div style={{ fontSize: 10, color: '#2a3548' }}>Administrator</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', padding: '9px 12px',
              background: 'none', border: 'none', borderRadius: 9,
              cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#e24b4a',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(226,75,74,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <HiArrowRightOnRectangle style={{ width: 16, height: 16 }} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 30 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main ── */}
      <div className="admin-main" style={{ marginLeft: 240, minHeight: '100vh' }}>

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              style={{ padding: 6, background: 'none', border: 'none', color: '#3a4a60', cursor: 'pointer' }}
            >
              <HiBars3 style={{ width: 20, height: 20 }} />
            </button>
            <div>
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 16, fontWeight: 700, color: '#e8e2d0',
              }}>
                {activeLabel}
              </div>
              <div style={{ fontSize: 11, color: '#2a3548' }}>Admin Panel</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px',
                background: 'rgba(226,75,74,0.06)',
                border: '1px solid rgba(226,75,74,0.15)',
                borderRadius: 8, cursor: 'pointer',
                fontSize: 12, fontWeight: 600, color: '#e24b4a',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(226,75,74,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(226,75,74,0.06)'}
            >
              <HiArrowRightOnRectangle style={{ width: 14, height: 14 }} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
            <div style={{
              padding: '5px 12px',
              background: 'rgba(201,168,76,0.08)',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: 8,
              fontSize: 11, fontWeight: 600, color: '#c9a84c',
              letterSpacing: '0.06em',
            }}>
              ADMIN
            </div>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#c9a84c',
            }}>
              {initials}
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ padding: 24 }}>
          {isExactDashboard ? <AdminOverview /> : <Outlet />}
        </main>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   Admin Overview
───────────────────────────────────── */
function AdminOverview() {
  const [stats, setStats] = useState({ students: 0, courses: 0, allocated: 0, unallocated: 0 });
  const [courseData, setCourseData] = useState([]);
  const [deadline, setDeadline] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [studentsSnap, coursesSnap, allocSnap, settingsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'courses')),
          getDocs(collection(db, 'allocations')),
          getDoc(doc(db, 'settings', 'general')),
        ]);

        const students = studentsSnap.docs.filter(d => d.data().role === 'student');
        const courses = coursesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        setStats({
          students: students.length,
          courses: courses.length,
          allocated: allocSnap.size,
          unallocated: Math.max(0, students.length - allocSnap.size),
        });

        setCourseData(courses.slice(0, 6).map(c => ({
          name: c.courseName?.length > 12
            ? c.courseName.substring(0, 12) + '..'
            : (c.courseName || 'Unknown'),
          capacity: c.seatCapacity || 0,
          enrolled: (c.seatCapacity || 0) - (c.remainingSeats ?? c.seatCapacity ?? 0),
        })));

        if (settingsSnap.exists() && settingsSnap.data().preferenceDeadline) {
          const dl = settingsSnap.data().preferenceDeadline;
          setDeadline(dl?.seconds ? new Date(dl.seconds * 1000) : new Date(dl));
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  const deadlinePast = deadline && deadline < new Date();

  const pieData = [
    { name: 'Allocated',   value: stats.allocated || 0 },
    { name: 'Unallocated', value: stats.unallocated || 0 },
  ];

  const cardStyle = {
    background: '#0d1425',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14,
  };

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
      </div>
    );
  }

  return (
    <motion.div
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >

      {/* ── Deadline Alert ── */}
      {deadline && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px',
          background: deadlinePast ? 'rgba(226,75,74,0.06)' : 'rgba(55,138,221,0.06)',
          border: deadlinePast
            ? '1px solid rgba(226,75,74,0.18)'
            : '1px solid rgba(55,138,221,0.18)',
          borderRadius: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: deadlinePast ? 'rgba(226,75,74,0.1)' : 'rgba(55,138,221,0.1)',
            border: deadlinePast ? '1px solid rgba(226,75,74,0.2)' : '1px solid rgba(55,138,221,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {deadlinePast
              ? <HiExclamationTriangle style={{ width: 17, height: 17, color: '#e24b4a' }} />
              : <HiClock style={{ width: 17, height: 17, color: '#378add' }} />
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 600,
              color: deadlinePast ? '#e24b4a' : '#378add',
              marginBottom: 2,
            }}>
              Preference Deadline: {deadlinePast ? 'Passed' : 'Active'}
            </div>
            <div style={{ fontSize: 11, color: '#3a4a60' }}>
              {deadline.toLocaleDateString('en-IN', {
                weekday: 'short', year: 'numeric', month: 'short',
                day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </div>
          </div>
          <Link
            to="/admin/settings"
            style={{
              flexShrink: 0,
              padding: '6px 14px',
              fontSize: 12, fontWeight: 600,
              background: deadlinePast ? 'rgba(226,75,74,0.1)' : 'rgba(55,138,221,0.1)',
              border: deadlinePast ? '1px solid rgba(226,75,74,0.2)' : '1px solid rgba(55,138,221,0.2)',
              color: deadlinePast ? '#e24b4a' : '#378add',
              borderRadius: 8, textDecoration: 'none',
            }}
          >
            Edit →
          </Link>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {/* Students */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          style={{ ...cardStyle, padding: '20px' }}
        >
          <div style={{
            width: 38, height: 38, borderRadius: 10, marginBottom: 14,
            background: 'rgba(55,138,221,0.1)',
            border: '1px solid rgba(55,138,221,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <HiUsers style={{ width: 18, height: 18, color: '#378add' }} />
          </div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 30, fontWeight: 700, color: '#e8e2d0', lineHeight: 1,
          }}>
            {stats.students}
          </div>
          <div style={{ fontSize: 11, color: '#3a4a60', fontWeight: 500, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Total Students
          </div>
        </motion.div>

        {/* Courses */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 }}
          style={{ ...cardStyle, padding: '20px' }}
        >
          <div style={{
            width: 38, height: 38, borderRadius: 10, marginBottom: 14,
            background: 'rgba(127,119,221,0.1)',
            border: '1px solid rgba(127,119,221,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <HiBookOpen style={{ width: 18, height: 18, color: '#7f77dd' }} />
          </div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 30, fontWeight: 700, color: '#e8e2d0', lineHeight: 1,
          }}>
            {stats.courses}
          </div>
          <div style={{ fontSize: 11, color: '#3a4a60', fontWeight: 500, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Total Courses
          </div>
        </motion.div>

        {/* Allocated */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          style={{ ...cardStyle, padding: '20px' }}
        >
          <div style={{
            width: 38, height: 38, borderRadius: 10, marginBottom: 14,
            background: 'rgba(29,158,117,0.1)',
            border: '1px solid rgba(29,158,117,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <HiCheckBadge style={{ width: 18, height: 18, color: '#1d9e75' }} />
          </div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 30, fontWeight: 700, color: '#e8e2d0', lineHeight: 1,
          }}>
            {stats.allocated}
          </div>
          <div style={{ fontSize: 11, color: '#3a4a60', fontWeight: 500, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Allocated
          </div>
        </motion.div>

        {/* Unallocated */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.21 }}
          style={{ ...cardStyle, padding: '20px' }}
        >
          <div style={{
            width: 38, height: 38, borderRadius: 10, marginBottom: 14,
            background: 'rgba(226,75,74,0.1)',
            border: '1px solid rgba(226,75,74,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <HiDocumentText style={{ width: 18, height: 18, color: '#e24b4a' }} />
          </div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 30, fontWeight: 700, color: '#e8e2d0', lineHeight: 1,
          }}>
            {stats.unallocated}
          </div>
          <div style={{ fontSize: 11, color: '#3a4a60', fontWeight: 500, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Unallocated
          </div>
        </motion.div>
      </div>

      {/* ── Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Bar chart */}
        <div style={cardStyle}>
          <div style={{
            padding: '18px 20px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <HiChartBar style={{ width: 15, height: 15, color: '#c9a84c' }} />
            <span style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 15, fontWeight: 700, color: '#e8e2d0',
            }}>
              Course Enrollment
            </span>
          </div>
          <div style={{ padding: '16px 8px 16px 0' }}>
            {courseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={courseData} margin={{ left: -10, right: 10 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#3a4a60' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#3a4a60' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#0d1425',
                      border: '1px solid rgba(201,168,76,0.15)',
                      borderRadius: 8,
                      color: '#e8e2d0',
                      fontSize: 12,
                    }}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  />
                  <Bar dataKey="capacity" fill="rgba(255,255,255,0.08)" radius={[4, 4, 0, 0]} name="Capacity" />
                  <Bar dataKey="enrolled" fill="#c9a84c" radius={[4, 4, 0, 0]} name="Enrolled" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#2a3548', fontSize: 13 }}>
                No course data yet
              </div>
            )}
          </div>
        </div>

        {/* Pie chart */}
        <div style={cardStyle}>
          <div style={{
            padding: '18px 20px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <HiCpuChip style={{ width: 15, height: 15, color: '#c9a84c' }} />
            <span style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 15, fontWeight: 700, color: '#e8e2d0',
            }}>
              Allocation Status
            </span>
          </div>
          <div style={{ padding: '16px 0' }}>
            {(stats.allocated > 0 || stats.unallocated > 0) ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={88}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={entry.name} fill={CHART_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#0d1425',
                        border: '1px solid rgba(201,168,76,0.15)',
                        borderRadius: 8,
                        color: '#e8e2d0',
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div style={{
                  display: 'flex', justifyContent: 'center', gap: 24,
                  padding: '0 20px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: CHART_COLORS[0], flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#5e6d85' }}>
                      Allocated
                      <span style={{ color: '#c9a84c', fontWeight: 700, marginLeft: 6 }}>
                        {stats.allocated}
                      </span>
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: CHART_COLORS[1], flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#5e6d85' }}>
                      Unallocated
                      <span style={{ color: '#1d9e75', fontWeight: 700, marginLeft: 6 }}>
                        {stats.unallocated}
                      </span>
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#2a3548', fontSize: 13 }}>
                No allocation data yet
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Quick Actions ── */}
      <div style={cardStyle}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <HiCpuChip style={{ width: 15, height: 15, color: '#c9a84c' }} />
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 15, fontWeight: 700, color: '#e8e2d0',
          }}>
            Quick Actions
          </span>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1, background: 'rgba(255,255,255,0.04)',
        }}>
          <Link
            to="/admin/courses"
            style={{
              background: '#0d1425', padding: '18px 16px',
              textDecoration: 'none', textAlign: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#111c35'}
            onMouseLeave={e => e.currentTarget.style.background = '#0d1425'}
          >
            <HiBookOpen style={{ width: 22, height: 22, color: '#7f77dd', margin: '0 auto 8px' }} />
            <div style={{ fontSize: 12, fontWeight: 600, color: '#8a94a8' }}>Manage Courses</div>
          </Link>
          <Link
            to="/admin/preferences"
            style={{
              background: '#0d1425', padding: '18px 16px',
              textDecoration: 'none', textAlign: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#111c35'}
            onMouseLeave={e => e.currentTarget.style.background = '#0d1425'}
          >
            <HiUserGroup style={{ width: 22, height: 22, color: '#378add', margin: '0 auto 8px' }} />
            <div style={{ fontSize: 12, fontWeight: 600, color: '#8a94a8' }}>View Preferences</div>
          </Link>
          <Link
            to="/admin/allocation"
            style={{
              background: '#0d1425', padding: '18px 16px',
              textDecoration: 'none', textAlign: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#111c35'}
            onMouseLeave={e => e.currentTarget.style.background = '#0d1425'}
          >
            <HiCpuChip style={{ width: 22, height: 22, color: '#c9a84c', margin: '0 auto 8px' }} />
            <div style={{ fontSize: 12, fontWeight: 600, color: '#8a94a8' }}>Run Allocation</div>
          </Link>
          <Link
            to="/admin/settings"
            style={{
              background: '#0d1425', padding: '18px 16px',
              textDecoration: 'none', textAlign: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#111c35'}
            onMouseLeave={e => e.currentTarget.style.background = '#0d1425'}
          >
            <HiCog6Tooth style={{ width: 22, height: 22, color: '#1d9e75', margin: '0 auto 8px' }} />
            <div style={{ fontSize: 12, fontWeight: 600, color: '#8a94a8' }}>Settings</div>
          </Link>
        </div>
      </div>

    </motion.div>
  );
}