import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function Stats() {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState({
    reliability: 0,
    alerts: 0,
    partners: 0,
  });
  const sectionRef = useRef(null);

  const revealProps = {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
    viewport: { once: true, amount: 0.2 },
  };

  const stats = [
    { key: 'reliability', target: 99, suffix: '%', label: 'Alert Delivery Reliability' },
    { key: 'alerts', target: 2.5, suffix: 'M+', label: 'Emergency Alerts Delivered', isDecimal: true },
    { key: 'partners', target: 150, suffix: '+', label: 'Trusted Safety Partners' },
    { key: 'monitoring', value: '24/7', label: 'Real-Time Safety Monitoring' },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;

      setCounts({
        reliability: Math.min(Math.floor(99 * progress), 99),
        alerts: Math.min(parseFloat((2.5 * progress).toFixed(1)), 2.5),
        partners: Math.min(Math.floor(150 * progress), 150),
      });

      if (step >= steps) {
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <motion.section
      ref={sectionRef}
      className="py-16 md:py-20 px-5 md:px-10 bg-gradient-to-br from-white via-light-mint/20 to-white border-y border-primary-green/10"
      {...revealProps}
    >
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 text-center">
        {stats.map((stat, index) => (
          <motion.div 
            key={stat.key || stat.value} 
            className="stat-item group"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
          >
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-green/20 to-accent-blue/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
              <h3 className="relative font-space text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-green to-accent-blue bg-clip-text text-transparent mb-3 transition-transform group-hover:scale-110 duration-300">
                {stat.value
                  ? stat.value
                  : stat.isDecimal
                  ? `${counts[stat.key]}${stat.suffix}`
                  : `${counts[stat.key]}${stat.suffix}`}
              </h3>
            </div>
            <p className="text-lg text-deep-forest/70 font-medium transition-colors group-hover:text-deep-forest">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
