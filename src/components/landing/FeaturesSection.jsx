import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { HiCpuChip, HiChartBar, HiShieldCheck, HiClock, HiUserGroup, HiBell } from 'react-icons/hi2';

const features = [
  {
    icon: HiCpuChip,
    title: 'Smart Allocation',
    description: 'AI-powered allocation engine that considers student preferences, prerequisites, and seat availability simultaneously.',
    iconBg: 'rgba(55,138,221,0.12)',
    iconColor: '#378add',
    num: '01',
  },
  {
    icon: HiChartBar,
    title: 'Real-time Analytics',
    description: 'Comprehensive dashboards with enrollment statistics, seat utilization, and course popularity insights.',
    iconBg: 'rgba(100,153,34,0.12)',
    iconColor: '#639922',
    num: '02',
  },
  {
    icon: HiShieldCheck,
    title: 'Fair Distribution',
    description: 'Transparent algorithm ensuring equitable course distribution across all eligible students without bias.',
    iconBg: 'rgba(29,158,117,0.12)',
    iconColor: '#1d9e75',
    num: '03',
  },
  {
    icon: HiClock,
    title: 'Deadline Management',
    description: 'Built-in countdown timers and automated deadline enforcement for preference submissions.',
    iconBg: 'rgba(186,117,23,0.12)',
    iconColor: '#ba7517',
    num: '04',
  },
  {
    icon: HiUserGroup,
    title: 'Role-based Access',
    description: 'Separate secure interfaces for students and administrators with fine-grained permission controls.',
    iconBg: 'rgba(127,119,221,0.12)',
    iconColor: '#7f77dd',
    num: '05',
  },
  {
    icon: HiBell,
    title: 'Instant Notifications',
    description: 'Get notified when allocation results are released, with detailed course assignment breakdowns.',
    iconBg: 'rgba(212,83,126,0.12)',
    iconColor: '#d4537e',
    num: '06',
  },
];

function FeatureCard({ feature, index, isInView }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      style={{ position: 'relative', background: '#0d1425', cursor: 'default' }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#111c35';
        e.currentTarget.querySelector('.accent-bar').style.height = '100%';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = '#0d1425';
        e.currentTarget.querySelector('.accent-bar').style.height = '0%';
      }}
    >
      {/* Gold left accent bar */}
      <div
        className="accent-bar"
        style={{
          position: 'absolute', top: 0, left: 0,
          width: 3, height: '0%',
          background: '#c9a84c',
          borderRadius: '0 0 3px 0',
          transition: 'height 0.35s ease',
        }}
      />

      {/* Card number */}
      <span style={{
        position: 'absolute', top: 28, right: 24,
        fontSize: 11, fontWeight: 600,
        letterSpacing: '0.1em', color: 'rgba(255,255,255,0.1)',
      }}>
        {feature.num}
      </span>

      <div style={{ padding: '32px 28px' }}>
        {/* Icon */}
        <div style={{
          width: 46, height: 46,
          background: feature.iconBg,
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 18,
        }}>
          <feature.icon style={{ width: 22, height: 22, color: feature.iconColor }} />
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: 15, fontWeight: 600,
          color: '#e8e2d0', margin: '0 0 10px',
          letterSpacing: '-0.01em',
        }}>
          {feature.title}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: 13, color: '#5e6d85',
          lineHeight: 1.65, margin: 0,
        }}>
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      id="features"
      style={{
        background: '#0a0f1e',
        backgroundImage: `
          linear-gradient(rgba(180,160,100,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(180,160,100,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        padding: '88px 0',
        fontFamily: "'DM Sans', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%',
        transform: 'translateX(-50%)',
        width: 600, height: 400,
        background: 'radial-gradient(ellipse, rgba(201,168,76,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px', position: 'relative', zIndex: 2 }}>

        {/* Section header */}
        <motion.div
          ref={ref}
          style={{ marginBottom: 52 }}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(201,168,76,0.08)',
            border: '1px solid rgba(201,168,76,0.2)',
            padding: '5px 14px', borderRadius: 100, marginBottom: 20,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#c9a84c', display: 'inline-block',
            }} />
            <span style={{
              fontSize: 11, color: '#c9a84c', fontWeight: 600,
              letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              Platform Features
            </span>
          </div>

          {/* Title */}
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(26px, 3.8vw, 42px)',
            fontWeight: 700, color: '#f0ece0',
            lineHeight: 1.2, margin: '0 0 14px',
          }}>
            Everything You Need for{' '}
            <em style={{ fontStyle: 'normal', color: '#c9a84c' }}>Course Allocation</em>
          </h2>

          {/* Gold divider */}
          <div style={{ width: 48, height: 2, background: '#c9a84c', margin: '16px 0' }} />

          {/* Subtitle */}
          <p style={{
            fontSize: 15, color: '#5e6d85',
            lineHeight: 1.7, maxWidth: 540, margin: 0,
          }}>
            A complete platform designed to make course allocation efficient, fair,
            and transparent for every stakeholder.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
          overflow: 'hidden',
        }}>
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>

        {/* Stats footer strip */}
        <div style={{
          display: 'flex', gap: 16, marginTop: 40, flexWrap: 'wrap',
        }}>
          {[
            { num: '98%', label: 'Allocation Accuracy' },
            { num: '<2s', label: 'Processing Time' },
            { num: '10k+', label: 'Students Served' },
          ].map(s => (
            <div key={s.label} style={{
              padding: '14px 22px',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.02)',
            }}>
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 26, fontWeight: 700, color: '#c9a84c',
                lineHeight: 1,
              }}>{s.num}</div>
              <div style={{
                fontSize: 11, color: '#3a4a60',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                fontWeight: 500, marginTop: 4,
              }}>{s.label}</div>
            </div>
          ))}

          <div style={{
            flex: 1, minWidth: 200,
            display: 'flex', alignItems: 'center',
          }}>
            <p style={{ fontSize: 13, color: '#2a3548', lineHeight: 1.6, margin: 0 }}>
              Trusted by universities and institutions to handle course allocation
              at scale — from registration to results.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}