import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import { HiAcademicCap } from 'react-icons/hi2';
import { useTheme } from 'styled-components';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState('');
  const [hoveredLogin, setHoveredLogin] = useState(false);
  const theme = useTheme();

  const isDark = theme.mode === 'dark';

  const linkStyle = (name) => ({
    fontSize: 14,
    color: hoveredLink === name ? theme.colors.accent : theme.colors.textLight,
    textDecoration: 'none',
    letterSpacing: '0.02em',
    transition: 'color 0.2s',
    padding: '4px 0',
  });

  const mobileLinkStyle = {
    padding: '10px 12px',
    fontSize: 14,
    color: theme.colors.textLight,
    textDecoration: 'none',
    borderRadius: 8,
    display: 'block',
  };

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: isDark ? 'rgba(10,15,30,0.96)' : 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(16px)',
        borderBottom: isDark
          ? '1px solid rgba(201,168,76,0.15)'
          : '1px solid rgba(24,33,109,0.1)',
        fontFamily: "'DM Sans', sans-serif",
      }}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 38, height: 38,
              background: isDark ? '#0d1e3d' : '#EEF0FA',
              border: isDark ? '1px solid rgba(201,168,76,0.3)' : '1px solid rgba(24,33,109,0.15)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <HiAcademicCap style={{ width: 20, height: 20, color: theme.colors.accent }} />
            </div>
            <div>
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 20, fontWeight: 700,
                color: theme.colors.accent,
                letterSpacing: '0.05em', lineHeight: 1.1,
              }}>
                VUCA
              </div>
              <div style={{
                fontSize: 10, color: theme.colors.textLight,
                letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 1,
              }}>
                Course Allocation
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div style={{ display: 'flex', gap: 48, alignItems: 'center' }}>
            <a
              href="#features"
              style={linkStyle('Features')}
              onMouseEnter={() => setHoveredLink('Features')}
              onMouseLeave={() => setHoveredLink('')}
            >
              Features
            </a>
            <a
              href="#stats"
              style={linkStyle('Statistics')}
              onMouseEnter={() => setHoveredLink('Statistics')}
              onMouseLeave={() => setHoveredLink('')}
            >
              Statistics
            </a>
            <a
              href="#about"
              style={linkStyle('About')}
              onMouseEnter={() => setHoveredLink('About')}
              onMouseLeave={() => setHoveredLink('')}
            >
              About
            </a>
          </div>

          {/* Auth Buttons */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link
              to="/login"
              style={{
                padding: '8px 20px',
                fontSize: 14,
                color: hoveredLogin ? theme.colors.text : theme.colors.textLight,
                border: '1px solid ' + (hoveredLogin ? theme.colors.accent : theme.colors.border),
                borderRadius: 8,
                background: 'transparent',
                textDecoration: 'none',
                transition: 'all 0.2s',
                display: 'inline-block',
              }}
              onMouseEnter={() => setHoveredLogin(true)}
              onMouseLeave={() => setHoveredLogin(false)}
            >
              Log In
            </Link>
            <Link
              to="/register"
              style={{
                padding: '8px 20px',
                fontSize: 14, fontWeight: 600,
                color: '#0a0f1e',
                background: theme.colors.accent,
                borderRadius: 8,
                textDecoration: 'none',
                letterSpacing: '0.02em',
                display: 'inline-block',
              }}
            >
              Register
            </Link>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            style={{
              background: isDark ? '#0d1425' : '#F8F9FF',
              borderTop: '1px solid ' + (isDark ? 'rgba(201,168,76,0.1)' : theme.colors.border),
            }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <a href="#features" style={mobileLinkStyle} onClick={() => setMobileOpen(false)}>Features</a>
              <a href="#stats" style={mobileLinkStyle} onClick={() => setMobileOpen(false)}>Statistics</a>
              <a href="#about" style={mobileLinkStyle} onClick={() => setMobileOpen(false)}>About</a>

              <div style={{
                paddingTop: 12, marginTop: 8,
                borderTop: '1px solid ' + theme.colors.border,
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <Link
                  to="/login"
                  style={{
                    textAlign: 'center', padding: '10px', fontSize: 13,
                    color: theme.colors.textLight,
                    border: '1px solid ' + theme.colors.border,
                    borderRadius: 8, textDecoration: 'none',
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  style={{
                    textAlign: 'center', padding: '10px', fontSize: 13,
                    fontWeight: 600, color: '#0a0f1e',
                    background: theme.colors.accent,
                    borderRadius: 8, textDecoration: 'none',
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  Register
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.nav>
  );
}