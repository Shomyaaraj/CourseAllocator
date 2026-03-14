import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import {
  HiAcademicCap, HiHome, HiQueueList, HiClipboardDocumentCheck,
  HiArrowRightOnRectangle, HiBars3, HiUser, HiBookOpen,
  HiBuildingOffice2, HiCalendarDays, HiCheckBadge, HiChevronDown,
  HiEnvelope, HiShieldCheck, HiClock, HiExclamationTriangle,
  HiChartBar, HiSparkles, HiIdentification
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

const sidebarLinks = [
  { label: 'Dashboard', path: '/student', icon: HiHome },
  { label: 'Preferences', path: '/student/preferences', icon: HiQueueList },
  { label: 'Results', path: '/student/results', icon: HiClipboardDocumentCheck },
];

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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-100">
            <div className="w-9 h-9 bg-gradient-to-br from-navy-600 to-navy-800 rounded-xl flex items-center justify-center">
              <HiAcademicCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold font-display text-navy-800">VUCA</span>
              <p className="text-[10px] text-slate-400 leading-none">Student Portal</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            {sidebarLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-navy-600 text-white shadow-sm shadow-navy-500/30'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <link.icon className="w-4.5 h-4.5 w-[18px] h-[18px] shrink-0" />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User + Logout */}
          <div className="px-3 py-4 border-t border-slate-100 space-y-1">
            <div className="flex items-center gap-2.5 px-3 py-2">
              <div className="w-8 h-8 bg-gradient-to-br from-navy-500 to-navy-700 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                {userProfile?.name?.charAt(0) || 'S'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate">{userProfile?.name || 'Student'}</p>
                <p className="text-[10px] text-slate-400 truncate">{userProfile?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors"
            >
              <HiArrowRightOnRectangle className="w-4 h-4 shrink-0" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main Area ── */}
      <div className="sidebar-offset">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg shrink-0"
                onClick={() => setSidebarOpen(true)}
              >
                <HiBars3 className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-base font-semibold font-display text-slate-900 truncate">
                  {sidebarLinks.find(l => isActive(l.path))?.label || 'Dashboard'}
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Welcome back, {userProfile?.name?.split(' ')[0] || 'Student'}
                </p>
              </div>
            </div>

            {/* Profile Dropdown */}
            <div className="relative shrink-0" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 group"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-navy-500 to-navy-700 rounded-full flex items-center justify-center text-white font-semibold text-sm ring-2 ring-slate-100 group-hover:ring-navy-200 transition-all">
                  {userProfile?.name?.charAt(0) || 'S'}
                </div>
                <HiChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 hidden sm:block ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.14 }}
                    className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50"
                  >
                    <div className="bg-gradient-to-br from-navy-600 to-navy-800 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white text-base font-bold">
                          {userProfile?.name?.charAt(0) || 'S'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{userProfile?.name || 'Student'}</p>
                          <p className="text-white/50 text-xs truncate">{userProfile?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 space-y-2 text-xs border-b border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500">
                        <HiIdentification className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{userProfile?.registrationNumber || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <HiBuildingOffice2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{userProfile?.department || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <HiCalendarDays className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span>Semester {userProfile?.semester || '—'}</span>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => { setProfileOpen(false); handleLogout(); }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <HiArrowRightOnRectangle className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6">
          {isExactDashboard
            ? <StudentOverview userProfile={userProfile} settings={settings} courses={courses} />
            : <Outlet />
          }
        </main>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Student Overview (Dashboard Home)
───────────────────────────────────────────── */
function StudentOverview({ userProfile, settings, courses }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [deadline, setDeadline] = useState(null);

  useEffect(() => {
    if (!settings?.preferenceDeadline) return;
    const dl = settings.preferenceDeadline;
    const date = dl?.seconds ? new Date(dl.seconds * 1000) : new Date(dl);
    setDeadline(date);
  }, [settings]);

  // Countdown
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

  // Find the allocated course object
  const allocatedCourse = userProfile?.allocatedCourse
    ? courses.find(c => c.courseId === userProfile.allocatedCourse || c.id === userProfile.allocatedCourse)
    : null;

  const statCards = [
    {
      label: 'Preferences',
      value: userProfile?.preferences?.length || 0,
      icon: HiQueueList,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      sub: 'submitted',
    },
    {
      label: 'Completed',
      value: userProfile?.completedCourses?.length || 0,
      icon: HiCheckBadge,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      sub: 'courses',
    },
    {
      label: 'Status',
      value: userProfile?.allocatedCourse ? 'Allocated' : 'Pending',
      icon: HiChartBar,
      color: userProfile?.allocatedCourse ? 'text-emerald-500' : 'text-amber-500',
      bg: userProfile?.allocatedCourse ? 'bg-emerald-50' : 'bg-amber-50',
      sub: 'allocation',
      isText: true,
    },
  ];

  return (
    <motion.div
      className="space-y-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* ── Deadline Banner ── */}
      {deadline && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-5 ${
            deadlinePassed
              ? 'bg-rose-50 border border-rose-200'
              : 'bg-gradient-to-r from-navy-700 to-navy-900'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5">
              {deadlinePassed
                ? <HiExclamationTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                : <HiClock className="w-5 h-5 text-gold-300 shrink-0" />
              }
              <div>
                <p className={`text-sm font-semibold ${deadlinePassed ? 'text-rose-700' : 'text-white'}`}>
                  {deadlinePassed ? 'Preference Deadline Passed' : 'Course Preference Deadline'}
                </p>
                <p className={`text-xs mt-0.5 ${deadlinePassed ? 'text-rose-500' : 'text-white/50'}`}>
                  {deadline.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            {!deadlinePassed && (
              <Link
                to="/student/preferences"
                className="shrink-0 px-3 py-1.5 bg-gold-400 hover:bg-gold-500 text-navy-900 text-xs font-bold rounded-lg transition-colors"
              >
                Submit Now →
              </Link>
            )}
          </div>

          {!deadlinePassed && timeLeft && (
            <div className="flex gap-2 mt-4">
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hrs', value: timeLeft.hours },
                { label: 'Min', value: timeLeft.minutes },
                { label: 'Sec', value: timeLeft.seconds },
              ].map(item => (
                <div key={item.label} className="flex-1 bg-white/10 rounded-xl py-2 text-center">
                  <p className="text-xl font-bold text-white font-display leading-none">
                    {String(item.value).padStart(2, '0')}
                  </p>
                  <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wide">{item.label}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ── Profile Card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-navy-600 to-navy-800 px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-2xl font-bold font-display shrink-0">
              {userProfile?.name?.charAt(0) || 'S'}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white font-display truncate">{userProfile?.name || 'Student'}</h2>
              <p className="text-white/50 text-sm truncate">{userProfile?.email}</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 divide-x divide-slate-100">
          {[
            { icon: HiIdentification, label: 'Reg. No.', value: userProfile?.registrationNumber },
            { icon: HiBuildingOffice2, label: 'Department', value: userProfile?.department },
            { icon: HiCalendarDays, label: 'Semester', value: userProfile?.semester ? `Semester ${userProfile.semester}` : null },
            { icon: HiChartBar, label: 'CGPA', value: userProfile?.cgpa != null ? `${Number(userProfile.cgpa).toFixed(2)} / 10` : null },
          ].map((f, i) => (
            <div key={f.label} className={`${i > 0 ? 'pl-4' : ''} min-w-0`}>
              <div className="flex items-center gap-1 text-slate-400 mb-1">
                <f.icon className="w-3 h-3 shrink-0" />
                <span className="text-[10px] font-medium uppercase tracking-wide">{f.label}</span>
              </div>
              <p className="text-sm font-semibold text-slate-700 truncate">{f.value || '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            className="bg-white rounded-2xl border border-slate-200 p-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <div className={`w-9 h-9 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon className={`w-4.5 h-4.5 w-[18px] h-[18px] ${card.color}`} />
            </div>
            <p className={`font-bold ${card.isText ? 'text-sm' : 'text-2xl'} text-slate-900 leading-tight`}>
              {card.value}
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">{card.label} {card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Allocated Course ── */}
      {userProfile?.allocatedCourse && (
        <div className="bg-white rounded-2xl border border-emerald-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
              <HiSparkles className="w-4 h-4 text-emerald-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Allocated Course</h3>
          </div>
          {allocatedCourse ? (
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                <HiBookOpen className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-slate-900">{allocatedCourse.courseName}</p>
                <p className="text-xs text-slate-400 mt-0.5">{allocatedCourse.courseId}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {allocatedCourse.department && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-md">
                      {allocatedCourse.department}
                    </span>
                  )}
                  {allocatedCourse.timetableSlot && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-medium rounded-md">
                      <HiClock className="w-3 h-3" />
                      {allocatedCourse.timetableSlot}
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[11px] font-medium rounded-md">
                    Confirmed ✓
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600 font-medium">{userProfile.allocatedCourse}</p>
          )}
        </div>
      )}

      {/* ── Available Courses Quick View ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <HiBookOpen className="w-4 h-4 text-navy-500" />
            <h3 className="text-sm font-semibold text-slate-900">Available Courses</h3>
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {courses.length}
            </span>
          </div>
          <Link
            to="/student/preferences"
            className="text-xs font-semibold text-navy-600 hover:text-navy-800 transition-colors"
          >
            Select Preferences →
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <HiBookOpen className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No courses available yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {courses.slice(0, 5).map(course => {
              const seats = course.remainingSeats ?? course.seatCapacity ?? 0;
              const isFull = seats <= 0;
              return (
                <div key={course.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-8 h-8 bg-navy-50 rounded-lg flex items-center justify-center shrink-0">
                    <HiBookOpen className="w-4 h-4 text-navy-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">{course.courseName}</p>
                    <p className="text-xs text-slate-400">{course.courseId} · {course.department || 'General'}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isFull ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'}`}>
                      {isFull ? 'Full' : `${seats} seats`}
                    </span>
                    {course.timetableSlot && (
                      <p className="text-[10px] text-slate-400 mt-0.5">{course.timetableSlot}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {courses.length > 5 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
            <Link to="/student/preferences" className="text-xs font-semibold text-navy-600 hover:text-navy-800 transition-colors">
              View all {courses.length} courses →
            </Link>
          </div>
        )}
      </div>

      {/* ── Completed Courses ── */}
      {userProfile?.completedCourses?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <HiCheckBadge className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-semibold text-slate-900">Completed Courses</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {userProfile.completedCourses.map(course => (
              <span key={course} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg border border-emerald-100">
                {course}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
