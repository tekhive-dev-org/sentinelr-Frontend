import { useState } from 'react';
import { motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DownloadIcon from '@mui/icons-material/Download';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DevicesIcon from '@mui/icons-material/Devices';
import LinkIcon from '@mui/icons-material/Link';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupsIcon from '@mui/icons-material/Groups';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function AppPreview() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const revealProps = {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
    viewport: { once: true, amount: 0.2 },
  };

  const steps = [
    {
      number: '01',
      icon: <DownloadIcon className="text-2xl" />,
      title: 'Download & Create Account',
      description: 'Get Sentinelr from the App Store or Google Play. Sign up with your email in under 2 minutes to access your family safety dashboard.',
      image: '/1.png',
      tip: 'Available on iOS and Android',
    },
    {
      number: '02',
      icon: <GroupsIcon className="text-2xl" />,
      title: 'Add Family Members',
      description: 'Build your trusted network by adding family members. Enter their name, email, and phone number, then assign their role in your safety circle.',
      image: '/2.1.png',
      tip: 'Add parents, children, or guardians',
    },
    {
      number: '03',
      icon: <DevicesIcon className="text-2xl" />,
      title: 'Register Your Devices',
      description: 'Add smartphones, tablets, laptops, or smartwatches to your network. Name each device and assign it to a family member for easy tracking.',
      image: '/2.png',
      tip: 'Supports all major device types',
    },
    {
      number: '04',
      icon: <LinkIcon className="text-2xl" />,
      title: 'Pair & Connect',
      description: 'Use a secure pairing code or scan a QR code to connect each device. Once paired, you\'ll see a confirmation that the device is active and protected.',
      image: '/6.png',
      tip: 'Secure, encrypted connection',
    },
    {
      number: '05',
      icon: <DashboardIcon className="text-2xl" />,
      title: 'Monitor & Protect',
      description: 'View all family members and their devices from one dashboard. Access location, battery status, and safety controls like screen time and app management.',
      image: '/7.png',
      tip: 'Real-time status updates',
    },
  ];

  const allImages = [
    { src: '/1.png', label: 'Dashboard' },
    { src: '/1.1.png', label: 'Family Tab' },
    { src: '/2.png', label: 'Add Member' },
    { src: '/2.1.png', label: 'Add Device' },
    { src: '/3.png', label: 'Members List' },
    { src: '/3.1.png', label: 'Member Profile' },
    { src: '/6.png', label: 'Paired Success' },
    { src: '/7.png', label: 'Devices List' },
  ];

  const openPreview = (index) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  const closePreview = () => {
    setIsModalOpen(false);
  };

  const changeImage = (direction) => {
    setCurrentIndex((prev) => {
      let newIndex = prev + direction;
      if (newIndex < 0) newIndex = allImages.length - 1;
      if (newIndex >= allImages.length) newIndex = 0;
      return newIndex;
    });
  };

  return (
    <section className="py-20 md:py-28 px-5 md:px-10 bg-gray-50/80" id="preview">
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
            How It Works
          </motion.span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-deep-forest mb-6">
            Get started in{' '}
            <span className="text-primary-green">5 simple steps</span>
          </h2>
          <p className="font-body text-base md:text-lg text-gray-600 max-w-[640px] mx-auto leading-relaxed">
            Setting up your safety network takes less than 5 minutes. 
            Here's how to get protected with Sentinelr.
          </p>
        </motion.div>

        {/* Steps & Phone Preview */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20"
          {...revealProps}
        >
          {/* Steps List */}
          <div className="space-y-4 order-2 lg:order-1">
            {steps.map((step, index) => (
              <motion.button
                key={index}
                onClick={() => setActiveStep(index)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 group ${
                  activeStep === index
                    ? 'bg-white border-primary-green shadow-[0_4px_20px_rgba(224,112,48,0.15)]'
                    : 'bg-white/60 border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]'
                }`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    activeStep === index
                      ? 'bg-primary-green text-white shadow-[0_4px_12px_rgba(224,112,48,0.3)]'
                      : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                  }`}>
                    {step.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-xs font-bold transition-colors duration-300 ${
                        activeStep === index ? 'text-primary-green' : 'text-gray-400'
                      }`}>
                        STEP {step.number}
                      </span>
                    </div>
                    <h4 className={`font-display text-lg font-semibold mb-1 transition-colors duration-300 ${
                      activeStep === index ? 'text-deep-forest' : 'text-gray-700'
                    }`}>
                      {step.title}
                    </h4>
                    <p className={`font-body text-sm leading-relaxed transition-colors duration-300 ${
                      activeStep === index ? 'text-gray-600' : 'text-gray-500'
                    }`}>
                      {step.description}
                    </p>
                    {activeStep === index && step.tip && (
                      <motion.div 
                        className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CheckCircleIcon className="text-primary-green text-sm" />
                        <span className="font-body text-xs text-primary-green font-medium">{step.tip}</span>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Phone Preview */}
          <div className="order-1 lg:order-2 flex justify-center">
            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {/* Phone Frame */}
              <div className="relative w-[280px] md:w-[320px] h-[560px] md:h-[640px] bg-deep-forest rounded-[3rem] p-3 shadow-[0_20px_60px_rgba(18,6,30,0.3)]">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-deep-forest rounded-b-2xl z-10" />
                  
                  {/* Screen Content */}
                  <motion.img
                    key={activeStep}
                    src={steps[activeStep].image}
                    alt={`Step ${activeStep + 1}: ${steps[activeStep].title}`}
                    className="w-full h-full object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                    onClick={() => {
                      const imgIndex = allImages.findIndex(img => img.src === steps[activeStep].image);
                      openPreview(imgIndex >= 0 ? imgIndex : 0);
                    }}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Step Indicator Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveStep(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      activeStep === index 
                        ? 'bg-primary-green w-8' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Gallery Section */}
        <motion.div 
          className="bg-white rounded-3xl p-6 md:p-10 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-display text-xl md:text-2xl font-bold text-deep-forest mb-1">
                App Gallery
              </h3>
              <p className="font-body text-sm text-gray-500">
                Explore all screens and features
              </p>
            </div>
            <span className="font-body text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              {allImages.length} screens
            </span>
          </div>

          {/* Clean Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {allImages.map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                viewport={{ once: true }}
              >
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => openPreview(index)}
                >
                  {/* Card Container */}
                  <div className="relative overflow-hidden rounded-2xl bg-gray-50 border border-gray-200/80 transition-all duration-300 group-hover:border-primary-green/40 group-hover:shadow-[0_8px_30px_rgba(224,112,48,0.12)]">
                    {/* Image */}
                    <div className="aspect-[9/18] overflow-hidden">
                      <img
                        src={img.src}
                        alt={img.label}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-forest/90 via-deep-forest/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end">
                      <div className="p-4 w-full">
                        <h4 className="font-display text-sm font-semibold text-white">
                          {img.label}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Label */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-primary-green/10 text-primary-green text-[10px] font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="font-body text-xs text-gray-600 truncate">
                      {img.label}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Fullscreen Modal */}
      {isModalOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/95 z-[3000] flex justify-center items-center backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            onClick={closePreview}
            className="absolute top-6 right-8 text-white text-4xl cursor-pointer opacity-80 hover:opacity-100 transition-all hover:scale-110 hover:rotate-90 duration-300"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <CloseIcon fontSize="large" />
          </motion.button>

          <motion.button
            onClick={() => changeImage(-1)}
            className="absolute left-8 top-1/2 -translate-y-1/2 text-white text-5xl cursor-pointer opacity-80 hover:opacity-100 transition-all hover:scale-110"
            whileHover={{ scale: 1.15, x: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeftIcon fontSize="inherit" />
          </motion.button>

          <motion.img
            key={currentIndex}
            src={allImages[currentIndex].src}
            alt={allImages[currentIndex].label}
            className="max-w-[90%] max-h-[85%] object-contain rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            style={{ aspectRatio: '9 / 19.5' }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          />

          <motion.button
            onClick={() => changeImage(1)}
            className="absolute right-8 top-1/2 -translate-y-1/2 text-white text-5xl cursor-pointer opacity-80 hover:opacity-100 transition-all hover:scale-110"
            whileHover={{ scale: 1.15, x: 4 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRightIcon fontSize="inherit" />
          </motion.button>

          {/* Image Counter with Label */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
            <span className="font-body text-sm text-white/90 font-medium">{allImages[currentIndex].label}</span>
            <span className="font-body text-xs text-white/60 bg-black/50 px-3 py-1 rounded-full">
              {currentIndex + 1} / {allImages.length}
            </span>
          </div>
        </motion.div>
      )}
    </section>
  );
}
