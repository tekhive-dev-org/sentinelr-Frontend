import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ExploreIcon from '@mui/icons-material/Explore';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TechGlobe from './TechGlobe';

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState({
    reliability: 0,
    alerts: 0,
    partners: 0,
  });
  const sectionRef = useRef(null);

  const stats = [
    { key: 'reliability', target: 99, suffix: '%', label: 'Uptime' },
    { key: 'alerts', target: 2.5, suffix: 'M+', label: 'Alerts Delivered', isDecimal: true },
    { key: 'partners', target: 150, suffix: '+', label: 'Partners' },
    { key: 'monitoring', value: '24/7', label: 'Monitoring' },
  ];

  const revealProps = {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
    viewport: { once: true, amount: 0.2 },
  };

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
    <section ref={sectionRef} className="min-h-screen flex flex-col items-center justify-center relative px-5 md:px-10 pt-28 pb-12" id="home">
      <div className="max-w-[1200px] w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
        {/* Hero Text */}
        <motion.div 
          className="text-center lg:text-left order-2 lg:order-1" 
          {...revealProps}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-deep-forest">
              Safety & Intelligent{' '}
              <span className="relative inline-block text-primary-green">
                security system
                <motion.span
                  className="absolute -bottom-2 left-0 w-full h-1 bg-primary-green rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </span>
            </h1>
          </motion.div>
          
          <motion.p 
            className="font-body text-base md:text-lg leading-relaxed text-gray-600 mb-10 max-w-[520px] mx-auto lg:mx-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Sentinelr is an intelligent monitoring and safety platform designed to provide real-time threat detection, behavioral analysis, and proactive risk prevention across digital environments. Built for organizations, families, and institutions that demand visibility, control, and peace of mind.
          </motion.p>
          
          <motion.div 
            className="flex gap-4 flex-wrap justify-center lg:justify-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.a 
              href="#features" 
              className="bg-primary-green hover:bg-primary-green/90 text-white px-8 py-4 rounded-full font-semibold text-base flex items-center gap-2 shadow-[0_2px_12px_rgba(224,112,48,0.25)] hover:shadow-[0_4px_16px_rgba(224,112,48,0.35)] transition-all duration-300 group"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <ExploreIcon className="transition-transform group-hover:rotate-12" /> 
              Explore Solutions
            </motion.a>
            <motion.a 
              href="#about" 
              className="bg-white hover:bg-gray-50 text-deep-forest px-8 py-4 rounded-full font-semibold text-base flex items-center gap-2 border-2 border-gray-200 hover:border-gray-300 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-300 group"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <MenuBookIcon className="transition-transform group-hover:scale-110" /> 
              Learn More
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Hero Visual - Tech Globe */}
        <motion.div 
          className="relative h-[360px] lg:h-[520px] flex items-center justify-center order-1 lg:order-2" 
          {...revealProps}
        >
          <motion.div 
            className="w-full h-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <TechGlobe />
          </motion.div>
        </motion.div>
      </div>

      {/* Stats Section */}
      <div className="max-w-[1200px] w-full">
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 px-6 py-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.key || stat.value}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
            >
              <div className="font-display text-3xl md:text-4xl font-bold text-deep-forest mb-2">
                {stat.value
                  ? stat.value
                  : stat.isDecimal
                  ? `${counts[stat.key]}${stat.suffix}`
                  : `${counts[stat.key]}${stat.suffix}`}
              </div>
              <div className="font-body text-sm md:text-base text-gray-600 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
