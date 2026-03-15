import { HiAcademicCap, HiArrowRight } from 'react-icons/hi2';
import { FiGithub, FiMail, FiLinkedin } from 'react-icons/fi';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const colTitleStyle = {
    fontSize: 11, fontWeight: 600, color: '#c9a84c',
    letterSpacing: '0.12em', textTransform: 'uppercase',
    marginBottom: 20, paddingBottom: 10,
    borderBottom: '1px solid rgba(201,168,76,0.15)',
  };

  const linkStyle = {
    display: 'block', fontSize: 13, color: '#3a4a60',
    textDecoration: 'none', marginBottom: 10, transition: 'color 0.2s',
  };

  return (
    <footer
      id="about"
      style={{
        background: '#060a14',
        borderTop: '1px solid rgba(201,168,76,0.12)',
        padding: '64px 0 36px',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>

        {/* Main Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.8fr 1fr 1fr 1.6fr',
          gap: 48, marginBottom: 48,
        }}>

          {/* Brand */}
          <div>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 22, color: '#c9a84c', fontWeight: 700, marginBottom: 4,
            }}>VUCA</div>
            <div style={{
              fontSize: 11, color: '#3a4a60',
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16,
            }}>Vignan University</div>
            <p style={{ fontSize: 13, color: '#3a4a60', lineHeight: 1.7, maxWidth: 240 }}>
              Smart course allocation system for Vignan University. Making course
              registration fair, transparent, and efficient.
            </p>
          </div>

          {/* Navigate */}
          <div>
            <div style={colTitleStyle}>Navigate</div>
            {[{ label: 'Features', href: '#features' }, { label: 'Statistics', href: '#stats' }, { label: 'About', href: '#about' }].map(l => (
              <a key={l.label} href={l.href} style={linkStyle}
                onMouseEnter={e => e.target.style.color = '#c9a84c'}
                onMouseLeave={e => e.target.style.color = '#3a4a60'}
              >{l.label}</a>
            ))}
          </div>

          {/* Access */}
          <div>
            <div style={colTitleStyle}>Access</div>
            {[{ label: 'Log In', to: '/login' }, { label: 'Register', to: '/register' }].map(l => (
              <Link key={l.label} to={l.to} style={linkStyle}
                onMouseEnter={e => e.target.style.color = '#c9a84c'}
                onMouseLeave={e => e.target.style.color = '#3a4a60'}
              >{l.label}</Link>
            ))}
          </div>

          {/* Updates */}
          <div>
            <div style={colTitleStyle}>Updates</div>
            <form onSubmit={handleSubscribe}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                style={{
                  width: '100%', padding: '9px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 8, color: '#e8e2d0',
                  fontSize: 13, outline: 'none', marginBottom: 8,
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.35)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
              />
              <button
                type="submit"
                style={{
                  width: '100%', padding: '9px',
                  background: subscribed ? 'rgba(201,168,76,0.15)' : '#c9a84c',
                  color: subscribed ? '#c9a84c' : '#0a0f1e',
                  fontSize: 13, fontWeight: 600,
                  border: subscribed ? '1px solid rgba(201,168,76,0.3)' : 'none',
                  borderRadius: 8, cursor: 'pointer', letterSpacing: '0.02em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                {subscribed ? 'Subscribed!' : <><span>Subscribe</span><HiArrowRight style={{ width: 14, height: 14 }} /></>}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.04)',
          flexWrap: 'wrap', gap: 16,
        }}>
          <span style={{ fontSize: 12, color: '#1e2a3a' }}>
            © {new Date().getFullYear()} VUCA – Vignan University. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ icon: FiMail, href: 'mailto:admin@vignan.ac.in', label: 'Email' },
              { icon: FiGithub, href: '#', label: 'GitHub' },
              { icon: FiLinkedin, href: '#', label: 'LinkedIn' }].map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} title={label} style={{
                width: 34, height: 34, border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#3a4a60', textDecoration: 'none', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; e.currentTarget.style.color = '#c9a84c'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#3a4a60'; }}
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}