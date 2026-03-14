import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { HiAcademicCap, HiEnvelope, HiLockClosed, HiEye, HiEyeSlash, HiUser, HiShieldCheck } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('student'); // 'student' | 'admin'
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (err) {
      const messages = {
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/invalid-email': 'Invalid email address',
        'auth/invalid-credential': 'Invalid email or password',
      };
      toast.error(messages[err.code] || 'Login failed. Please try again.');
    }
    setLoading(false);
  }

  const isAdmin = mode === 'admin';

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left decorative panel */}
      <div className={`hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12 transition-colors duration-500 ${isAdmin ? 'bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950' : 'bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950'}`}>
        <div className="absolute inset-0">
          <div className={`absolute top-20 left-20 w-72 h-72 rounded-full blur-3xl ${isAdmin ? 'bg-amber-500/20' : 'bg-navy-500/20'}`} />
          <div className={`absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl ${isAdmin ? 'bg-amber-300/10' : 'bg-gold-400/10'}`} />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
        <div className="relative z-10 text-center">
          <motion.div
            key={mode}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 20, delay: 0.1 }}
            className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl ${isAdmin ? 'bg-gradient-to-br from-amber-300 to-amber-500 shadow-amber-400/30' : 'bg-gradient-to-br from-gold-300 to-gold-500 shadow-gold-400/30'}`}
          >
            {isAdmin
              ? <HiShieldCheck className="w-14 h-14 text-amber-900" />
              : <HiAcademicCap className="w-14 h-14 text-navy-900" />
            }
          </motion.div>
          <motion.h2
            key={`title-${mode}`}
            className="text-4xl font-bold text-white font-display mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {isAdmin ? 'Admin Portal' : 'Welcome Back'}
          </motion.h2>
          <motion.p
            key={`desc-${mode}`}
            className="text-lg text-white/50 max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {isAdmin
              ? 'Sign in as an administrator to manage courses, allocations, and student data.'
              : 'Sign in to access your course allocation dashboard and manage your preferences.'}
          </motion.p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-10 sm:p-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-navy-600 to-navy-800 rounded-xl flex items-center justify-center">
              <HiAcademicCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold font-display text-navy-800">VUCA</span>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-8">
            <button
              onClick={() => setMode('student')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode === 'student'
                  ? 'bg-white shadow text-navy-700'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <HiUser className="w-4 h-4" />
              Student
            </button>
            <button
              onClick={() => setMode('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode === 'admin'
                  ? 'bg-amber-500 shadow text-white'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <HiShieldCheck className="w-4 h-4" />
              Admin
            </button>
          </div>

          <h1 className="text-2xl font-bold font-display text-slate-900 mb-3">
            {isAdmin ? 'Admin Sign In' : 'Sign In'}
          </h1>
          <p className="text-slate-500 mb-10">
            {isAdmin ? 'Enter your admin credentials' : 'Enter your credentials to continue'}
          </p>

          {isAdmin && (
            <div className="mb-6 flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
              <HiShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
              <span>
                Use your admin account credentials. If you don't have one, ask the system administrator to set your role to <strong>admin</strong> in Firestore.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <div className="relative">
                <HiEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all"
                  placeholder={isAdmin ? 'admin@vignan.ac.in' : 'your.email@vignan.ac.in'}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 mt-2 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                isAdmin
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/25 hover:shadow-amber-500/40'
                  : 'bg-gradient-to-r from-navy-600 to-navy-700 hover:from-navy-700 hover:to-navy-800 shadow-navy-500/25 hover:shadow-navy-500/40'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                isAdmin ? 'Sign In as Admin' : 'Sign In'
              )}
            </button>
          </form>

          {!isAdmin && (
            <p className="mt-8 text-center text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-navy-600 hover:text-navy-700 transition-colors">
                Register here
              </Link>
            </p>
          )}

          <Link to="/" className="block mt-4 text-center text-sm text-slate-400 hover:text-slate-600 transition-colors">
            ← Back to home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
