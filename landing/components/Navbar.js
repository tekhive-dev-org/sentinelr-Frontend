import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('home');
  const navRef = useRef(null);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Handle scroll for navbar styling and active link
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Update active link based on scroll position
      const sections = document.querySelectorAll('section[id]');
      const scrollPosition = window.pageYOffset + 150;

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          setActiveLink(sectionId || 'home');
        }
      });
    };

    handleScroll(); // Call once on mount
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && navRef.current && !navRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  const handleLinkClick = useCallback((e, href) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const navbarHeight = 80;
      const targetPosition = target.offsetTop - navbarHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  }, []);

  const navLinks = [
    { href: '#home', label: 'Home', ariaLabel: 'Go to home section' },
    { href: '#features', label: 'Features', ariaLabel: 'View key features' },
    { href: '#about', label: 'About', ariaLabel: 'Learn about us' },
    { href: '#contact', label: 'Contact', ariaLabel: 'Contact us' },
  ];

  return (
    <nav
      ref={navRef}
      role="navigation"
      aria-label="Main navigation"
      id="navbar"
      className={`fixed top-0 w-full px-5 md:px-10 z-[100] transition-all duration-300 border-b ${
        isScrolled
          ? 'py-3 bg-white/95 shadow-[0_10px_30px_rgba(18,6,30,0.12)] border-primary-green/25'
          : 'py-5 bg-white/80 border-primary-green/15'
      } backdrop-blur-xl`}
    >
      <div className="max-w-[1400px] mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link 
          href="#home" 
          className="flex items-center gap-3 group relative z-10" 
          onClick={(e) => handleLinkClick(e, '#home')}
          aria-label="Sentinelr - Go to home"
        >
          <motion.img
            src="/logo.png"
            alt="Sentinelr Logo"
            className="logo-image"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <span className="font-display text-[26px] md:text-[28px] font-bold text-deep-forest group-hover:text-primary-green transition-colors duration-300">
            Sentinelr
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-4">
          <ul className="flex list-none gap-1 bg-white/80 backdrop-blur-md px-1.5 py-1.5 rounded-full border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            {navLinks.map((link) => (
              <motion.li 
                key={link.href}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <a
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  aria-label={link.ariaLabel}
                  aria-current={activeLink === link.href.replace('#', '') ? 'page' : undefined}
                  className={`relative block px-5 py-2.5 rounded-full font-medium text-[0.95rem] whitespace-nowrap transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-green/40 focus:ring-offset-2 ${
                    activeLink === link.href.replace('#', '')
                      ? 'text-white bg-deep-forest shadow-[0_2px_8px_rgba(18,6,30,0.25)]'
                      : 'text-gray-700 hover:text-deep-forest hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </a>
              </motion.li>
            ))}
          </ul>

          {/* CTA Button */}
          <motion.a
            href="#contact"
            onClick={(e) => handleLinkClick(e, '#contact')}
            className="bg-primary-green hover:bg-primary-green/90 text-white py-2.5 px-6 rounded-full font-semibold text-[0.95rem] flex items-center gap-2 shadow-[0_2px_12px_rgba(224,112,48,0.25)] hover:shadow-[0_4px_16px_rgba(224,112,48,0.35)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-green/40 focus:ring-offset-2"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Get early access to Sentinelr"
          >
            <RocketLaunchIcon className="text-lg" />
            <span className="hidden xl:inline">Get Early Access</span>
            <span className="xl:hidden">Get Access</span>
          </motion.a>
        </div>

        {/* Mobile Menu Toggle */}
        <motion.button
          className="lg:hidden flex items-center justify-center w-11 h-11 rounded-lg cursor-pointer text-deep-forest hover:bg-gray-100 transition-colors relative z-10"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          whileTap={{ scale: 0.9 }}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          <AnimatePresence mode="wait">
            {isMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CloseIcon fontSize="large" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MenuIcon fontSize="large" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm"
              style={{ top: isScrolled ? '64px' : '76px' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Mobile Menu */}
            <motion.div
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
              className="lg:hidden fixed left-0 right-0 bg-white shadow-[0_20px_50px_rgba(18,6,30,0.2)] border-b border-gray-200"
              style={{ top: isScrolled ? '64px' : '76px' }}
              initial={{ y: '-100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex flex-col p-6 space-y-2 max-h-[calc(100vh-76px)] overflow-y-auto">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    aria-label={link.ariaLabel}
                    aria-current={activeLink === link.href.replace('#', '') ? 'page' : undefined}
                    className={`px-6 py-4 rounded-xl font-medium text-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary-green/40 ${
                      activeLink === link.href.replace('#', '')
                        ? 'text-white bg-deep-forest shadow-[0_2px_12px_rgba(18,6,30,0.2)]'
                        : 'text-gray-700 hover:text-deep-forest hover:bg-gray-100'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {link.label}
                  </motion.a>
                ))}

                {/* Mobile CTA Button */}
                <motion.a
                  href="#contact"
                  onClick={(e) => handleLinkClick(e, '#contact')}
                  className="mt-4 px-6 py-4 bg-primary-green hover:bg-primary-green/90 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 shadow-[0_2px_12px_rgba(224,112,48,0.25)] transition-all focus:outline-none focus:ring-2 focus:ring-primary-green/40"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navLinks.length * 0.08 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label="Get early access to Sentinelr"
                >
                  <RocketLaunchIcon />
                  Get Early Access
                </motion.a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
