import { HiAcademicCap, HiArrowRight } from 'react-icons/hi2';
import { FiGithub, FiMail, FiTwitter, FiLinkedin } from 'react-icons/fi';
import { useState } from 'react';
import { motion } from 'framer-motion';

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

  return (
    <footer id="about" className="bg-linear-to-b from-slate-950 via-navy-950 to-slate-950 text-white py-24 sm:py-32 lg:py-40 border-t border-white/5 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-navy-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/2 translate-x-1/2 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-10 lg:gap-12 mb-16">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-linear-to-br from-navy-400 to-navy-600 rounded-xl flex items-center justify-center shadow-lg shadow-navy-500/30">
                <HiAcademicCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold font-display bg-linear-to-r from-gold-300 to-gold-400 bg-clip-text text-transparent">VUCA</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-6 max-w-xs">
              Smart course allocation system for Vignan University. Making course registration fair, transparent, and efficient.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-white mb-6 flex items-center gap-2">
              <div className="w-1 h-4 bg-linear-to-b from-gold-400 to-gold-600 rounded-full" />
              Navigate
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Features', href: '#features' },
                { label: 'Statistics', href: '#stats' },
                { label: 'About', href: '#about' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-gold-300 flex items-center gap-1 transition-all duration-300 group"
                  >
                    <span className="w-0 group-hover:w-4 h-px bg-gold-400 transition-all duration-300" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Auth Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-white mb-6 flex items-center gap-2">
              <div className="w-1 h-4 bg-linear-to-b from-gold-400 to-gold-600 rounded-full" />
              Access
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Log In', href: '/login' },
                { label: 'Register', href: '/register' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-gold-300 flex items-center gap-1 transition-all duration-300 group"
                  >
                    <span className="w-0 group-hover:w-4 h-px bg-gold-400 transition-all duration-300" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h4 className="text-sm font-semibold uppercase tracking-widest text-white mb-6 flex items-center gap-2">
              <div className="w-1 h-4 bg-linear-to-b from-gold-400 to-gold-600 rounded-full" />
              Updates
            </h4>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold-400/50 focus:bg-white/10 transition-all duration-300"
                  required
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-4 py-2.5 bg-linear-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-slate-900 text-sm font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                <span>{subscribed ? 'Subscribed!' : 'Subscribe'}</span>
                {!subscribed && <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </motion.button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-linear-to-r from-transparent via-white/10 to-transparent my-12" />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} VUCA – Vignan University. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {[
              { icon: FiMail, href: 'mailto:admin@vignan.ac.in', label: 'Email' },
              { icon: FiGithub, href: '#', label: 'GitHub' },
              { icon: FiLinkedin, href: '#', label: 'LinkedIn' },
            ].map(({ icon: Icon, href, label }) => (
              <motion.a
                key={label}
                href={href}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-gold-300 hover:bg-gold-400/10 hover:border-gold-400/30 transition-all duration-300"
                title={label}
              >
                <Icon className="w-4 h-4" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
