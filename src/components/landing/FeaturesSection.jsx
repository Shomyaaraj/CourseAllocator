import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { HiCpuChip, HiChartBar, HiShieldCheck, HiClock, HiUserGroup, HiBell } from 'react-icons/hi2';

const features = [
  {
    icon: HiCpuChip,
    title: 'Smart Allocation',
    description: 'AI-powered course allocation engine that considers preferences, prerequisites, and availability.',
    gradient: 'from-blue-500 to-cyan-500',
    shadow: 'shadow-blue-500/20',
  },
  {
    icon: HiChartBar,
    title: 'Real-time Analytics',
    description: 'Comprehensive dashboards with enrollment statistics, seat utilization, and course popularity insights.',
    gradient: 'from-purple-500 to-pink-500',
    shadow: 'shadow-purple-500/20',
  },
  {
    icon: HiShieldCheck,
    title: 'Fair Distribution',
    description: 'Transparent algorithm ensuring equitable course distribution across all eligible students.',
    gradient: 'from-emerald-500 to-teal-500',
    shadow: 'shadow-emerald-500/20',
  },
  {
    icon: HiClock,
    title: 'Deadline Management',
    description: 'Built-in countdown timers and automated deadline enforcement for preference submissions.',
    gradient: 'from-orange-500 to-amber-500',
    shadow: 'shadow-orange-500/20',
  },
  {
    icon: HiUserGroup,
    title: 'Role-based Access',
    description: 'Separate interfaces for students and administrators with secure authentication.',
    gradient: 'from-rose-500 to-red-500',
    shadow: 'shadow-rose-500/20',
  },
  {
    icon: HiBell,
    title: 'Instant Notifications',
    description: 'Get notified when allocation results are released, with detailed course assignment information.',
    gradient: 'from-indigo-500 to-violet-500',
    shadow: 'shadow-indigo-500/20',
  },
];

function FeatureCard({ feature, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      className="group relative bg-white rounded-2xl p-7 sm:p-8 border border-slate-200/80 hover:border-gold-300/50 shadow-sm hover:shadow-2xl hover:shadow-gold-400/15 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-br from-gold-400/5 via-transparent to-gold-500/5 pointer-events-none" />
      
      <div className="relative z-10">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} ${feature.shadow} shadow-lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
          <feature.icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 font-display mb-3 group-hover:text-slate-950 transition-colors">{feature.title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-600 transition-colors">{feature.description}</p>
      </div>
    </motion.div>
  );
}

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="features" className="py-32 sm:py-40 lg:py-48 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-200/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/2 translate-x-1/2 w-80 h-80 bg-navy-200/5 rounded-full blur-3xl" />
      </div>
      
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <motion.div
          ref={ref}
          className="text-center mb-20 lg:mb-28"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 bg-linear-to-r from-navy-50 to-gold-50 text-navy-700 text-sm font-semibold rounded-full mb-4 border border-navy-200/40 shadow-sm shadow-navy-500/5">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-slate-900 mb-6 text-center">
            Everything You Need for Course Allocation
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto text-center">
            A complete platform designed to make course allocation efficient, fair, and transparent for all stakeholders.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 w-full">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
