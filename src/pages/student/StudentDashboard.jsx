import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  HiAcademicCap, HiHome, HiQueueList, HiClipboardDocumentCheck,
  HiArrowRightOnRectangle, HiBars3, HiXMark, HiUser, HiBookOpen,
  HiBuildingOffice2, HiCalendar, HiCheckBadge, HiChevronDown, HiEnvelope, HiShieldCheck
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
  const profileRef = useRef(null);

  // Close profile dropdown on outside click
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
    async function fetchSettings() {
      try {
        const snap = await getDoc(doc(db, 'settings', 'general'));
        if (snap.exists()) setSettings(snap.data());
      } catch (e) { console.error(e); }
    }
    fetchSettings();
  }, []);

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
  const isExactDashboard = location.pathname === '/student';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-100">
            <div className="w-9 h-9 bg-gradient-to-br from-navy-600 to-navy-800 rounded-xl flex items-center justify-center">
              <HiAcademicCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold font-display text-navy-800">VUCA</span>
              <p className="text-[10px] text-slate-400 leading-none">Student Portal</p>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {sidebarLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.path) ? 'bg-navy-50 text-navy-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <link.icon className={`w-5 h-5 ${isActive(link.path) ? 'text-navy-600' : ''}`} />
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="px-3 py-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors"
            >
              <HiArrowRightOnRectangle className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Area */}
      <div className="flex-1 lg:pl-64">
        {/* Top Bar */}
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
                <p className="text-xs text-slate-400">Welcome back, {userProfile?.name?.split(' ')[0] || 'Student'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Profile Avatar + Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 group"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-navy-500 to-navy-700 rounded-full flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white ring-offset-1 group-hover:ring-navy-300 transition-all">
                    {userProfile?.name?.charAt(0) || 'S'}
                  </div>
                  <HiChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 hidden sm:block ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden z-50"
                    >
                      {/* User Info Header */}
                      <div className="bg-gradient-to-br from-navy-600 to-navy-800 px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white text-lg font-bold">
                            {userProfile?.name?.charAt(0) || 'S'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm truncate">{userProfile?.name || 'Student'}</p>
                            <p className="text-white/60 text-xs truncate">{userProfile?.email}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold-400/20 text-gold-300 text-xs font-medium rounded-full">
                            <HiShieldCheck className="w-3 h-3" /> Student
                          </span>
                          {userProfile?.department && (
                            <span className="px-2 py-0.5 bg-white/10 text-white/70 text-xs rounded-full truncate max-w-[130px]">{userProfile.department}</span>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="px-4 py-3 space-y-2 border-b border-slate-100">
                        <div className="flex items-center gap-2.5 text-slate-600 text-xs">
                          <HiUser className="w-4 h-4 text-slate-400" />
                          <span>{userProfile?.registrationNumber || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-600 text-xs">
                          <HiCalendar className="w-4 h-4 text-slate-400" />
                          <span>Semester {userProfile?.semester || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-600 text-xs">
                          <HiEnvelope className="w-4 h-4 text-slate-400" />
                          <span className="truncate">{userProfile?.email}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="px-3 py-2">
                        <button
                          onClick={() => { setProfileOpen(false); handleLogout(); }}
                          className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
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
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6">
          {isExactDashboard ? (
            <StudentOverview userProfile={userProfile} settings={settings} />
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}

function StudentOverview({ userProfile, settings }) {
  const profileFields = [
    { icon: HiUser, label: 'Name', value: userProfile?.name },
    { icon: HiBookOpen, label: 'Registration No.', value: userProfile?.registrationNumber },
    { icon: HiBuildingOffice2, label: 'Department', value: userProfile?.department },
    { icon: HiCalendar, label: 'Semester', value: userProfile?.semester ? `Semester ${userProfile.semester}` : null },
  ];

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-navy-600 to-navy-800 px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-2xl font-bold font-display">
              {userProfile?.name?.charAt(0) || 'S'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-display">{userProfile?.name || 'Student'}</h2>
              <p className="text-white/60 text-sm">{userProfile?.email}</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {profileFields.map((field) => (
            <div key={field.label}>
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <field.icon className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{field.label}</span>
              </div>
              <p className="text-sm font-semibold text-slate-700">{field.value || '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <HiCheckBadge className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Completed Courses</p>
              <p className="text-2xl font-bold text-slate-900">{userProfile?.completedCourses?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <HiQueueList className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Preferences Submitted</p>
              <p className="text-2xl font-bold text-slate-900">{userProfile?.preferences?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-50 rounded-xl flex items-center justify-center">
              <HiClipboardDocumentCheck className="w-5 h-5 text-gold-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Allocated Course</p>
              <p className="text-lg font-bold text-slate-900 truncate">{userProfile?.allocatedCourse || 'Pending'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Completed Courses */}
      {userProfile?.completedCourses?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-base font-semibold font-display text-slate-900 mb-4">Completed Courses</h3>
          <div className="flex flex-wrap gap-2">
            {userProfile.completedCourses.map((course) => (
              <span key={course} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg">
                {course}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
