import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  HiAcademicCap,
  HiEnvelope,
  HiLockClosed,
  HiEye,
  HiEyeSlash,
  HiUser,
  HiShieldCheck,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  background: '#080d1a',
  fontFamily: "'DM Sans', sans-serif",
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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('student');
  const [focusedField, setFocusedField] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const isAdmin = mode === 'admin';

  function getInputStyle(fieldName) {
    return {
      ...inputStyle,
      borderColor: focusedField === fieldName
        ? 'rgba(201,168,76,0.5)'
        : 'rgba(255,255,255,0.08)',
    };
  }

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

  return (
    <div style={pageStyle}>

      {/* ── Left decorative panel ── */}
      <div
        className="hidden lg:flex"
        style={{
          width: '45%',
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
          position: 'absolute', top: '40%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400, height: 400,
          background: 'radial-gradient(ellipse, rgba(201,168,76,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 300 }}>

          {/* Mode icon */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 15 }}
              transition={{ type: 'spring', damping: 18 }}
              style={{
                width: 88, height: 88,
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.25)',
                borderRadius: 24,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 28px',
              }}
            >
              {isAdmin
                ? <HiShieldCheck style={{ width: 48, height: 48, color: '#c9a84c' }} />
                : <HiAcademicCap style={{ width: 48, height: 48, color: '#c9a84c' }} />
              }
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${mode}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 28, fontWeight: 700,
                color: '#f0ece0', marginBottom: 12,
              }}>
                {isAdmin ? 'Admin Portal' : 'Welcome Back'}
              </div>
              <div style={{ width: 40, height: 2, background: '#c9a84c', margin: '0 auto 16px' }} />
              <p style={{ fontSize: 13, color: '#3a4a60', lineHeight: 1.7 }}>
                {isAdmin
                  ? 'Sign in as an administrator to manage courses, allocations, and student data.'
                  : 'Sign in to access your course allocation dashboard and manage your preferences.'
                }
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Decorative stat strip */}
          <div style={{
            marginTop: 40,
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 1,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, overflow: 'hidden',
          }}>
            <div style={{ background: '#0d1425', padding: '16px 12px', textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 22, fontWeight: 700, color: '#c9a84c',
              }}>5k+</div>
              <div style={{ fontSize: 10, color: '#2a3548', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
                Students
              </div>
            </div>
            <div style={{ background: '#0d1425', padding: '16px 12px', textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 22, fontWeight: 700, color: '#c9a84c',
              }}>150+</div>
              <div style={{ fontSize: 10, color: '#2a3548', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
                Courses
              </div>
            </div>
            <div style={{ background: '#0d1425', padding: '16px 12px', textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 22, fontWeight: 700, color: '#c9a84c',
              }}>98%</div>
              <div style={{ fontSize: 10, color: '#2a3548', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
                Satisfaction
              </div>
            </div>
            <div style={{ background: '#0d1425', padding: '16px 12px', textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 22, fontWeight: 700, color: '#c9a84c',
              }}>12</div>
              <div style={{ fontSize: 10, color: '#2a3548', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
                Departments
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 32px',
        overflowY: 'auto',
      }}>
        <motion.div
          style={{ width: '100%', maxWidth: 420 }}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
        >

          {/* Mobile logo */}
          <div
            className="lg:hidden"
            style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}
          >
            <div style={{
              width: 38, height: 38,
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.25)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <HiAcademicCap style={{ width: 20, height: 20, color: '#c9a84c' }} />
            </div>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 18, fontWeight: 700, color: '#c9a84c',
            }}>
              VUCA
            </div>
          </div>

          {/* Mode toggle */}
          <div style={{
            display: 'flex',
            gap: 1,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12,
            padding: 4,
            marginBottom: 32,
          }}>
            <button
              type="button"
              onClick={() => setMode('student')}
              style={{
                flex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                padding: '9px 16px',
                borderRadius: 9,
                fontSize: 13, fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: mode === 'student' ? '#c9a84c' : 'transparent',
                color: mode === 'student' ? '#080d1a' : '#3a4a60',
              }}
            >
              <HiUser style={{ width: 15, height: 15 }} />
              Student
            </button>
            <button
              type="button"
              onClick={() => setMode('admin')}
              style={{
                flex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                padding: '9px 16px',
                borderRadius: 9,
                fontSize: 13, fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: mode === 'admin' ? 'rgba(201,168,76,0.15)' : 'transparent',
                color: mode === 'admin' ? '#c9a84c' : '#3a4a60',
                outline: mode === 'admin' ? '1px solid rgba(201,168,76,0.3)' : 'none',
              }}
            >
              <HiShieldCheck style={{ width: 15, height: 15 }} />
              Admin
            </button>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 26, fontWeight: 700,
              color: '#f0ece0', margin: '0 0 6px',
            }}>
              {isAdmin ? 'Admin Sign In' : 'Sign In'}
            </h1>
            <p style={{ fontSize: 13, color: '#3a4a60', margin: 0 }}>
              {isAdmin ? 'Enter your admin credentials' : 'Enter your credentials to continue'}
            </p>
            <div style={{ width: 40, height: 2, background: '#c9a84c', marginTop: 14 }} />
          </div>

          {/* Admin notice */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '12px 14px',
                background: 'rgba(201,168,76,0.06)',
                border: '1px solid rgba(201,168,76,0.15)',
                borderRadius: 10,
                marginBottom: 24,
              }}
            >
              <HiShieldCheck style={{ width: 16, height: 16, color: '#c9a84c', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: '#5e6d85', margin: 0, lineHeight: 1.6 }}>
                Use your admin credentials below. New to admin?{' '}
                <Link
                  to="/admin-register"
                  style={{ color: '#c9a84c', fontWeight: 600, textDecoration: 'none' }}
                >
                  Register with an invite code.
                </Link>
              </p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Email</label>
              <div style={{ position: 'relative' }}>
                <HiEnvelope style={iconStyle} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={isAdmin ? 'admin@vignan.ac.in' : 'your.email@vignan.ac.in'}
                  required
                  style={getInputStyle('email')}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                />
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <HiLockClosed style={iconStyle} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
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
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: '#3a4a60', padding: 0,
                  }}
                >
                  {showPassword
                    ? <HiEyeSlash style={{ width: 18, height: 18 }} />
                    : <HiEye style={{ width: 18, height: 18 }} />
                  }
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                background: '#c9a84c',
                color: '#080d1a',
                fontSize: 14, fontWeight: 700,
                border: 'none', borderRadius: 10,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                letterSpacing: '0.02em',
                transition: 'opacity 0.2s',
              }}
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
                  Signing in…
                </span>
              ) : (
                isAdmin ? 'Sign In as Admin' : 'Sign In'
              )}
            </button>
          </form>

          {/* Footer links */}
          <div style={{
            marginTop: 32, paddingTop: 24,
            borderTop: '1px solid rgba(255,255,255,0.05)',
            textAlign: 'center',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {isAdmin ? (
              <p style={{ fontSize: 13, color: '#2a3548', margin: 0 }}>
                Don't have an admin account?{' '}
                <Link
                  to="/admin-register"
                  style={{ color: '#c9a84c', fontWeight: 600, textDecoration: 'none' }}
                >
                  Register as Admin
                </Link>
              </p>
            ) : (
              <p style={{ fontSize: 13, color: '#2a3548', margin: 0 }}>
                Don't have an account?{' '}
                <Link
                  to="/register"
                  style={{ color: '#c9a84c', fontWeight: 600, textDecoration: 'none' }}
                >
                  Register here
                </Link>
              </p>
            )}
            <Link
              to="/"
              style={{ fontSize: 12, color: '#1e2a3a', textDecoration: 'none' }}
            >
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