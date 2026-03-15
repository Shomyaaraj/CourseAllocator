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
  'Chemistry',
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
  'Registrar',
];

const STEPS = ['Invite Code', 'Personal Info', 'Account Setup'];

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  background: '#080d1a',
  fontFamily: "'DM Sans', sans-serif",
};

const inputWrapStyle = {
  position: 'relative',
  marginBottom: 0,
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px 12px 44px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  color: '#e8e2d0',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: '#3a4a60',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: 8,
};

const iconStyle = {
  position: 'absolute',
  left: 14,
  top: '50%',
  transform: 'translateY(-50%)',
  width: 18,
  height: 18,
  color: '#3a4a60',
  pointerEvents: 'none',
};

const primaryBtnStyle = {
  width: '100%',
  padding: '13px',
  background: '#c9a84c',
  color: '#080d1a',
  fontSize: 14,
  fontWeight: 700,
  border: 'none',
  borderRadius: 10,
  cursor: 'pointer',
  letterSpacing: '0.03em',
  transition: 'opacity 0.2s',
};

const ghostBtnStyle = {
  flex: 1,
  padding: '13px',
  background: 'transparent',
  color: '#5e6d85',
  fontSize: 13,
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const splitPrimaryStyle = {
  flex: 1,
  padding: '13px',
  background: '#c9a84c',
  color: '#080d1a',
  fontSize: 14,
  fontWeight: 700,
  border: 'none',
  borderRadius: 10,
  cursor: 'pointer',
  letterSpacing: '0.02em',
};

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
  const [focusedField, setFocusedField] = useState('');

  const { signupAdmin } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    const name = e.target.name;
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function getInputStyle(fieldName) {
    return {
      ...inputStyle,
      borderColor: focusedField === fieldName
        ? 'rgba(201,168,76,0.5)'
        : 'rgba(255,255,255,0.08)',
    };
  }

  function validateStep() {
    if (step === 0) {
      if (!formData.inviteCode.trim()) { toast.error('Please enter your invite code'); return false; }
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
        'admin/no-config': 'Admin registration is currently disabled.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/weak-password': 'Password is too weak.',
      };
      toast.error(messages[err.code] || err.message || 'Registration failed.');
    }
    setLoading(false);
  }

  // Success screen
  if (inviteVerified) {
    return (
      <div style={{ ...pageStyle, alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: 'rgba(29,158,117,0.12)',
            border: '2px solid rgba(29,158,117,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <HiCheckCircle style={{ width: 52, height: 52, color: '#1d9e75' }} />
          </div>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 32, fontWeight: 700, color: '#f0ece0', marginBottom: 8,
          }}>
            Account Created!
          </h2>
          <p style={{ fontSize: 14, color: '#3a4a60' }}>Redirecting to admin dashboard…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>

      {/* Left decorative panel */}
      <div
        className="hidden lg:flex"
        style={{
          width: '42%',
          background: '#060a14',
          borderRight: '1px solid rgba(201,168,76,0.1)',
          backgroundImage: `
            linear-gradient(rgba(180,160,100,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(180,160,100,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          position: 'relative',
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 48,
        }}
      >
        {/* Ambient glow */}
        <div style={{
          position: 'absolute', top: '30%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400, height: 400,
          background: 'radial-gradient(ellipse, rgba(201,168,76,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 300 }}>

          {/* Shield icon */}
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 18, delay: 0.2 }}
            style={{
              width: 88, height: 88,
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.25)',
              borderRadius: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 28px',
            }}
          >
            <HiShieldCheck style={{ width: 48, height: 48, color: '#c9a84c' }} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 28, fontWeight: 700, color: '#f0ece0', marginBottom: 12,
            }}>
              Admin Portal
            </div>
            <div style={{ width: 40, height: 2, background: '#c9a84c', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 13, color: '#3a4a60', lineHeight: 1.7 }}>
              Create a privileged administrator account to manage course allocation,
              student preferences, and system settings.
            </p>
          </motion.div>

          {/* Step indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}
          >
            {/* Step 0 */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              opacity: step === 0 ? 1 : step > 0 ? 0.6 : 0.25,
              transition: 'opacity 0.3s',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: step > 0 ? 'rgba(29,158,117,0.2)' : step === 0 ? 'rgba(201,168,76,0.15)' : 'transparent',
                border: step > 0 ? '1px solid rgba(29,158,117,0.4)' : step === 0 ? '1px solid rgba(201,168,76,0.4)' : '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                color: step > 0 ? '#1d9e75' : step === 0 ? '#c9a84c' : '#3a4a60',
                flexShrink: 0,
              }}>
                {step > 0 ? '✓' : '1'}
              </div>
              <span style={{
                fontSize: 13, fontWeight: 500,
                color: step === 0 ? '#c9a84c' : step > 0 ? '#1d9e75' : '#3a4a60',
              }}>
                Invite Code
              </span>
            </div>

            {/* Step 1 */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              opacity: step === 1 ? 1 : step > 1 ? 0.6 : 0.25,
              transition: 'opacity 0.3s',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: step > 1 ? 'rgba(29,158,117,0.2)' : step === 1 ? 'rgba(201,168,76,0.15)' : 'transparent',
                border: step > 1 ? '1px solid rgba(29,158,117,0.4)' : step === 1 ? '1px solid rgba(201,168,76,0.4)' : '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                color: step > 1 ? '#1d9e75' : step === 1 ? '#c9a84c' : '#3a4a60',
                flexShrink: 0,
              }}>
                {step > 1 ? '✓' : '2'}
              </div>
              <span style={{
                fontSize: 13, fontWeight: 500,
                color: step === 1 ? '#c9a84c' : step > 1 ? '#1d9e75' : '#3a4a60',
              }}>
                Personal Info
              </span>
            </div>

            {/* Step 2 */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              opacity: step === 2 ? 1 : 0.25,
              transition: 'opacity 0.3s',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: step === 2 ? 'rgba(201,168,76,0.15)' : 'transparent',
                border: step === 2 ? '1px solid rgba(201,168,76,0.4)' : '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                color: step === 2 ? '#c9a84c' : '#3a4a60',
                flexShrink: 0,
              }}>
                3
              </div>
              <span style={{
                fontSize: 13, fontWeight: 500,
                color: step === 2 ? '#c9a84c' : '#3a4a60',
              }}>
                Account Setup
              </span>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 32px',
        overflowY: 'auto',
      }}>
        <motion.div
          style={{ width: '100%', maxWidth: 440 }}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
        >

          {/* Mobile logo */}
          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{
              width: 38, height: 38,
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.25)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <HiShieldCheck style={{ width: 20, height: 20, color: '#c9a84c' }} />
            </div>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 18, fontWeight: 700, color: '#c9a84c',
            }}>
              VUCA Admin
            </div>
          </div>

          {/* Mobile step bar */}
          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: step > 0 ? 'rgba(29,158,117,0.2)' : 'rgba(201,168,76,0.15)',
              border: step > 0 ? '1px solid rgba(29,158,117,0.4)' : '1px solid rgba(201,168,76,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700,
              color: step > 0 ? '#1d9e75' : '#c9a84c',
            }}>
              {step > 0 ? '✓' : '1'}
            </div>
            <div style={{ flex: 1, height: 1, background: step > 0 ? 'rgba(29,158,117,0.4)' : 'rgba(255,255,255,0.06)' }} />
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: step > 1 ? 'rgba(29,158,117,0.2)' : step === 1 ? 'rgba(201,168,76,0.15)' : 'transparent',
              border: step > 1 ? '1px solid rgba(29,158,117,0.4)' : step === 1 ? '1px solid rgba(201,168,76,0.4)' : '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700,
              color: step > 1 ? '#1d9e75' : step === 1 ? '#c9a84c' : '#3a4a60',
            }}>
              {step > 1 ? '✓' : '2'}
            </div>
            <div style={{ flex: 1, height: 1, background: step > 1 ? 'rgba(29,158,117,0.4)' : 'rgba(255,255,255,0.06)' }} />
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: step === 2 ? 'rgba(201,168,76,0.15)' : 'transparent',
              border: step === 2 ? '1px solid rgba(201,168,76,0.4)' : '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700,
              color: step === 2 ? '#c9a84c' : '#3a4a60',
            }}>
              3
            </div>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 26, fontWeight: 700, color: '#f0ece0', margin: '0 0 6px',
            }}>
              {step === 0 ? 'Admin Registration' : step === 1 ? 'Personal Details' : 'Create Account'}
            </h1>
            <p style={{ fontSize: 13, color: '#3a4a60' }}>
              Step {step + 1} of {STEPS.length} — {STEPS[step]}
            </p>
            <div style={{ width: 40, height: 2, background: '#c9a84c', marginTop: 14 }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">

              {/* STEP 0 */}
              {step === 0 && (
                <motion.div
                  key="s0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Key icon header */}
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '28px 24px',
                    background: 'rgba(201,168,76,0.04)',
                    border: '1px solid rgba(201,168,76,0.1)',
                    borderRadius: 12,
                    marginBottom: 24, textAlign: 'center',
                  }}>
                    <div style={{
                      width: 56, height: 56,
                      background: 'rgba(201,168,76,0.1)',
                      border: '1px solid rgba(201,168,76,0.2)',
                      borderRadius: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 14,
                    }}>
                      <HiKey style={{ width: 28, height: 28, color: '#c9a84c' }} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#e8e2d0', marginBottom: 6 }}>
                      Enter Invite Code
                    </div>
                    <div style={{ fontSize: 13, color: '#3a4a60', lineHeight: 1.6 }}>
                      Only authorised personnel can register as admins
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Admin Invite Code</label>
                    <div style={inputWrapStyle}>
                      <HiKey style={iconStyle} />
                      <input
                        type="text"
                        name="inviteCode"
                        value={formData.inviteCode}
                        onChange={handleChange}
                        placeholder="e.g. VUCA-ADMIN-2024"
                        style={getInputStyle('inviteCode')}
                        onFocus={() => setFocusedField('inviteCode')}
                        onBlur={() => setFocusedField('')}
                        autoFocus
                      />
                    </div>
                    <p style={{ fontSize: 12, color: '#2a3548', marginTop: 8 }}>
                      Contact your system administrator to obtain an invite code.
                    </p>
                  </div>

                  <button type="button" onClick={nextStep} style={primaryBtnStyle}>
                    Verify & Continue →
                  </button>
                </motion.div>
              )}

              {/* STEP 1 */}
              {step === 1 && (
                <motion.div
                  key="s1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Full Name</label>
                    <div style={inputWrapStyle}>
                      <HiUser style={iconStyle} />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Dr. Jane Smith"
                        style={getInputStyle('name')}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField('')}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Employee / Staff ID</label>
                    <div style={inputWrapStyle}>
                      <HiIdentification style={iconStyle} />
                      <input
                        type="text"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        placeholder="EMP-2024-001"
                        style={getInputStyle('employeeId')}
                        onFocus={() => setFocusedField('employeeId')}
                        onBlur={() => setFocusedField('')}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                    <div>
                      <label style={labelStyle}>Department</label>
                      <div style={inputWrapStyle}>
                        <HiBuildingOffice2 style={iconStyle} />
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          style={{ ...getInputStyle('department'), appearance: 'none' }}
                          onFocus={() => setFocusedField('department')}
                          onBlur={() => setFocusedField('')}
                        >
                          <option value="" style={{ background: '#080d1a' }}>Select dept.</option>
                          <option value="Computer Science & Engineering" style={{ background: '#080d1a' }}>CS & Engineering</option>
                          <option value="Electronics & Communication" style={{ background: '#080d1a' }}>Electronics</option>
                          <option value="Electrical Engineering" style={{ background: '#080d1a' }}>Electrical</option>
                          <option value="Mechanical Engineering" style={{ background: '#080d1a' }}>Mechanical</option>
                          <option value="Civil Engineering" style={{ background: '#080d1a' }}>Civil</option>
                          <option value="Information Technology" style={{ background: '#080d1a' }}>IT</option>
                          <option value="Chemical Engineering" style={{ background: '#080d1a' }}>Chemical</option>
                          <option value="Biotechnology" style={{ background: '#080d1a' }}>Biotechnology</option>
                          <option value="Business Administration" style={{ background: '#080d1a' }}>Business Admin</option>
                          <option value="Mathematics" style={{ background: '#080d1a' }}>Mathematics</option>
                          <option value="Physics" style={{ background: '#080d1a' }}>Physics</option>
                          <option value="Chemistry" style={{ background: '#080d1a' }}>Chemistry</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Designation</label>
                      <div style={inputWrapStyle}>
                        <HiBriefcase style={iconStyle} />
                        <select
                          name="designation"
                          value={formData.designation}
                          onChange={handleChange}
                          style={{ ...getInputStyle('designation'), appearance: 'none' }}
                          onFocus={() => setFocusedField('designation')}
                          onBlur={() => setFocusedField('')}
                        >
                          <option value="" style={{ background: '#080d1a' }}>Select role</option>
                          <option value="Dean" style={{ background: '#080d1a' }}>Dean</option>
                          <option value="Associate Dean" style={{ background: '#080d1a' }}>Associate Dean</option>
                          <option value="Professor" style={{ background: '#080d1a' }}>Professor</option>
                          <option value="Associate Professor" style={{ background: '#080d1a' }}>Assoc. Professor</option>
                          <option value="Assistant Professor" style={{ background: '#080d1a' }}>Asst. Professor</option>
                          <option value="Head of Department" style={{ background: '#080d1a' }}>Head of Dept.</option>
                          <option value="Academic Coordinator" style={{ background: '#080d1a' }}>Academic Coord.</option>
                          <option value="Examination Controller" style={{ background: '#080d1a' }}>Exam Controller</option>
                          <option value="Registrar" style={{ background: '#080d1a' }}>Registrar</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" onClick={() => setStep(0)} style={ghostBtnStyle}>
                      ← Back
                    </button>
                    <button type="button" onClick={nextStep} style={splitPrimaryStyle}>
                      Continue →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <motion.div
                  key="s2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Institutional Email</label>
                    <div style={inputWrapStyle}>
                      <HiEnvelope style={iconStyle} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="admin@vignan.ac.in"
                        style={getInputStyle('email')}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField('')}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Password</label>
                    <div style={{ ...inputWrapStyle }}>
                      <HiLockClosed style={iconStyle} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Min. 6 characters"
                        style={{ ...getInputStyle('password'), paddingRight: 44 }}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField('')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute', right: 14, top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#3a4a60', padding: 0,
                        }}
                      >
                        {showPassword
                          ? <HiEyeSlash style={{ width: 18, height: 18 }} />
                          : <HiEye style={{ width: 18, height: 18 }} />
                        }
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label style={labelStyle}>Confirm Password</label>
                    <div style={inputWrapStyle}>
                      <HiLockClosed style={iconStyle} />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter password"
                        style={{ ...getInputStyle('confirmPassword'), paddingRight: 44 }}
                        onFocus={() => setFocusedField('confirmPassword')}
                        onBlur={() => setFocusedField('')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        style={{
                          position: 'absolute', right: 14, top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#3a4a60', padding: 0,
                        }}
                      >
                        {showConfirm
                          ? <HiEyeSlash style={{ width: 18, height: 18 }} />
                          : <HiEye style={{ width: 18, height: 18 }} />
                        }
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      disabled={loading}
                      style={{ ...ghostBtnStyle, opacity: loading ? 0.4 : 1 }}
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{ ...splitPrimaryStyle, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                    >
                      {loading ? (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                          <span style={{
                            width: 14, height: 14,
                            border: '2px solid #080d1a',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            display: 'inline-block',
                            animation: 'spin 0.7s linear infinite',
                          }} />
                          Creating…
                        </span>
                      ) : 'Create Admin Account'}
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </form>

          {/* Footer links */}
          <div style={{
            marginTop: 36, paddingTop: 24,
            borderTop: '1px solid rgba(255,255,255,0.05)',
            textAlign: 'center',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <p style={{ fontSize: 13, color: '#2a3548', margin: 0 }}>
              Registering as a student?{' '}
              <Link to="/register" style={{ color: '#c9a84c', fontWeight: 600, textDecoration: 'none' }}>
                Student Registration
              </Link>
            </p>
            <p style={{ fontSize: 13, color: '#2a3548', margin: 0 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#5e6d85', fontWeight: 500, textDecoration: 'none' }}>
                Sign in
              </Link>
            </p>
            <Link to="/" style={{ fontSize: 12, color: '#1e2a3a', textDecoration: 'none', marginTop: 4 }}>
              ← Back to home
            </Link>
          </div>

        </motion.div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

    </div>
  );
}