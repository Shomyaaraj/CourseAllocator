import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from 'styled-components';
import {
  HiShieldCheck, HiEnvelope, HiLockClosed, HiUser,
  HiIdentification, HiBuildingOffice2, HiEye, HiEyeSlash,
  HiKey, HiBriefcase, HiCheckCircle,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

const STEPS = ['Invite Code', 'Personal Info', 'Account Setup'];

const deptOptions = [
  ['Computer Science & Engineering', 'CS & Engineering'],
  ['Electronics & Communication', 'Electronics'],
  ['Electrical Engineering', 'Electrical'],
  ['Mechanical Engineering', 'Mechanical'],
  ['Civil Engineering', 'Civil'],
  ['Information Technology', 'IT'],
  ['Chemical Engineering', 'Chemical'],
  ['Biotechnology', 'Biotechnology'],
  ['Business Administration', 'Business Admin'],
  ['Mathematics', 'Mathematics'],
  ['Physics', 'Physics'],
  ['Chemistry', 'Chemistry'],
];

const designationOptions = [
  'Dean', 'Associate Dean', 'Professor', 'Associate Professor',
  'Assistant Professor', 'Head of Department', 'Academic Coordinator',
  'Examination Controller', 'Registrar',
];

const designationLabels = {
  'Associate Professor': 'Assoc. Professor',
  'Assistant Professor': 'Asst. Professor',
  'Head of Department': 'Head of Dept.',
  'Academic Coordinator': 'Academic Coord.',
  'Examination Controller': 'Exam Controller',
};

export default function AdminRegisterPage() {
  const theme = useTheme();
  const isDark = theme.mode === 'dark';

  const accentColor = theme.colors.accent;
  const textMain = isDark ? '#f0ece0' : theme.colors.primary;
  const textMuted = isDark ? '#3a4a60' : theme.colors.textLight;
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : theme.colors.border;
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : theme.colors.secondaryBg;
  const pageBg = isDark ? '#080d1a' : theme.colors.background;
  const leftBg = isDark ? '#060a14' : theme.colors.secondaryBg;
  const selectOptionBg = isDark ? '#080d1a' : '#ffffff';

  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 600,
    color: textMuted, textTransform: 'uppercase',
    letterSpacing: '0.1em', marginBottom: 8,
  };

  const iconStyle = {
    position: 'absolute', left: 14, top: '50%',
    transform: 'translateY(-50%)',
    width: 18, height: 18, color: textMuted, pointerEvents: 'none',
  };

  const ghostBtnStyle = {
    flex: 1, padding: '13px',
    background: 'transparent',
    color: isDark ? '#5e6d85' : textMuted,
    fontSize: 13,
    border: '1px solid ' + borderColor,
    borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
  };

  const splitPrimaryStyle = {
    flex: 1, padding: '13px',
    background: accentColor, color: '#080d1a',
    fontSize: 14, fontWeight: 700, border: 'none',
    borderRadius: 10, cursor: 'pointer', letterSpacing: '0.02em',
  };

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    inviteCode: '', name: '', employeeId: '',
    department: '', designation: '', email: '',
    password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteVerified, setInviteVerified] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const { signupAdmin } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function getInputStyle(fieldName) {
    return {
      width: '100%', padding: '12px 16px 12px 44px',
      background: inputBg,
      border: '1px solid ' + (focusedField === fieldName ? accentColor : borderColor),
      borderRadius: 10, color: textMain, fontSize: 14,
      outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
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

  function nextStep() { if (validateStep()) setStep(s => s + 1); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);
    try {
      await signupAdmin(formData.email, formData.password, {
        name: formData.name, employeeId: formData.employeeId,
        department: formData.department, designation: formData.designation,
      }, formData.inviteCode.trim());
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

  // Step circle helper
  function stepCircle(i) {
    const done = step > i;
    const active = step === i;
    return {
      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
      background: done ? 'rgba(29,158,117,0.2)' : active ? (isDark ? 'rgba(201,168,76,0.15)' : 'rgba(255,130,92,0.15)') : 'transparent',
      border: done ? '1px solid rgba(29,158,117,0.4)' : active ? '1px solid ' + accentColor : '1px solid ' + borderColor,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700,
      color: done ? '#1d9e75' : active ? accentColor : textMuted,
    };
  }

  // Success screen
  if (inviteVerified) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: pageBg, fontFamily: "'DM Sans', sans-serif" }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center' }}>
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: 'rgba(29,158,117,0.12)', border: '2px solid rgba(29,158,117,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
          }}>
            <HiCheckCircle style={{ width: 52, height: 52, color: '#1d9e75' }} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32, fontWeight: 700, color: textMain, marginBottom: 8 }}>
            Account Created!
          </h2>
          <p style={{ fontSize: 14, color: textMuted }}>Redirecting to admin dashboard…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: pageBg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Left decorative panel ── */}
      <div
        className="hidden lg:flex"
        style={{
          width: '42%', minHeight: '100vh',
          background: leftBg,
          borderRight: '1px solid ' + (isDark ? 'rgba(201,168,76,0.1)' : theme.colors.border),
          backgroundImage: isDark
            ? 'linear-gradient(rgba(180,160,100,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(180,160,100,0.025) 1px, transparent 1px)'
            : 'linear-gradient(rgba(24,33,109,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(24,33,109,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          position: 'relative', overflow: 'hidden',
          alignItems: 'center', justifyContent: 'center',
          padding: '0 48px',
        }}
      >
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, height: 400, background: isDark ? 'radial-gradient(ellipse, rgba(201,168,76,0.07) 0%, transparent 70%)' : 'radial-gradient(ellipse, rgba(255,130,92,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', maxWidth: 300, width: '100%', zIndex: 2 }}>

          {/* Shield icon */}
          <motion.div
            initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 18, delay: 0.2 }}
            style={{
              width: 88, height: 88,
              background: isDark ? 'rgba(201,168,76,0.1)' : 'rgba(255,130,92,0.1)',
              border: '1px solid ' + (isDark ? 'rgba(201,168,76,0.25)' : 'rgba(255,130,92,0.25)'),
              borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 28px',
            }}
          >
            <HiShieldCheck style={{ width: 48, height: 48, color: accentColor }} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, fontWeight: 700, color: textMain, marginBottom: 12 }}>
              Admin Portal
            </div>
            <div style={{ width: 40, height: 2, background: accentColor, margin: '0 auto 16px' }} />
            <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.7 }}>
              Create a privileged administrator account to manage course allocation, student preferences, and system settings.
            </p>
          </motion.div>

          {/* Step indicators */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
            {STEPS.map((label, i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: step === i ? 1 : step > i ? 0.6 : 0.25, transition: 'opacity 0.3s' }}>
                <div style={stepCircle(i)}>
                  {step > i ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: step === i ? accentColor : step > i ? '#1d9e75' : textMuted }}>
                  {label}
                </span>
              </div>
            ))}
          </motion.div>

        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 32px', overflowY: 'auto' }}>
        <motion.div
          style={{ width: '100%', maxWidth: 440 }}
          initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ width: 38, height: 38, background: isDark ? 'rgba(201,168,76,0.1)' : 'rgba(255,130,92,0.1)', border: '1px solid ' + (isDark ? 'rgba(201,168,76,0.25)' : 'rgba(255,130,92,0.25)'), borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HiShieldCheck style={{ width: 20, height: 20, color: accentColor }} />
            </div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700, color: accentColor }}>VUCA Admin</div>
          </div>

          {/* Mobile step bar */}
          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
            {STEPS.map((_, i) => (
              <>
                <div key={i} style={stepCircle(i)}>{step > i ? '✓' : i + 1}</div>
                {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: step > i ? 'rgba(29,158,117,0.4)' : borderColor }} />}
              </>
            ))}
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 26, fontWeight: 700, color: textMain, margin: '0 0 6px' }}>
              {step === 0 ? 'Admin Registration' : step === 1 ? 'Personal Details' : 'Create Account'}
            </h1>
            <p style={{ fontSize: 13, color: textMuted }}>Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
            <div style={{ width: 40, height: 2, background: accentColor, marginTop: 14 }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">

              {/* STEP 0 */}
              {step === 0 && (
                <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '28px 24px',
                    background: isDark ? 'rgba(201,168,76,0.04)' : 'rgba(255,130,92,0.04)',
                    border: '1px solid ' + (isDark ? 'rgba(201,168,76,0.1)' : 'rgba(255,130,92,0.15)'),
                    borderRadius: 12, marginBottom: 24, textAlign: 'center',
                  }}>
                    <div style={{ width: 56, height: 56, background: isDark ? 'rgba(201,168,76,0.1)' : 'rgba(255,130,92,0.1)', border: '1px solid ' + (isDark ? 'rgba(201,168,76,0.2)' : 'rgba(255,130,92,0.2)'), borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                      <HiKey style={{ width: 28, height: 28, color: accentColor }} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: textMain, marginBottom: 6 }}>Enter Invite Code</div>
                    <div style={{ fontSize: 13, color: textMuted, lineHeight: 1.6 }}>Only authorised personnel can register as admins</div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Admin Invite Code</label>
                    <div style={{ position: 'relative' }}>
                      <HiKey style={iconStyle} />
                      <input type="text" name="inviteCode" value={formData.inviteCode} onChange={handleChange}
                        style={getInputStyle('inviteCode')} onFocus={() => setFocusedField('inviteCode')} onBlur={() => setFocusedField('')} autoFocus />
                    </div>
                    <p style={{ fontSize: 12, color: textMuted, marginTop: 8 }}>Contact your system administrator to obtain an invite code.</p>
                  </div>

                  <button type="button" onClick={nextStep} style={{ width: '100%', padding: '13px', background: accentColor, color: '#080d1a', fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 10, cursor: 'pointer', letterSpacing: '0.03em' }}>
                    Verify & Continue →
                  </button>
                </motion.div>
              )}

              {/* STEP 1 */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <HiUser style={iconStyle} />
                      <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Dr. Jane Smith"
                        style={getInputStyle('name')} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField('')} />
                    </div>
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Employee / Staff ID</label>
                    <div style={{ position: 'relative' }}>
                      <HiIdentification style={iconStyle} />
                      <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} placeholder="EMP-2024-001"
                        style={getInputStyle('employeeId')} onFocus={() => setFocusedField('employeeId')} onBlur={() => setFocusedField('')} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                    <div>
                      <label style={labelStyle}>Department</label>
                      <div style={{ position: 'relative' }}>
                        <HiBuildingOffice2 style={iconStyle} />
                        <select name="department" value={formData.department} onChange={handleChange}
                          style={{ ...getInputStyle('department'), appearance: 'none' }}
                          onFocus={() => setFocusedField('department')} onBlur={() => setFocusedField('')}>
                          <option value="" style={{ background: selectOptionBg }}>Select dept.</option>
                          {deptOptions.map(([val, label]) => (
                            <option key={val} value={val} style={{ background: selectOptionBg }}>{label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Designation</label>
                      <div style={{ position: 'relative' }}>
                        <HiBriefcase style={iconStyle} />
                        <select name="designation" value={formData.designation} onChange={handleChange}
                          style={{ ...getInputStyle('designation'), appearance: 'none' }}
                          onFocus={() => setFocusedField('designation')} onBlur={() => setFocusedField('')}>
                          <option value="" style={{ background: selectOptionBg }}>Select role</option>
                          {designationOptions.map(d => (
                            <option key={d} value={d} style={{ background: selectOptionBg }}>{designationLabels[d] || d}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" onClick={() => setStep(0)} style={ghostBtnStyle}>← Back</button>
                    <button type="button" onClick={nextStep} style={splitPrimaryStyle}>Continue →</button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Institutional Email</label>
                    <div style={{ position: 'relative' }}>
                      <HiEnvelope style={iconStyle} />
                      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="admin@vignan.ac.in"
                        style={getInputStyle('email')} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField('')} />
                    </div>
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <HiLockClosed style={iconStyle} />
                      <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                        placeholder="Min. 6 characters" style={{ ...getInputStyle('password'), paddingRight: 44 }}
                        onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField('')} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: textMuted, padding: 0 }}>
                        {showPassword ? <HiEyeSlash style={{ width: 18, height: 18 }} /> : <HiEye style={{ width: 18, height: 18 }} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label style={labelStyle}>Confirm Password</label>
                    <div style={{ position: 'relative' }}>
                      <HiLockClosed style={iconStyle} />
                      <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                        placeholder="Re-enter password" style={{ ...getInputStyle('confirmPassword'), paddingRight: 44 }}
                        onFocus={() => setFocusedField('confirmPassword')} onBlur={() => setFocusedField('')} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: textMuted, padding: 0 }}>
                        {showConfirm ? <HiEyeSlash style={{ width: 18, height: 18 }} /> : <HiEye style={{ width: 18, height: 18 }} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" onClick={() => setStep(1)} disabled={loading} style={{ ...ghostBtnStyle, opacity: loading ? 0.4 : 1 }}>← Back</button>
                    <button type="submit" disabled={loading} style={{ ...splitPrimaryStyle, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                      {loading ? (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                          <span style={{ width: 14, height: 14, border: '2px solid #080d1a', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                          Creating…
                        </span>
                      ) : 'Create Admin Account'}
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </form>

          {/* Footer */}
          <div style={{ marginTop: 36, paddingTop: 24, borderTop: '1px solid ' + borderColor, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 13, color: textMuted, margin: 0 }}>
              Registering as a student?{' '}
              <Link to="/register" style={{ color: accentColor, fontWeight: 600, textDecoration: 'none' }}>Student Registration</Link>
            </p>
            <p style={{ fontSize: 13, color: textMuted, margin: 0 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: isDark ? '#5e6d85' : textMuted, fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
            </p>
            <Link to="/" style={{ fontSize: 12, color: textMuted, textDecoration: 'none', marginTop: 4 }}>← Back to home</Link>
          </div>

        </motion.div>
      </div>
    </div>
  );
}