import { motion } from 'framer-motion';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShieldIcon from '@mui/icons-material/Shield';
import SpeedIcon from '@mui/icons-material/Speed';
import LockIcon from '@mui/icons-material/Lock';
import GroupsIcon from '@mui/icons-material/Groups';

export default function About() {
  const revealProps = {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
    viewport: { once: true, amount: 0.2 },
  };

  const problems = [
    'Calling for help isn\'t always possible',
    'Loved ones don\'t know where you are',
    'Stolen devices are hard to track or recover',
    'Existing solutions are slow or unreliable',
    'Panic makes it difficult to take action',
  ];

  const solutions = [
    {
      icon: <SpeedIcon className="text-xl" />,
      title: 'Instant Alerts',
      desc: 'One-tap SOS sends your location and status immediately',
    },
    {
      icon: <GroupsIcon className="text-xl" />,
      title: 'Trusted Network',
      desc: 'Pre-selected contacts receive real-time updates',
    },
    {
      icon: <LockIcon className="text-xl" />,
      title: 'Secure & Private',
      desc: 'End-to-end encryption protects your data',
    },
    {
      icon: <ShieldIcon className="text-xl" />,
      title: 'Always Ready',
      desc: '24/7 monitoring with battery-optimized tracking',
    },
  ];

  return (
    <section className="py-20 md:py-28 px-5 md:px-10 bg-white" id="about">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          {...revealProps}
        >
          <motion.span 
            className="inline-block px-4 py-2 bg-primary-green/10 text-primary-green text-sm font-semibold rounded-full mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            Why Sentinelr
          </motion.span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-deep-forest mb-6">
            When danger strikes, every{' '}
            <span className="text-primary-green">second counts</span>
          </h2>
          <p className="font-body text-base md:text-lg text-gray-600 max-w-[640px] mx-auto leading-relaxed">
            Traditional safety solutions fail when you need them most. 
            Sentinelr bridges the gap between crisis and response.
          </p>
        </motion.div>

        {/* Problem & Solution Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16"
          {...revealProps}
        >
          {/* The Problem */}
          <motion.div 
            className="bg-gray-50 rounded-3xl p-8 md:p-10 border border-gray-100"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-500 flex items-center justify-center">
                <WarningAmberIcon className="text-2xl" />
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-deep-forest">
                The Problem
              </h3>
            </div>
            
            <div className="space-y-4">
              {problems.map((problem, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.08 }}
                >
                  <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                  <p className="font-body text-gray-700">{problem}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* The Solution */}
          <motion.div 
            className="bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary-green text-white flex items-center justify-center shadow-[0_4px_12px_rgba(224,112,48,0.3)]">
                <CheckCircleIcon className="text-2xl" />
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-deep-forest">
                The Solution
              </h3>
            </div>
            
            <p className="font-body text-gray-600 leading-relaxed mb-6">
              Sentinelr enables instant distress alerts to trusted contacts, 
              sharing real-time location and critical safety information automatically.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {solutions.map((solution, index) => (
                <motion.div
                  key={index}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-green/30 hover:shadow-[0_4px_16px_rgba(224,112,48,0.1)] transition-all duration-300"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.08 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-green/10 text-primary-green flex items-center justify-center mb-3">
                    {solution.icon}
                  </div>
                  <h4 className="font-display font-semibold text-deep-forest mb-1">
                    {solution.title}
                  </h4>
                  <p className="font-body text-sm text-gray-500">{solution.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          className="text-center bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="font-display text-2xl md:text-3xl font-bold text-deep-forest mb-4">
            Ready to protect what matters?
          </h3>
          <p className="font-body text-gray-600 mb-8 max-w-[480px] mx-auto">
            Join thousands of users who trust Sentinelr for their personal safety and device security.
          </p>
          <motion.a
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-green hover:bg-primary-green/90 text-white rounded-full font-semibold text-base transition-all duration-300 shadow-[0_4px_16px_rgba(224,112,48,0.25)] hover:shadow-[0_6px_20px_rgba(224,112,48,0.35)]"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Get Early Access
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
