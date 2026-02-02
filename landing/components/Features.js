import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SosIcon from '@mui/icons-material/Sos';
import MapIcon from '@mui/icons-material/Map';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LockIcon from '@mui/icons-material/Lock';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function Features() {
  const [activeFeature, setActiveFeature] = useState(0);

  const revealProps = {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
    viewport: { once: true, amount: 0.2 },
  };

  const features = [
    {
      icon: <SosIcon className="text-2xl" />,
      title: 'SOS Alerts',
      shortDesc: 'Instant emergency notifications',
      description: 'Trigger an instant SOS alert that notifies your trusted contacts immediately. One tap sends your location, status, and emergency details to the people who matter most.',
      benefits: [
        'One-tap emergency activation',
        'Automatic location sharing',
        'SMS, push, and email alerts',
        'Silent mode for discreet emergencies',
      ],
    },
    {
      icon: <MapIcon className="text-2xl" />,
      title: 'Live Geolocation',
      shortDesc: 'Real-time location tracking',
      description: 'Continuously share your live location during emergencies or scheduled check-ins. Your trusted contacts always know where you are when it matters.',
      benefits: [
        'Real-time GPS tracking',
        'Location history timeline',
        'Geofencing alerts',
        'Battery-optimized tracking',
      ],
    },
    {
      icon: <PhoneAndroidIcon className="text-2xl" />,
      title: 'Device Tracking',
      shortDesc: 'Find lost or stolen devices',
      description: 'Locate lost or stolen devices using secure location tracking. Remote lock, wipe, and recovery options keep your data safe.',
      benefits: [
        'Multi-device support',
        'Remote lock & wipe',
        'Last known location',
        'Anti-theft protection',
      ],
    },
    {
      icon: <VerifiedUserIcon className="text-2xl" />,
      title: 'Trusted Contacts',
      shortDesc: 'Your safety network',
      description: 'Choose exactly who receives your alerts — family, friends, or guardians. Full control over your safety network with easy management.',
      benefits: [
        'Unlimited contacts',
        'Role-based permissions',
        'Contact verification',
        'Quick response protocols',
      ],
    },
    {
      icon: <LockIcon className="text-2xl" />,
      title: 'Privacy-First',
      shortDesc: 'End-to-end encryption',
      description: 'Your location data is encrypted and shared only with contacts you approve. We never sell your data or track you without consent.',
      benefits: [
        'End-to-end encryption',
        'Zero data selling policy',
        'GDPR compliant',
        'On-device processing',
      ],
    },
    {
      icon: <TrendingUpIcon className="text-2xl" />,
      title: 'Scalable Platform',
      shortDesc: 'Grows with your needs',
      description: 'Whether you\'re an individual, family, or enterprise — Sentinelr scales seamlessly. Monitor one device or thousands with the same reliability.',
      benefits: [
        'Individual to enterprise',
        'API integrations',
        'Custom dashboards',
        '99.9% uptime SLA',
      ],
    },
  ];

  const currentFeature = features[activeFeature];

  return (
    <section className="py-20 md:py-28 px-5 md:px-10 relative bg-gray-50/80" id="features">
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
            Features
          </motion.span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-deep-forest mb-6">
            Everything you need for{' '}
            <span className="text-primary-green">complete safety</span>
          </h2>
          <p className="font-body text-base md:text-lg text-gray-600 max-w-[640px] mx-auto leading-relaxed">
            Powerful features designed to keep you and your loved ones protected. 
            Simple to use, impossible to ignore when it matters.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start"
          {...revealProps}
        >
          {/* Feature Navigation - Left Side */}
          <div className="space-y-3">
            {features.map((feature, index) => (
              <motion.button
                key={index}
                onClick={() => setActiveFeature(index)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 group ${
                  activeFeature === index
                    ? 'bg-white border-primary-green shadow-[0_4px_20px_rgba(224,112,48,0.15)]'
                    : 'bg-white/60 border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]'
                }`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    activeFeature === index
                      ? 'bg-primary-green text-white shadow-[0_4px_12px_rgba(224,112,48,0.3)]'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                  }`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-display text-lg font-semibold mb-1 transition-colors duration-300 ${
                      activeFeature === index ? 'text-deep-forest' : 'text-gray-800'
                    }`}>
                      {feature.title}
                    </h4>
                    <p className="font-body text-sm text-gray-500 truncate">
                      {feature.shortDesc}
                    </p>
                  </div>
                  <ArrowForwardIcon className={`text-xl transition-all duration-300 ${
                    activeFeature === index 
                      ? 'text-primary-green translate-x-0 opacity-100' 
                      : 'text-gray-300 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-50'
                  }`} />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Feature Detail - Right Side */}
          <div className="lg:sticky lg:top-28">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                className="bg-white rounded-3xl border border-gray-100 p-8 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Feature Icon & Title */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary-green text-white flex items-center justify-center shadow-[0_4px_16px_rgba(224,112,48,0.25)]">
                    {currentFeature.icon}
                  </div>
                  <div>
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-deep-forest">
                      {currentFeature.title}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p className="font-body text-base md:text-lg text-gray-600 leading-relaxed mb-8">
                  {currentFeature.description}
                </p>

                {/* Benefits List */}
                <div className="space-y-4 mb-8">
                  {currentFeature.benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.08 }}
                    >
                      <CheckCircleIcon className="text-primary-green text-xl flex-shrink-0" />
                      <span className="font-body text-gray-700">{benefit}</span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-deep-forest hover:bg-deep-forest/90 text-white rounded-full font-semibold text-base transition-all duration-300 shadow-[0_2px_12px_rgba(18,6,30,0.2)] hover:shadow-[0_4px_16px_rgba(18,6,30,0.3)] group"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started
                  <ArrowForwardIcon className="text-lg transition-transform group-hover:translate-x-1" />
                </motion.a>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
