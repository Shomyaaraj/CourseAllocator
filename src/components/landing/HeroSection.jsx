import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiAcademicCap, HiArrowRight } from 'react-icons/hi2';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-br from-navy-950 via-navy-900 to-navy-800">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-navy-500/20 rounded-full blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gold-400/10 rounded-full blur-3xl"
          animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-navy-400/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 pt-28 pb-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 mb-10 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/15 transition-colors duration-300"
        >
          <HiAcademicCap className="w-4 h-4 text-gold-400" />
          <span className="text-sm font-medium text-white/80">Vignan University</span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display text-white leading-[1.15] mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Smart Course{' '}
          <span className="bg-linear-to-r from-gold-300 to-gold-500 bg-clip-text text-transparent">
            Allocation
          </span>
          <br />
          Made Simple
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Submit your course preferences, and our intelligent allocation system handles the rest.
          Fair, transparent, and hassle-free course registration.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Link
            to="/register"
            className="group px-8 py-4 text-base font-semibold text-navy-900 bg-linear-to-r from-gold-300 to-gold-400 hover:from-gold-400 hover:to-gold-500 rounded-2xl shadow-xl shadow-gold-400/20 hover:shadow-gold-400/40 hover:scale-[1.03] transition-all duration-300 flex items-center gap-2"
          >
            Get Started
            <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 text-base font-semibold text-white border border-white/20 hover:bg-white/10 rounded-2xl backdrop-blur-sm transition-all duration-300"
          >
            Sign In
          </Link>
        </motion.div>

        {/* Floating Cards Preview */}
        <motion.div
          className="mt-24 relative w-full max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="relative bg-linear-to-b from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 sm:p-12 shadow-2xl shadow-navy-900/30 hover:border-white/30 transition-all duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              {['Course Selection', 'Smart Ranking', 'Auto Allocation'].map((item, i) => (
                <motion.div
                  key={item}
                  className="group relative bg-linear-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/10 hover:border-gold-400/30 hover:bg-linear-to-br hover:from-white/20 hover:to-white/10 transition-all duration-300 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + i * 0.15 }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-linear-to-br from-gold-400/10 to-transparent rounded-2xl" />
                  <div className="relative z-10">
                    <div className="w-10 h-10 bg-linear-to-br from-gold-300 to-gold-500 rounded-xl mb-4 flex items-center justify-center text-navy-900 font-bold text-lg shadow-lg shadow-gold-400/30">
                      {i + 1}
                    </div>
                    <p className="text-white/90 text-sm font-semibold group-hover:text-white transition-colors duration-300">{item}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-linear-to-r from-navy-500/20 via-gold-400/10 to-navy-500/20 rounded-3xl blur-2xl -z-10" />
        </motion.div>
      </div>
    </section>
  );
}
