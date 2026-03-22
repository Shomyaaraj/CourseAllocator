import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from 'styled-components';
import {
  HiAcademicCap, HiEnvelope, HiLockClosed, HiUser,
  HiIdentification, HiBuildingOffice2, HiEye, HiEyeSlash, HiChartBar,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function RegisterPage() {
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

  const [formData, setFormData] = useState({
    name: '', registrationNumber: '', cgpa: '',
    email: '', password: '', confirmPassword: '',
    department: '', semester: '1',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const { signup } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function getInputStyle(field) {
    return {
      width: '100%',
      padding: '11px 14px 11px 44px',
      background: inputBg,
      border: '1px solid ' + (focusedField === field ? accentColor : borderColor),
      borderRadius: 10, color: textMain, fontSize: 14,
      outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return toast.error('Passwords do not match');
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (!formData.department) return toast.error('Please select a department');
    const cgpa = parseFloat(formData.cgpa);
    if (formData.cgpa && (isNaN(cgpa) || cgpa < 0 || cgpa > 10)) return toast.error('CGPA must be between 0 and 10');
    setLoading(true);
    try {
      await signup(formData.email, formData.password, {
        name: formData.name,
        registrationNumber: formData.registrationNumber,
        department: formData.department,
        semester: parseInt(formData.semester),
        cgpa: parseFloat(formData.cgpa) || null,
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

  const features = ['Smart Course Allocation', 'CGPA-based Priority', 'Live Countdown Timer', 'Instant Results'];

  const departments = [
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: pageBg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Left decorative panel ── */}
      <div
        className="hidden lg:flex"
        style={{
          width: '42%',
          minHeight: '100vh',
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
        {/* Ambient glow */}
        <div style={{
          position: 'absolute', top: '40%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400, height: 400,
          background: isDark
            ? 'radial-gradient(ellipse, rgba(201,168,76,0.07) 0%, transparent 70%)'
            : 'radial-gradient(ellipse, rgba(255,130,92,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center', maxWidth: 300, width: '100%', zIndex: 2,
        }}>
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 18, delay: 0.2 }}
            style={{
              width: 88, height: 88,
              background: isDark ? 'rgba(201,168,76,0.1)' : 'rgba(255,130,92,0.1)',
              border: '1px solid ' + (isDark ? 'rgba(201,168,76,0.25)' : 'rgba(255,130,92,0.25)'),
              borderRadius: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 28px',
            }}
          >
            <HiAcademicCap style={{ width: 48, height: 48, color: accentColor }} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 28, fontWeight: 700, color: textMain, marginBottom: 12,
            }}>
              Join VUCA
            </div>
            <div style={{ width: 40, height: 2, background: accentColor, margin: '0 auto 16px' }} />
            <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.7 }}>
              Register to start selecting your preferred courses and get smart allocation recommendations.
            </p>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            {features.map(feat => (
              <div key={feat} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 14px',
                background: isDark ? 'rgba(255,255,255,0.02)' : theme.colors.cardBg,
                border: '1px solid ' + borderColor,
                borderRadius: 9, textAlign: 'left',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: accentColor, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: isDark ? '#5e6d85' : textMuted }}>{feat}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 32px', overflowY: 'auto',
      }}>
        <motion.div
          style={{ width: '100%', maxWidth: 460 }}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{
              width: 38, height: 38,
              background: isDark ? 'rgba(201,168,76,0.1)' : 'rgba(255,130,92,0.1)',
              border: '1px solid ' + (isDark ? 'rgba(201,168,76,0.25)' : 'rgba(255,130,92,0.25)'),
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <HiAcademicCap style={{ width: 20, height: 20, color: accentColor }} />
            </div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700, color: accentColor }}>
              VUCA
            </div>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 26, fontWeight: 700, color: textMain, margin: '0 0 6px' }}>
              Create Account
            </h1>
            <p style={{ fontSize: 13, color: textMuted, margin: 0 }}>Fill in your details to register as a student</p>
            <div style={{ width: 40, height: 2, background: accentColor, marginTop: 14 }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>

            {/* Full Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <HiUser style={iconStyle} />
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  placeholder="Dr. Jane Smith" required style={getInputStyle('name')}
                  onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField('')} />
              </div>
            </div>

            {/* Registration Number */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Registration Number</label>
              <div style={{ position: 'relative' }}>
                <HiIdentification style={iconStyle} />
                <input type="text" name="registrationNumber" value={formData.registrationNumber}
                  onChange={handleChange} placeholder="e.g. 21BCE7890" required style={getInputStyle('registrationNumber')}
                  onFocus={() => setFocusedField('registrationNumber')} onBlur={() => setFocusedField('')} />
              </div>
            </div>

            {/* CGPA */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                CGPA <span style={{ color: textMuted, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(0 – 10)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <HiChartBar style={iconStyle} />
                <input type="number" name="cgpa" value={formData.cgpa} onChange={handleChange}
                  placeholder="e.g. 8.5" min="0" max="10" step="0.01" style={getInputStyle('cgpa')}
                  onFocus={() => setFocusedField('cgpa')} onBlur={() => setFocusedField('')} />
              </div>
              <p style={{ fontSize: 11, color: textMuted, marginTop: 6 }}>Used as priority in course allocation</p>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email</label>
              <div style={{ position: 'relative' }}>
                <HiEnvelope style={iconStyle} />
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder="you@vignan.ac.in" required style={getInputStyle('email')}
                  onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField('')} />
              </div>
            </div>

            {/* Department + Semester */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Department</label>
                <div style={{ position: 'relative' }}>
                  <HiBuildingOffice2 style={iconStyle} />
                  <select name="department" value={formData.department} onChange={handleChange} required
                    style={{ ...getInputStyle('department'), appearance: 'none' }}
                    onFocus={() => setFocusedField('department')} onBlur={() => setFocusedField('')}>
                    <option value="" style={{ background: selectOptionBg }}>Select</option>
                    {departments.map(([val, label]) => (
                      <option key={val} value={val} style={{ background: selectOptionBg }}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Semester</label>
                <select name="semester" value={formData.semester} onChange={handleChange}
                  style={{ ...getInputStyle('semester'), paddingLeft: 14, appearance: 'none' }}
                  onFocus={() => setFocusedField('semester')} onBlur={() => setFocusedField('')}>
                  {[1,2,3,4,5,6,7,8].map(n => (
                    <option key={n} value={String(n)} style={{ background: selectOptionBg }}>Semester {n}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <HiLockClosed style={iconStyle} />
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                  onChange={handleChange} placeholder="Min. 6 characters" required
                  style={{ ...getInputStyle('password'), paddingRight: 44 }}
                  onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField('')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: textMuted, padding: 0 }}>
                  {showPassword ? <HiEyeSlash style={{ width: 18, height: 18 }} /> : <HiEye style={{ width: 18, height: 18 }} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 28 }}>
              <label style={labelStyle}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <HiLockClosed style={iconStyle} />
                <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword}
                  onChange={handleChange} placeholder="Re-enter password" required
                  style={{ ...getInputStyle('confirmPassword'), paddingRight: 44 }}
                  onFocus={() => setFocusedField('confirmPassword')} onBlur={() => setFocusedField('')} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: textMuted, padding: 0 }}>
                  {showConfirm ? <HiEyeSlash style={{ width: 18, height: 18 }} /> : <HiEye style={{ width: 18, height: 18 }} />}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: isDark ? 'rgba(201,168,76,0.08)' : theme.colors.border, marginBottom: 20 }} />

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px',
              background: loading ? (isDark ? 'rgba(201,168,76,0.15)' : 'rgba(255,130,92,0.15)') : accentColor,
              color: loading ? textMuted : '#080d1a',
              fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 10,
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.02em', transition: 'all 0.2s',
            }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ width: 14, height: 14, border: '2px solid ' + textMuted, borderTopColor: accentColor, borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <div style={{
            marginTop: 32, paddingTop: 24,
            borderTop: '1px solid ' + borderColor,
            textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <p style={{ fontSize: 13, color: textMuted, margin: 0 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: accentColor, fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
            </p>
            <Link to="/" style={{ fontSize: 12, color: textMuted, textDecoration: 'none' }}>← Back to home</Link>
          </div>

        </motion.div>
      </div>
    </div>
  );
}