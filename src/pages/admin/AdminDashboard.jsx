import { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import {
  HiAcademicCap, HiHome, HiBookOpen, HiUserGroup, HiCog6Tooth,
  HiArrowRightOnRectangle, HiBars3, HiChartBar, HiCpuChip,
  HiUsers, HiDocumentText, HiCheckBadge
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const sidebarLinks = [
  { label: 'Dashboard', path: '/admin', icon: HiHome },
  { label: 'Courses', path: '/admin/courses', icon: HiBookOpen },
  { label: 'Preferences', path: '/admin/preferences', icon: HiUserGroup },
  { label: 'Allocation', path: '/admin/allocation', icon: HiCpuChip },
  { label: 'Reports', path: '/admin/reports', icon: HiChartBar },
  { label: 'Settings', path: '/admin/settings', icon: HiCog6Tooth },
];

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
    } catch (e) {
      toast.error('Logout failed');
    }
  }

  const isActive = (path) => location.pathname === path;
  const isExactDashboard = location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-navy-950 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
            <div className="w-9 h-9 bg-gradient-to-br from-gold-300 to-gold-500 rounded-xl flex items-center justify-center">
              <HiAcademicCap className="w-5 h-5 text-navy-900" />
            </div>
            <div>
              <span className="text-lg font-bold font-display text-white">VUCA</span>
              <p className="text-[10px] text-white/40 leading-none">Admin Panel</p>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {sidebarLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.path) ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="px-3 py-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <HiArrowRightOnRectangle className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
                <HiBars3 className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold font-display text-slate-900">
                  {sidebarLinks.find(l => isActive(l.path))?.label || 'Dashboard'}
                </h1>
                <p className="text-xs text-slate-400">Admin Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-navy-600 bg-navy-50 px-2.5 py-1 rounded-lg">Admin</span>
              <div className="w-9 h-9 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center text-navy-900 font-semibold text-sm">
                {userProfile?.name?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          {isExactDashboard ? <AdminOverview /> : <Outlet />}
        </main>
      </div>
    </div>
  );
}

const CHART_COLORS = ['#2d4aff', '#ffc107', '#10b981', '#f43f5e', '#8b5cf6', '#f97316'];

function AdminOverview() {
  const [stats, setStats] = useState({ students: 0, courses: 0, allocated: 0, unallocated: 0 });
  const [courseData, setCourseData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [studentsSnap, coursesSnap, allocSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'courses')),
          getDocs(collection(db, 'allocations')),
        ]);

        const students = studentsSnap.docs.filter(d => d.data().role === 'student');
        const courses = coursesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        setStats({
          students: students.length,
          courses: courses.length,
          allocated: allocSnap.size,
          unallocated: students.length - allocSnap.size,
        });

        setCourseData(courses.slice(0, 6).map(c => ({
          name: c.courseName?.length > 15 ? c.courseName.substring(0, 15) + '..' : c.courseName,
          capacity: c.seatCapacity || 0,
          remaining: c.remainingSeats ?? c.seatCapacity ?? 0,
          enrolled: (c.seatCapacity || 0) - (c.remainingSeats ?? c.seatCapacity ?? 0),
        })));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Students', value: stats.students, icon: HiUsers, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Total Courses', value: stats.courses, icon: HiBookOpen, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Allocated', value: stats.allocated, icon: HiCheckBadge, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Unallocated', value: stats.unallocated, icon: HiDocumentText, color: 'text-rose-500', bg: 'bg-rose-50' },
  ];

  const pieData = [
    { name: 'Allocated', value: stats.allocated || 0 },
    { name: 'Unallocated', value: stats.unallocated || 0 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-navy-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            className="bg-white rounded-2xl border border-slate-200 p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">{card.label}</p>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-base font-semibold font-display text-slate-900 mb-4">Course Enrollment</h3>
          {courseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={courseData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="capacity" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Capacity" />
                <Bar dataKey="enrolled" fill="#2d4aff" radius={[4, 4, 0, 0]} name="Enrolled" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 text-center py-12">No course data yet</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-base font-semibold font-display text-slate-900 mb-4">Allocation Status</h3>
          {(stats.allocated > 0 || stats.unallocated > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 text-center py-12">No allocation data yet</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
