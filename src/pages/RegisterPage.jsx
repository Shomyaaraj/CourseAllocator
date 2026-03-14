import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { HiAcademicCap, HiEnvelope, HiLockClosed, HiUser, HiIdentification, HiBuildingOffice2, HiEye, HiEyeSlash } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const departments = [
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
  'Chemical Engineering',
  'Biotechnology',
  'Business Administration',
  'Mathematics',
  'Physics',
  'Chemistry'
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    semester: '1',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (formData.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    if (!formData.department) {
      return toast.error('Please select a department');
    }

    setLoading(true);
    try {
      await signup(formData.email, formData.password, {
        name: formData.name,
        registrationNumber: formData.registrationNumber,
        department: formData.department,
        semester: parseInt(formData.semester),
      });
      toast.success('Account created successfully!');
      navigate('/student');
    } catch (err) {
      const messages = {
        'auth/email-already-in-use': 'An account with this email already exists',
        'auth/invalid-email': 'Invalid email address',
        'auth/weak-password': 'Password is too weak',
      };
      toast.error(messages[err.code] || 'Registration failed. Please try again.');
    }
    setLoading(false);
  }

  const inputClass = "w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all";

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-gold-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-navy-500/15 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 20, delay: 0.2 }}
            className="w-24 h-24 bg-gradient-to-br from-gold-300 to-gold-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-gold-400/30"
          >
            <HiAcademicCap className="w-14 h-14 text-navy-900" />
          </motion.div>
          <motion.h2
            className="text-4xl font-bold text-white font-display mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Join VUCA
          </motion.h2>
          <motion.p
            className="text-lg text-white/50 max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Register to start selecting your preferred courses and get smart allocation recommendations.
          </motion.p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-10 sm:p-12 overflow-y-auto">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-navy-600 to-navy-800 rounded-xl flex items-center justify-center">
              <HiAcademicCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold font-display text-navy-800">VUCA</span>
          </div>

          <h1 className="text-2xl font-bold font-display text-slate-900 mb-3">Create Account</h1>
          <p className="text-slate-500 mb-10">Fill in your details to register</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder="John Doe" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Registration Number</label>
              <div className="relative">
                <HiIdentification className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} className={inputClass} placeholder="21BCE7001" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <div className="relative">
                <HiEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="your.email@vignan.ac.in" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                <div className="relative">
                  <HiBuildingOffice2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <select name="department" value={formData.department} onChange={handleChange} className={`${inputClass} appearance-none`} required>
                    <option value="">Select</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Semester</label>
                <select name="semester" value={formData.semester} onChange={handleChange} className={`${inputClass} pl-4`}>
                  {[1,2,3,4,5,6,7,8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className={inputClass} placeholder="Min 6 characters" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={inputClass} placeholder="Re-enter password" required />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-navy-600 to-navy-700 hover:from-navy-700 hover:to-navy-800 text-white font-semibold rounded-xl shadow-lg shadow-navy-500/25 hover:shadow-navy-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-3"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-navy-600 hover:text-navy-700 transition-colors">
              Sign in
            </Link>
          </p>

          <Link to="/" className="block mt-4 text-center text-sm text-slate-400 hover:text-slate-600 transition-colors">
            ← Back to home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
