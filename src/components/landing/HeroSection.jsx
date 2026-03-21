import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowRight } from 'react-icons/hi2';
import { useTheme } from 'styled-components';

const steps = ['Course Selection', 'Smart Ranking', 'Auto Allocation'];

export default function HeroSection() {
  const theme = useTheme();
  const isDark = theme.mode === 'dark';

  return (
    <section style={{
      minHeight: '100vh',
      background: isDark ? '#0a0f1e' : theme.colors.background,
      backgroundImage: isDark
        ? 'linear-gradient(rgba(180,160,100,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(180,160,100,0.03) 1px, transparent 1px)'
        : 'linear-gradient(rgba(24,33,109,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(24,33,109,0.03) 1px, transparent 1px)',
      backgroundSize: '56px 56px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      fontFamily: "'DM Sans', sans-serif",
    }}>

      {/* Glow */}
      <div style={{
        position: 'absolute', top: '40%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 700, height: 400,
        background: isDark
          ? 'radial-gradient(ellipse, rgba(201,168,76,0.07) 0%, transparent 70%)'
          : 'radial-gradient(ellipse, rgba(255,130,92,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative', zIndex: 2,
        width: '100%', maxWidth: 860,
        margin: '0 auto', padding: '120px 32px 80px',
        textAlign: 'center',
      }}>

        {/* Eyebrow pill */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: isDark ? 'rgba(201,168,76,0.08)' : 'rgba(255,130,92,0.08)',
            border: isDark ? '1px solid rgba(201,168,76,0.2)' : '1px solid rgba(255,130,92,0.3)',
            padding: '6px 16px', borderRadius: 100,
            marginBottom: 28,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: theme.colors.accent, display: 'inline-block' }} />
          <span style={{ fontSize: 12, color: theme.colors.accent, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Vignan University
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(36px, 5.5vw, 62px)',
            fontWeight: 700,
            color: isDark ? '#f0ece0' : theme.colors.primary,
            lineHeight: 1.15, margin: '0 0 20px',
          }}
        >
          Smart Course{' '}
          <em style={{ fontStyle: 'normal', color: theme.colors.accent }}>Allocation</em>
          <br />Made Simple
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            fontSize: 16,
            color: theme.colors.textLight,
            lineHeight: 1.75, maxWidth: 500,
            margin: '0 auto 36px',
          }}
        >
          Submit your course preferences and our intelligent system handles the rest —
          fair, transparent, and hassle-free registration.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}
        >
          <Link
            to="/register"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 28px', background: theme.colors.accent,
              color: '#0a0f1e', fontSize: 14, fontWeight: 600,
              borderRadius: 10, textDecoration: 'none', letterSpacing: '0.02em',
            }}
          >
            Get Started <HiArrowRight style={{ width: 16, height: 16 }} />
          </Link>
          <Link
            to="/login"
            style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '13px 28px', background: 'transparent',
              color: theme.colors.textLight, fontSize: 14,
              border: '1px solid ' + theme.colors.border,
              borderRadius: 10, textDecoration: 'none',
            }}
          >
            Sign In
          </Link>
        </motion.div>

        {/* 3-step cards */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
            gap: 1,
            background: isDark ? 'rgba(255,255,255,0.05)' : theme.colors.border,
            border: '1px solid ' + theme.colors.border,
            borderRadius: 16, overflow: 'hidden',
            maxWidth: 620, margin: '0 auto',
          }}
        >
          {steps.map((step, i) => (
            <div key={step} style={{
              background: isDark ? '#0d1425' : theme.colors.cardBg,
              padding: '28px 24px',
            }}>
              <div style={{
                width: 32, height: 32,
                background: isDark ? 'rgba(201,168,76,0.1)' : 'rgba(255,130,92,0.1)',
                border: '1px solid ' + (isDark ? 'rgba(201,168,76,0.2)' : 'rgba(255,130,92,0.3)'),
                borderRadius: 8, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 600, color: theme.colors.accent,
                marginBottom: 12,
              }}>{i + 1}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: theme.colors.textLight }}>{step}</div>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}