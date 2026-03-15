import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import { HiAcademicCap } from 'react-icons/hi2';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState('');
  const [hoveredLogin, setHoveredLogin] = useState(false);

  const linkColor = (name) => hoveredLink === name ? '#c9a84c' : '#6e7e98';

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(10,15,30,0.96)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(201,168,76,0.15)',
        fontFamily: "'DM Sans', sans-serif",
      }}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 38,
              height: 38,
              background: '#0d1e3d',
              border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <HiAcademicCap style={{ width: 20, height: 20, color: '#c9a84c' }} />
            </div>

            <div>
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 20,
                fontWeight: 700,
                color: '#c9a84c',
                letterSpacing: '0.05em',
                lineHeight: 1.1,
              }}>
                VUCA
              </div>

              <div style={{
                fontSize: 10,
                color: '#3a4a60',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginTop: 1,
              }}>
                Course Allocation
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex" style={{ gap: 32, alignItems: 'center' }}>

            <a
              href="#features"
              style={{
                fontSize: 13,
                color: linkColor('Features'),
                textDecoration: 'none',
                letterSpacing: '0.02em',
                transition: 'color 0.2s'
              }}
              onMouseEnter={() => setHoveredLink('Features')}
              onMouseLeave={() => setHoveredLink('')}
            >
              Features
            </a>

            <a
              href="#stats"
              style={{
                fontSize: 13,
                color: linkColor('Statistics'),
                textDecoration: 'none',
                letterSpacing: '0.02em',
                transition: 'color 0.2s'
              }}
              onMouseEnter={() => setHoveredLink('Statistics')}
              onMouseLeave={() => setHoveredLink('')}
            >
              Statistics
            </a>

            <a
              href="#about"
              style={{
                fontSize: 13,
                color: linkColor('About'),
                textDecoration: 'none',
                letterSpacing: '0.02em',
                transition: 'color 0.2s'
              }}
              onMouseEnter={() => setHoveredLink('About')}
              onMouseLeave={() => setHoveredLink('')}
            >
              About
            </a>

          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex" style={{ gap: 8, alignItems: 'center' }}>

            <Link
              to="/login"
              style={{
                padding: '7px 16px',
                fontSize: 13,
                color: hoveredLogin ? '#e8e2d0' : '#8a94a8',
                border: hoveredLogin ? '1px solid rgba(201,168,76,0.3)' : '1px solid rgba(255,255,255,0.08)',
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
                padding: '7px 16px',
                fontSize: 13,
                fontWeight: 600,
                color: '#0a0f1e',
                background: '#c9a84c',
                borderRadius: 8,
                textDecoration: 'none',
                letterSpacing: '0.02em',
                display: 'inline-block',
              }}
            >
              Register
            </Link>

          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden"
            style={{
              background: 'none',
              border: 'none',
              color: '#6e7e98',
              cursor: 'pointer',
              padding: 6
            }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden overflow-hidden"
            style={{
              background: '#0d1425',
              borderTop: '1px solid rgba(201,168,76,0.1)'
            }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>

              <a
                href="#features"
                style={{ padding: '10px 12px', fontSize: 13, color: '#6e7e98', textDecoration: 'none', borderRadius: 8 }}
                onClick={() => setMobileOpen(false)}
              >
                Features
              </a>

              <a
                href="#stats"
                style={{ padding: '10px 12px', fontSize: 13, color: '#6e7e98', textDecoration: 'none', borderRadius: 8 }}
                onClick={() => setMobileOpen(false)}
              >
                Statistics
              </a>

              <a
                href="#about"
                style={{ padding: '10px 12px', fontSize: 13, color: '#6e7e98', textDecoration: 'none', borderRadius: 8 }}
                onClick={() => setMobileOpen(false)}
              >
                About
              </a>

              <div style={{
                paddingTop: 12,
                marginTop: 8,
                borderTop: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}>

                <Link
                  to="/login"
                  style={{
                    textAlign: 'center',
                    padding: '10px',
                    fontSize: 13,
                    color: '#8a94a8',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    textDecoration: 'none',
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  Log In
                </Link>

                <Link
                  to="/register"
                  style={{
                    textAlign: 'center',
                    padding: '10px',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#0a0f1e',
                    background: '#c9a84c',
                    borderRadius: 8,
                    textDecoration: 'none',
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