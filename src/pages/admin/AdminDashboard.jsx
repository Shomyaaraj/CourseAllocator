import { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useTheme } from 'styled-components';
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
  { label: 'Dashboard',   path: '/admin',             icon: HiHome },
  { label: 'Courses',     path: '/admin/courses',     icon: HiBookOpen },
  { label: 'Preferences', path: '/admin/preferences', icon: HiUserGroup },
  { label: 'Allocation',  path: '/admin/allocation',  icon: HiCpuChip },
  { label: 'Reports',     path: '/admin/reports',     icon: HiChartBar },
  { label: 'Settings',    path: '/admin/settings',    icon: HiCog6Tooth },
];

const CHART_COLORS = ['#c9a84c', '#1d9e75', '#378add', '#e24b4a', '#7f77dd', '#ba7517'];

export default function AdminDashboard() {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.mode === 'dark';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const accentColor = theme.colors.accent;
  const textMain = isDark ? '#e8e2d0' : theme.colors.primary;
  const textMuted = isDark ? '#3a4a60' : theme.colors.textLight;
  const borderColor = isDark ? 'rgba(201,168,76,0.1)' : theme.colors.border;
  const sidebarBg = isDark ? '#060a14' : theme.colors.cardBg;
  const mainBg = isDark ? '#080d1a' : theme.colors.background;
  const headerBg = isDark ? 'rgba(8,13,26,0.95)' : 'rgba(255,255,255,0.95)';

  const navLinkStyle = (path) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', borderRadius: 9,
    fontSize: 13, fontWeight: 500, textDecoration: 'none',
    transition: 'all 0.15s',
    background: location.pathname === path ? (isDark ? 'rgba(201,168,76,0.12)' : 'rgba(255,130,92,0.1)') : 'transparent',
    color: location.pathname === path ? accentColor : textMuted,
    border: location.pathname === path ? '1px solid ' + (isDark ? 'rgba(201,168,76,0.2)' : 'rgba(255,130,92,0.25)') : '1px solid transparent',
  });

  async function handleLogout() {
    try { await logout(); toast.success('Logged out'); navigate('/'); }
    catch { toast.error('Logout failed'); }
  }

  const isExactDashboard = location.pathname === '/admin';
  const activeLabel = SIDEBAR_LINKS.find(l => location.pathname === l.path)?.label || 'Dashboard';
  const initials = userProfile?.name?.charAt(0) || 'A';

  return (
    <div style={{ minHeight: '100vh', background: mainBg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1024px) {
          .admin-sidebar { transform: translateX(-100%) !important; }
          .admin-sidebar.open { transform: translateX(0) !important; }
          .admin-main { margin-left: 0 !important; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${isDark ? 'rgba(201,168,76,0.15)' : 'rgba(255,130,92,0.2)'}; border-radius: 2px; }
      `}</style>

      {/* Sidebar */}
      <aside
        className={'admin-sidebar ' + (sidebarOpen ? 'open' : '')}
        style={{
          position: 'fixed', inset: '0 auto 0 0', zIndex: 40, width: 240,
          background: sidebarBg, borderRight: '1px solid ' + borderColor,
          display: 'flex', flexDirection: 'column', transition: 'transform 0.3s ease',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 20px 18px', borderBottom: '1px solid ' + borderColor }}>
          <div style={{
            width: 36, height: 36, flexShrink: 0, borderRadius: 10,
            background: isDark ? 'rgba(201,168,76,0.1)' : 'rgba(255,130,92,0.1)',
            border: '1px solid ' + (isDark ? 'rgba(201,168,76,0.25)' : 'rgba(255,130,92,0.25)'),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <HiShieldCheck style={{ width: 18, height: 18, color: accentColor }} />
          </div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 17, fontWeight: 700, color: accentColor, lineHeight: 1.1 }}>VUCA</div>
            <div style={{ fontSize: 10, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin Panel</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: textMuted, cursor: 'pointer', padding: 4 }}>
            <HiXMark style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SIDEBAR_LINKS.map(({ label, path, icon: Icon }) => (
            <Link key={path} to={path} onClick={() => setSidebarOpen(false)} style={navLinkStyle(path)}>
              <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid ' + (isDark ? 'rgba(255,255,255,0.04)' : borderColor) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', marginBottom: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: isDark ? 'rgba(201,168,76,0.1)' : 'rgba(255,130,92,0.1)',
              border: '1px solid ' + (isDark ? 'rgba(201,168,76,0.2)' : 'rgba(255,130,92,0.2)'),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: accentColor,
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: textMain, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userProfile?.name || 'Admin'}
              </div>
              <div style={{ fontSize: 10, color: textMuted }}>Administrator</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 12px', background: 'none', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#e24b4a' }}
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 30 }} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="admin-main" style={{ marginLeft: 240, minHeight: '100vh' }}>

        {/* Top bar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 20,
          background: headerBg, backdropFilter: 'blur(12px)',
          borderBottom: '1px solid ' + borderColor,
          padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setSidebarOpen(true)} style={{ padding: 6, background: 'none', border: 'none', color: textMuted, cursor: 'pointer' }}>
              <HiBars3 style={{ width: 20, height: 20 }} />
            </button>
            <div>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 16, fontWeight: 700, color: textMain }}>{activeLabel}</div>
              <div style={{ fontSize: 11, color: textMuted }}>Admin Panel</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(226,75,74,0.06)', border: '1px solid rgba(226,75,74,0.15)', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#e24b4a' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(226,75,74,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(226,75,74,0.06)'}
            >
              <HiArrowRightOnRectangle style={{ width: 14, height: 14 }} />
              Sign Out
            </button>
            <div style={{ padding: '5px 12px', background: isDark ? 'rgba(201,168,76,0.08)' : 'rgba(255,130,92,0.08)', border: '1px solid ' + (isDark ? 'rgba(201,168,76,0.2)' : 'rgba(255,130,92,0.2)'), borderRadius: 8, fontSize: 11, fontWeight: 600, color: accentColor, letterSpacing: '0.06em' }}>
              ADMIN
            </div>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: isDark ? 'rgba(201,168,76,0.1)' : 'rgba(255,130,92,0.1)', border: '1px solid ' + (isDark ? 'rgba(201,168,76,0.25)' : 'rgba(255,130,92,0.25)'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: accentColor }}>
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
  const theme = useTheme();
  const isDark = theme.mode === 'dark';

  const accentColor = theme.colors.accent;
  const textMain = isDark ? '#e8e2d0' : theme.colors.primary;
  const textMuted = isDark ? '#3a4a60' : theme.colors.textLight;
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : theme.colors.border;
  const cardBg = isDark ? '#0d1425' : theme.colors.cardBg;
  const cardHoverBg = isDark ? '#111c35' : theme.colors.secondaryBg;

  const cardStyle = { background: cardBg, border: '1px solid ' + borderColor, borderRadius: 14 };

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
        setStats({ students: students.length, courses: courses.length, allocated: allocSnap.size, unallocated: Math.max(0, students.length - allocSnap.size) });
        setCourseData(courses.slice(0, 6).map(c => ({
          name: c.courseName?.length > 12 ? c.courseName.substring(0, 12) + '..' : (c.courseName || 'Unknown'),
          capacity: c.seatCapacity || 0,
          enrolled: (c.seatCapacity || 0) - (c.remainingSeats ?? c.seatCapacity ?? 0),
        })));
        if (settingsSnap.exists() && settingsSnap.data().preferenceDeadline) {
          const dl = settingsSnap.data().preferenceDeadline;
          setDeadline(dl?.seconds ? new Date(dl.seconds * 1000) : new Date(dl));
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    fetchStats();
  }, []);

  const deadlinePast = deadline && deadline < new Date();
  const pieData = [
    { name: 'Allocated', value: stats.allocated || 0 },
    { name: 'Unallocated', value: stats.unallocated || 0 },
  ];

  const tooltipStyle = {
    background: cardBg,
    border: '1px solid ' + (isDark ? 'rgba(201,168,76,0.15)' : theme.colors.border),
    borderRadius: 8, color: textMain, fontSize: 12,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ width: 36, height: 36, border: '3px solid ' + (isDark ? 'rgba(201,168,76,0.15)' : 'rgba(255,130,92,0.15)'), borderTopColor: accentColor, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  return (
    <motion.div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

      {/* Deadline Alert */}
      {deadline && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
          background: deadlinePast ? 'rgba(226,75,74,0.06)' : 'rgba(55,138,221,0.06)',
          border: deadlinePast ? '1px solid rgba(226,75,74,0.18)' : '1px solid rgba(55,138,221,0.18)',
          borderRadius: 12,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: deadlinePast ? 'rgba(226,75,74,0.1)' : 'rgba(55,138,221,0.1)', border: deadlinePast ? '1px solid rgba(226,75,74,0.2)' : '1px solid rgba(55,138,221,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {deadlinePast ? <HiExclamationTriangle style={{ width: 17, height: 17, color: '#e24b4a' }} /> : <HiClock style={{ width: 17, height: 17, color: '#378add' }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: deadlinePast ? '#e24b4a' : '#378add', marginBottom: 2 }}>
              Preference Deadline: {deadlinePast ? 'Passed' : 'Active'}
            </div>
            <div style={{ fontSize: 11, color: textMuted }}>
              {deadline.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <Link to="/admin/settings" style={{ flexShrink: 0, padding: '6px 14px', fontSize: 12, fontWeight: 600, background: deadlinePast ? 'rgba(226,75,74,0.1)' : 'rgba(55,138,221,0.1)', border: deadlinePast ? '1px solid rgba(226,75,74,0.2)' : '1px solid rgba(55,138,221,0.2)', color: deadlinePast ? '#e24b4a' : '#378add', borderRadius: 8, textDecoration: 'none' }}>
            Edit →
          </Link>
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { icon: HiUsers, color: '#378add', bg: 'rgba(55,138,221,0.1)', border: 'rgba(55,138,221,0.15)', val: stats.students, label: 'Total Students' },
          { icon: HiBookOpen, color: '#7f77dd', bg: 'rgba(127,119,221,0.1)', border: 'rgba(127,119,221,0.15)', val: stats.courses, label: 'Total Courses' },
          { icon: HiCheckBadge, color: '#1d9e75', bg: 'rgba(29,158,117,0.1)', border: 'rgba(29,158,117,0.15)', val: stats.allocated, label: 'Allocated' },
          { icon: HiDocumentText, color: '#e24b4a', bg: 'rgba(226,75,74,0.1)', border: 'rgba(226,75,74,0.15)', val: stats.unallocated, label: 'Unallocated' },
        ].map(({ icon: Icon, color, bg, border, val, label }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} style={{ ...cardStyle, padding: '20px' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, marginBottom: 14, background: bg, border: '1px solid ' + border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon style={{ width: 18, height: 18, color }} />
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: textMain, lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: 11, color: textMuted, fontWeight: 500, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Bar chart */}
        <div style={cardStyle}>
          <div style={{ padding: '18px 20px 12px', borderBottom: '1px solid ' + borderColor, display: 'flex', alignItems: 'center', gap: 8 }}>
            <HiChartBar style={{ width: 15, height: 15, color: accentColor }} />
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 15, fontWeight: 700, color: textMain }}>Course Enrollment</span>
          </div>
          <div style={{ padding: '16px 8px 16px 0' }}>
            {courseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={courseData} margin={{ left: -10, right: 10 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: textMuted }} axisLine={{ stroke: borderColor }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: textMuted }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }} />
                  <Bar
  dataKey="capacity"
  fill={isDark ? 'rgba(255,255,255,0.2)' : '#64748B'}
  radius={[4, 4, 0, 0]}
  name="Capacity"
/>

<Bar
  dataKey="enrolled"
  fill="#FF825C"
  radius={[4, 4, 0, 0]}
  name="Enrolled"
/>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 0', color: textMuted, fontSize: 13 }}>No course data yet</div>
            )}
          </div>
        </div>

        {/* Pie chart */}
        <div style={cardStyle}>
          <div style={{ padding: '18px 20px 12px', borderBottom: '1px solid ' + borderColor, display: 'flex', alignItems: 'center', gap: 8 }}>
            <HiCpuChip style={{ width: 15, height: 15, color: accentColor }} />
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 15, fontWeight: 700, color: textMain }}>Allocation Status</span>
          </div>
          <div style={{ padding: '16px 0' }}>
            {(stats.allocated > 0 || stats.unallocated > 0) ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={88} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={entry.name} fill={CHART_COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, padding: '0 20px' }}>
                  {[
                    { label: 'Allocated', val: stats.allocated, color: CHART_COLORS[0] },
                    { label: 'Unallocated', val: stats.unallocated, color: CHART_COLORS[1] },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: textMuted }}>
                        {label} <span style={{ color, fontWeight: 700, marginLeft: 6 }}>{val}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 0', color: textMuted, fontSize: 13 }}>No allocation data yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={cardStyle}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid ' + borderColor, display: 'flex', alignItems: 'center', gap: 8 }}>
          <HiCpuChip style={{ width: 15, height: 15, color: accentColor }} />
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 15, fontWeight: 700, color: textMain }}>Quick Actions</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: borderColor }}>
          {[
            { to: '/admin/courses', icon: HiBookOpen, color: '#7f77dd', label: 'Manage Courses' },
            { to: '/admin/preferences', icon: HiUserGroup, color: '#378add', label: 'View Preferences' },
            { to: '/admin/allocation', icon: HiCpuChip, color: accentColor, label: 'Run Allocation' },
            { to: '/admin/settings', icon: HiCog6Tooth, color: '#1d9e75', label: 'Settings' },
          ].map(({ to, icon: Icon, color, label }) => (
            <Link
              key={to} to={to}
              style={{ background: cardBg, padding: '18px 16px', textDecoration: 'none', textAlign: 'center', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = cardHoverBg}
              onMouseLeave={e => e.currentTarget.style.background = cardBg}
            >
              <Icon style={{ width: 22, height: 22, color, margin: '0 auto 8px' }} />
              <div style={{ fontSize: 12, fontWeight: 600, color: textMuted }}>{label}</div>
            </Link>
          ))}
        </div>
      </div>

    </motion.div>
  );
}