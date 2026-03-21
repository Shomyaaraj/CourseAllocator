import { HiAcademicCap, HiArrowRight } from 'react-icons/hi2';
import { FiGithub, FiMail, FiLinkedin } from 'react-icons/fi';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from 'styled-components';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const theme = useTheme();
  const isDark = theme.mode === 'dark';

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const colTitleStyle = {
    fontSize: 11, fontWeight: 600, color: theme.colors.accent,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    marginBottom: 20, paddingBottom: 10,
    borderBottom: '1px solid ' + theme.colors.border,
  };

  const linkStyle = {
    display: 'block', fontSize: 13, color: theme.colors.textLight,
    textDecoration: 'none', marginBottom: 10, transition: 'color 0.2s',
  };

  return (
    <footer
      id="about"
      style={{
        background: isDark ? '#060a14' : theme.colors.secondaryBg,
        borderTop: '1px solid ' + theme.colors.border,
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
              fontSize: 22, color: theme.colors.accent, fontWeight: 700, marginBottom: 4,
            }}>VUCA</div>
            <div style={{
              fontSize: 11, color: theme.colors.textLight,
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16,
            }}>Vignan University</div>
            <p style={{ fontSize: 13, color: theme.colors.textLight, lineHeight: 1.7, maxWidth: 240 }}>
              Smart course allocation system for Vignan University. Making course
              registration fair, transparent, and efficient.
            </p>
          </div>

          {/* Navigate */}
          <div>
            <div style={colTitleStyle}>Navigate</div>
            {[{ label: 'Features', href: '#features' }, { label: 'Statistics', href: '#stats' }, { label: 'About', href: '#about' }].map(l => (
              <a key={l.label} href={l.href} style={linkStyle}
                onMouseEnter={e => e.target.style.color = theme.colors.accent}
                onMouseLeave={e => e.target.style.color = theme.colors.textLight}
              >{l.label}</a>
            ))}
          </div>

          {/* Access */}
          <div>
            <div style={colTitleStyle}>Access</div>
            {[{ label: 'Log In', to: '/login' }, { label: 'Register', to: '/register' }].map(l => (
              <Link key={l.label} to={l.to} style={linkStyle}
                onMouseEnter={e => e.target.style.color = theme.colors.accent}
                onMouseLeave={e => e.target.style.color = theme.colors.textLight}
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
                  background: isDark ? 'rgba(255,255,255,0.03)' : theme.colors.cardBg,
                  border: '1px solid ' + theme.colors.border,
                  borderRadius: 8,
                  color: isDark ? '#e8e2d0' : theme.colors.text,
                  fontSize: 13, outline: 'none', marginBottom: 8,
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = theme.colors.accent}
                onBlur={e => e.target.style.borderColor = theme.colors.border}
              />
              <button
                type="submit"
                style={{
                  width: '100%', padding: '9px',
                  background: subscribed
                    ? (isDark ? 'rgba(201,168,76,0.15)' : 'rgba(255,130,92,0.15)')
                    : theme.colors.accent,
                  color: subscribed ? theme.colors.accent : '#0a0f1e',
                  fontSize: 13, fontWeight: 600,
                  border: subscribed ? '1px solid ' + theme.colors.accent : 'none',
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
          paddingTop: 28, borderTop: '1px solid ' + theme.colors.border,
          flexWrap: 'wrap', gap: 16,
        }}>
          <span style={{ fontSize: 12, color: theme.colors.textLight }}>
            © {new Date().getFullYear()} VUCA – Vignan University. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { icon: FiMail, href: 'mailto:admin@vignan.ac.in', label: 'Email' },
              { icon: FiGithub, href: '#', label: 'GitHub' },
              { icon: FiLinkedin, href: '#', label: 'LinkedIn' }
            ].map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} title={label} style={{
                width: 34, height: 34,
                border: '1px solid ' + theme.colors.border,
                borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: theme.colors.textLight, textDecoration: 'none', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = theme.colors.accent; e.currentTarget.style.color = theme.colors.accent; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = theme.colors.border; e.currentTarget.style.color = theme.colors.textLight; }}
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