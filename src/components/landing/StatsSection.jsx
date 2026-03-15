import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const stats = [
  { label: 'Students Enrolled', endValue: 5000, suffix: '+', barWidth: '85%' },
  { label: 'Courses Offered',   endValue: 150,  suffix: '+', barWidth: '65%' },
  { label: 'Departments',       endValue: 12,   suffix: '',  barWidth: '48%' },
  { label: 'Satisfaction Rate', endValue: 98,   suffix: '%', barWidth: '98%' },
];

function AnimatedCounter({ endValue, suffix, isInView }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = endValue / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= endValue) { setCount(endValue); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, endValue]);
  return <span>{count.toLocaleString()}{suffix}</span>;
}

export default function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      id="stats"
      style={{
        background: '#080d1a',
        padding: '80px 0',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>

        {/* Header */}
        <motion.div
          style={{ textAlign: 'center', marginBottom: 48 }}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(201,168,76,0.08)',
            border: '1px solid rgba(201,168,76,0.2)',
            padding: '5px 14px', borderRadius: 100, marginBottom: 16,
          }}>
            <span style={{ fontSize: 11, color: '#c9a84c', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              By The Numbers
            </span>
          </div>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(24px, 3.5vw, 38px)',
            fontWeight: 700, color: '#f0ece0', margin: '0 0 10px',
          }}>
            Trusted by Vignan University
          </h2>
          <p style={{ fontSize: 14, color: '#3a4a60' }}>
            Serving thousands of students with intelligent course allocation every semester.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div
          ref={ref}
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 1, background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14, overflow: 'hidden',
          }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{ background: '#0d1425', padding: '36px 28px', position: 'relative', cursor: 'default' }}
              onMouseEnter={e => e.currentTarget.style.background = '#111c35'}
              onMouseLeave={e => e.currentTarget.style.background = '#0d1425'}
            >
              {/* Top accent bar */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: 2, background: 'rgba(201,168,76,0.15)',
              }}>
                <div style={{ height: '100%', width: stat.barWidth, background: '#c9a84c', borderRadius: 1 }} />
              </div>

              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 42, fontWeight: 700, color: '#c9a84c',
                lineHeight: 1, marginBottom: 8,
              }}>
                <AnimatedCounter endValue={stat.endValue} suffix={stat.suffix} isInView={isInView} />
              </div>
              <div style={{
                fontSize: 12, color: '#3a4a60',
                textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500,
              }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}