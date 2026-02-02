import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import XIcon from '@mui/icons-material/X';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Anti-spam honeypot
  const [formLoadTime, setFormLoadTime] = useState(null); // Anti-spam timestamp
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'success' | 'error'
  const [message, setMessage] = useState('');

  // Set form load time on mount
  useEffect(() => {
    setFormLoadTime(Date.now());
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) return;

    setIsSubmitting(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(),
          honeypot, // Anti-spam: should be empty
          timestamp: formLoadTime, // Anti-spam: time check
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage('You\'re subscribed!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message || 'Something went wrong');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const revealProps = {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
    viewport: { once: true, amount: 0.2 },
  };

  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'How It Works', href: '#preview' },
        { label: 'About', href: '#about' },
      ],
    },
    {
      title: 'Get Started',
      links: [
        { label: 'Join Waitlist', href: '#contact' },
      ],
    },
  ];

  const socialLinks = [
    { icon: <XIcon className="text-lg" />, href: 'https://twitter.com/techhive', label: 'X (Twitter)' },
    { icon: <InstagramIcon className="text-lg" />, href: 'https://instagram.com/techhive', label: 'Instagram' },
    { icon: <LinkedInIcon className="text-lg" />, href: 'https://linkedin.com/company/techhive', label: 'LinkedIn' },

  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-100 pt-20 pb-8 px-5 md:px-10">
      <div className="max-w-[1200px] mx-auto">
        {/* Main Footer Content */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16"
          {...revealProps}
        >
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <img 
                src="/logo.png" 
                alt="Sentinelr Logo" 
                className="w-10 h-10 rounded-xl "
              />
              <span className="font-display text-2xl font-bold text-deep-forest">
                Sentinelr
              </span>
            </Link>
            
            <p className="font-body text-gray-600 leading-relaxed mb-6 max-w-[320px]">
              Take control of your safety. Because someone should always know where you are. 
              Protect yourself, your loved ones, and your devices.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-8">
              <a 
                href="mailto:tekhive.dev@gmail.com" 
                className="flex items-center gap-3 text-gray-600 hover:text-deep-forest transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-primary-green/10 transition-colors">
                  <EmailIcon className="text-sm" />
                </div>
                <span className="font-body text-sm">tekhive.dev@gmail.com</span>
              </a>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <LocationOnIcon className="text-sm" />
                </div>
                <span className="font-body text-sm">Lagos, Nigeria</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-2">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-primary-green hover:border-primary-green hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section, index) => (
            <div key={index} className="lg:col-span-2">
              <h4 className="font-display font-semibold text-deep-forest mb-5 text-sm uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="font-body text-gray-600 hover:text-primary-green transition-colors text-sm inline-flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowForwardIcon className="text-xs opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Column */}
          <div className="lg:col-span-2">
            <h4 className="font-display font-semibold text-deep-forest mb-5 text-sm uppercase tracking-wider">
              Stay Updated
            </h4>
            <p className="font-body text-gray-600 text-sm mb-4">
              Get the latest news and updates delivered to your inbox.
            </p>
            
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2 text-green-600 py-3"
                >
                  <CheckCircleIcon className="text-lg" />
                  <span className="font-body text-sm font-medium">{message}</span>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                  onSubmit={handleSubmit}
                >
                  {/* Honeypot field - hidden from users, bots will fill it */}
                  <input
                    type="text"
                    name="company"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0 }}
                    aria-hidden="true"
                  />
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === 'error') setStatus('idle');
                      }}
                      placeholder="Enter your email"
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3 bg-white border rounded-xl font-body text-sm text-deep-forest placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                        status === 'error' 
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-100' 
                          : 'border-gray-200 focus:border-primary-green focus:ring-primary-green/20'
                      }`}
                      aria-label="Email for newsletter"
                      aria-invalid={status === 'error'}
                    />
                    {status === 'error' && (
                      <ErrorOutlineIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-lg" />
                    )}
                  </div>
                  
                  {status === 'error' && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-xs font-body"
                    >
                      {message}
                    </motion.p>
                  )}
                  
                  <motion.button
                    type="submit"
                    disabled={!email.trim() || isSubmitting}
                    className="w-full px-4 py-3 bg-primary-green hover:bg-primary-green/90 text-white rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: !email.trim() || isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: !email.trim() || isSubmitting ? 1 : 0.98 }}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Subscribing...
                      </>
                    ) : (
                      <>
                        Subscribe
                        <ArrowForwardIcon className="text-sm" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-8" />

        {/* Footer Bottom */}
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-center gap-4"
          {...revealProps}
        >
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
            <p className="font-body text-gray-500 text-sm">
              © 2026 Sentinelr. All rights reserved.
            </p>
          </div>

          <p className="font-body text-gray-500 text-sm">
            Crafted with care by{' '}
            <a
              href="https://techhives.dev"
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="text-primary-green hover:text-primary-green/80 transition-colors font-medium"
            >
              TechHive
            </a>
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
