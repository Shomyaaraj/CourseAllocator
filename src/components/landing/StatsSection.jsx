import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const stats = [
  { label: 'Students Enrolled', endValue: 5000, suffix: '+' },
  { label: 'Courses Offered', endValue: 150, suffix: '+' },
  { label: 'Departments', endValue: 12, suffix: '' },
  { label: 'Satisfaction Rate', endValue: 98, suffix: '%' },
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
      if (start >= endValue) {
        setCount(endValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, endValue]);

  return (
    <span>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="stats" className="py-32 sm:py-40 lg:py-48 bg-linear-to-br from-navy-900 via-navy-800 to-navy-950 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-navy-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <motion.div
          className="text-center mb-20 lg:mb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 bg-linear-to-r from-gold-400/20 to-white/10 text-gold-200 text-sm font-semibold rounded-full mb-4 border border-gold-400/20 backdrop-blur-sm">
            By The Numbers
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white mb-6">
            Trusted by Vignan University
          </h2>
          <p className="text-lg text-white/60 max-w-xl mx-auto">
            Serving thousands of students with intelligent course allocation every semester.
          </p>
        </motion.div>

        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 w-full">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="group relative"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <div className="bg-linear-to-br from-white/10 via-white/5 to-white/0 backdrop-blur-sm rounded-3xl p-6 sm:p-10 border border-white/20 hover:border-gold-400/40 hover:bg-linear-to-br hover:from-white/20 hover:via-white/10 hover:to-white/5 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-gold-400/20 hover:-translate-y-1">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-linear-to-t from-gold-400/5 to-transparent rounded-3xl pointer-events-none" />
                <div className="relative z-10">
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display text-gold-300 mb-3 tracking-tight group-hover:text-gold-200 transition-colors duration-300">
                    <AnimatedCounter endValue={stat.endValue} suffix={stat.suffix} isInView={isInView} />
                  </div>
                  <p className="text-sm text-white/70 font-medium group-hover:text-white/90 transition-colors">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
