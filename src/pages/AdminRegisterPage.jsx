import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  HiShieldCheck,
  HiEnvelope,
  HiLockClosed,
  HiUser,
  HiIdentification,
  HiBuildingOffice2,
  HiEye,
  HiEyeSlash,
  HiKey,
  HiBriefcase,
  HiCheckCircle
} from 'react-icons/hi2';
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

const designations = [
  'Dean',
  'Associate Dean',
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Head of Department',
  'Academic Coordinator',
  'Examination Controller',
  'Registrar'
];

// Multi-step form stages
const STEPS = ['Invite Code', 'Personal Info', 'Account Setup'];

export default function AdminRegisterPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    inviteCode: '',
    name: '',
    employeeId: '',
    department: '',
    designation: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteVerified, setInviteVerified] = useState(false);

  const { signupAdmin } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function validateStep() {
    if (step === 0) {
      if (!formData.inviteCode.trim()) {
        toast.error('Please enter your invite code');
        return false;
      }
      return true;
    }
    if (step === 1) {
      if (!formData.name.trim()) { toast.error('Full name is required'); return false; }
      if (!formData.employeeId.trim()) { toast.error('Employee ID is required'); return false; }
      if (!formData.department) { toast.error('Please select a department'); return false; }
      if (!formData.designation) { toast.error('Please select a designation'); return false; }
      return true;
    }
    if (step === 2) {
      if (!formData.email.trim()) { toast.error('Email is required'); return false; }
      if (formData.password.length < 6) { toast.error('Password must be at least 6 characters'); return false; }
      if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return false; }
      return true;
    }
    return true;
  }

  function nextStep() {
    if (validateStep()) setStep(s => s + 1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    try {
      await signupAdmin(
        formData.email,
        formData.password,
        {
          name: formData.name,
          employeeId: formData.employeeId,
          department: formData.department,
          designation: formData.designation,
        },
        formData.inviteCode.trim()
      );
      setInviteVerified(true);
      toast.success('Admin account created successfully!');
      setTimeout(() => navigate('/admin'), 1800);
    } catch (err) {
      const messages = {
        'admin/invalid-code': 'Invalid invite code. Please check and try again.',
        'admin/code-exhausted': 'This invite code has already been fully used.',
        'admin/no-config': 'Admin registration is currently disabled. Contact your system administrator.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/weak-password': 'Password is too weak.',
      };
      toast.error(messages[err.code] || err.message || 'Registration failed. Please try again.');
    }
    setLoading(false);
  }

  const inputBase =
    'w-full px-4 py-3.5 pl-11 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold-400/40 focus:border-gold-400/60 transition-all';

  const labelClass = 'block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2';

  // Step content renderers
  const stepContent = [
    // Step 0 – Invite Code
    <motion.div
      key="step0"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gold-400/15 border border-gold-400/30 flex items-center justify-center mx-auto mb-4">
          <HiKey className="w-8 h-8 text-gold-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Enter Invite Code</h2>
        <p className="text-white/40 text-sm mt-1">Only authorised personnel can register as admins</p>
      </div>
      <div>
        <label className={labelClass}>Admin Invite Code</label>
        <div className="relative">
          <HiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
          <input
            type="text"
            name="inviteCode"
            value={formData.inviteCode}
            onChange={handleChange}
            placeholder="e.g. VUCA-ADMIN-2024"
            className={inputBase}
            autoFocus
          />
        </div>
        <p className="text-white/30 text-xs mt-2">Contact your system administrator to obtain an invite code.</p>
      </div>
      <button
        type="button"
        onClick={nextStep}
        className="w-full py-3.5 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-navy-900 font-bold rounded-xl transition-all duration-300 shadow-lg shadow-gold-400/25 mt-4"
      >
        Verify & Continue →
      </button>
    </motion.div>,

    // Step 1 – Personal Info
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="space-y-5"
    >
      <div>
        <label className={labelClass}>Full Name</label>
        <div className="relative">
          <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
          <input type="text" name="name" value={formData.name} onChange={handleChange}
            placeholder="Dr. Jane Smith" className={inputBase} required />
        </div>
      </div>
      <div>
        <label className={labelClass}>Employee / Staff ID</label>
        <div className="relative">
          <HiIdentification className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
          <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange}
            placeholder="EMP-2024-001" className={inputBase} required />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Department</label>
          <div className="relative">
            <HiBuildingOffice2 className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
            <select name="department" value={formData.department} onChange={handleChange}
              className={`${inputBase} appearance-none`} required>
              <option value="" className="bg-navy-900">Select dept.</option>
              {departments.map(d => (
                <option key={d} value={d} className="bg-navy-900">{d}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>Designation</label>
          <div className="relative">
            <HiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
            <select name="designation" value={formData.designation} onChange={handleChange}
              className={`${inputBase} appearance-none`} required>
              <option value="" className="bg-navy-900">Select role</option>
              {designations.map(d => (
                <option key={d} value={d} className="bg-navy-900">{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => setStep(0)}
          className="flex-1 py-3.5 border border-white/10 text-white/60 rounded-xl hover:border-white/20 hover:text-white transition-all text-sm">
          ← Back
        </button>
        <button type="button" onClick={nextStep}
          className="flex-1 py-3.5 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-navy-900 font-bold rounded-xl transition-all duration-300 shadow-lg shadow-gold-400/20">
          Continue →
        </button>
      </div>
    </motion.div>,

    // Step 2 – Account Setup
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="space-y-5"
    >
      <div>
        <label className={labelClass}>Institutional Email</label>
        <div className="relative">
          <HiEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
          <input type="email" name="email" value={formData.email} onChange={handleChange}
            placeholder="admin@vignan.ac.in" className={inputBase} required />
        </div>
      </div>
      <div>
        <label className={labelClass}>Password</label>
        <div className="relative">
          <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
          <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
            onChange={handleChange} placeholder="Min. 6 characters" className={inputBase} required />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
            {showPassword ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <div>
        <label className={labelClass}>Confirm Password</label>
        <div className="relative">
          <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
          <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword}
            onChange={handleChange} placeholder="Re-enter password" className={inputBase} required />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
            {showConfirm ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => setStep(1)} disabled={loading}
          className="flex-1 py-3.5 border border-white/10 text-white/60 rounded-xl hover:border-white/20 hover:text-white transition-all text-sm disabled:opacity-40">
          ← Back
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 py-3.5 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-navy-900 font-bold rounded-xl transition-all duration-300 shadow-lg shadow-gold-400/20 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />
              Creating…
            </span>
          ) : (
            'Create Admin Account'
          )}
        </button>
      </div>
    </motion.div>
  ];

  // Success overlay
  if (inviteVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-full bg-green-400/15 border-2 border-green-400/40 flex items-center justify-center mx-auto mb-6">
            <HiCheckCircle className="w-14 h-14 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Account Created!</h2>
          <p className="text-white/40">Redirecting to admin dashboard…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-navy-950">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0">
          <div className="absolute top-16 right-16 w-64 h-64 bg-gold-400/8 rounded-full blur-3xl" />
          <div className="absolute bottom-24 left-16 w-80 h-80 bg-navy-500/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="relative z-10 text-center max-w-xs">
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 18, delay: 0.2 }}
            className="w-24 h-24 bg-gradient-to-br from-gold-300 to-gold-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-gold-400/25"
          >
            <HiShieldCheck className="w-14 h-14 text-navy-900" />
          </motion.div>

          <motion.h2
            className="text-3xl font-bold text-white font-display mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Admin Portal
          </motion.h2>
          <motion.p
            className="text-white/40 text-sm leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
          >
            Create a privileged administrator account to manage course allocation, student preferences, and system settings.
          </motion.p>

          {/* Step indicators */}
          <motion.div
            className="mt-10 flex flex-col gap-3 text-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {STEPS.map((s, i) => (
              <div key={s} className={`flex items-center gap-3 transition-all ${i === step ? 'opacity-100' : i < step ? 'opacity-60' : 'opacity-25'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                  i < step
                    ? 'bg-green-400 text-navy-900'
                    : i === step
                    ? 'bg-gold-400 text-navy-900'
                    : 'border border-white/20 text-white/40'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-sm font-medium ${i === step ? 'text-gold-400' : i < step ? 'text-green-400' : 'text-white/40'}`}>{s}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 bg-navy-950 overflow-y-auto">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center shadow-lg">
              <HiShieldCheck className="w-6 h-6 text-navy-900" />
            </div>
            <span className="text-xl font-bold font-display text-white">VUCA Admin</span>
          </div>

          {/* Mobile step bar */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i < step ? 'bg-green-400 text-navy-900' : i === step ? 'bg-gold-400 text-navy-900' : 'border border-white/20 text-white/30'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px flex-1 transition-all ${i < step ? 'bg-green-400' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold font-display text-white mb-1">
              {step === 0 ? 'Admin Registration' : step === 1 ? 'Personal Details' : 'Create Account'}
            </h1>
            <p className="text-white/40 text-sm">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {stepContent[step]}
            </AnimatePresence>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center space-y-2">
            <p className="text-sm text-white/30">
              Registering as a student instead?{' '}
              <Link to="/register" className="font-semibold text-gold-400 hover:text-gold-300 transition-colors">
                Student Registration
              </Link>
            </p>
            <p className="text-sm text-white/30">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-white/60 hover:text-white transition-colors">
                Sign in
              </Link>
            </p>
            <Link to="/" className="block text-xs text-white/20 hover:text-white/40 transition-colors mt-3">
              ← Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
