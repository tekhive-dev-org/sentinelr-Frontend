import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import GroupsIcon from '@mui/icons-material/Groups';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function Contact() {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Anti-spam honeypot
  const [formLoadTime, setFormLoadTime] = useState(null); // Anti-spam timestamp
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [touched, setTouched] = useState(false);

  // Set form load time on mount
  useEffect(() => {
    setFormLoadTime(Date.now());
  }, []);

  const revealProps = {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
    viewport: { once: true, amount: 0.2 },
  };

  // Email validation
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const isValidEmail = validateEmail(email);
  const showError = touched && email && !isValidEmail;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !isValidEmail) {
      setTouched(true);
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // API call to your backend/email service
      // Replace this with your actual API endpoint
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          honeypot, // Anti-spam: should be empty
          timestamp: formLoadTime, // Anti-spam: time check
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong. Please try again.');
      }

      setStatus('success');
      setEmail('');
      setTouched(false);
      
      // Store in localStorage to prevent duplicate signups
      localStorage.setItem('sentinelr_waitlist', 'true');
      
    } catch (error) {
      // For demo purposes, simulate success if API doesn't exist
      if (error.message.includes('fetch')) {
        // API doesn't exist yet - simulate success for demo
        setStatus('success');
        setEmail('');
        localStorage.setItem('sentinelr_waitlist', 'true');
      } else {
        setStatus('error');
        setErrorMessage(error.message || 'Failed to join waitlist. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setEmail('');
    setErrorMessage('');
    setTouched(false);
  };

  const benefits = [
    {
      icon: <RocketLaunchIcon className="text-xl" />,
      title: 'Early Access',
      desc: 'Be first to try new features',
    },
    {
      icon: <SecurityIcon className="text-xl" />,
      title: 'Founding Member Perks',
      desc: 'Exclusive lifetime benefits',
    },
    {
      icon: <SpeedIcon className="text-xl" />,
      title: 'Priority Support',
      desc: 'Direct access to our team',
    },
    {
      icon: <NotificationsActiveIcon className="text-xl" />,
      title: 'Launch Updates',
      desc: 'Stay informed on progress',
    },
  ];

  return (
    <section className="py-20 md:py-28 px-5 md:px-10 bg-white" id="contact">
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
            Join the Waitlist
          </motion.span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-deep-forest mb-6">
            Get early access to{' '}
            <span className="text-primary-green">Sentinelr</span>
          </h2>
          <p className="font-body text-base md:text-lg text-gray-600 max-w-[640px] mx-auto leading-relaxed">
            Be among the first to experience next-generation family safety. 
            Join our waitlist for exclusive early access and founding member benefits.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Subscription Card */}
          <motion.div 
            className="bg-gray-50 rounded-3xl p-8 md:p-10 border border-gray-100"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary-green text-white flex items-center justify-center shadow-[0_4px_12px_rgba(224,112,48,0.3)]">
                <EmailIcon className="text-2xl" />
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-deep-forest">
                Reserve Your Spot
              </h3>
            </div>
            
            <p className="font-body text-gray-600 leading-relaxed mb-8">
              Enter your email to join the waitlist. We'll notify you when Sentinelr is ready 
              and give you priority access before the public launch.
            </p>

            <AnimatePresence mode="wait">
              {status === 'idle' && (
                <motion.form 
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  noValidate
                >
                  <div className="space-y-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={() => setTouched(true)}
                          placeholder="Enter your email address"
                          autoComplete="email"
                          aria-label="Email address"
                          aria-invalid={showError}
                          aria-describedby={showError ? "email-error" : undefined}
                          className={`w-full px-5 py-4 bg-white border rounded-xl font-body text-deep-forest placeholder:text-gray-400 focus:outline-none transition-all ${
                            showError 
                              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                              : 'border-gray-200 focus:border-primary-green focus:ring-2 focus:ring-primary-green/20'
                          }`}
                        />
                        {email && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            {isValidEmail ? (
                              <CheckCircleIcon className="text-green-500 text-xl" />
                            ) : touched ? (
                              <ErrorOutlineIcon className="text-red-400 text-xl" />
                            ) : null}
                          </div>
                        )}
                      </div>
                      <motion.button
                        type="submit"
                        disabled={isSubmitting || !email}
                        className="px-8 py-4 bg-primary-green hover:bg-primary-green/90 text-white rounded-xl font-semibold transition-all duration-300 shadow-[0_4px_16px_rgba(224,112,48,0.25)] hover:shadow-[0_6px_20px_rgba(224,112,48,0.35)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-[0_4px_16px_rgba(224,112,48,0.25)] flex items-center justify-center gap-2 whitespace-nowrap min-w-[160px]"
                        whileHover={!isSubmitting && email ? { scale: 1.02 } : {}}
                        whileTap={!isSubmitting && email ? { scale: 0.98 } : {}}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <motion.span
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                            Joining...
                          </span>
                        ) : (
                          <>
                            Join Waitlist
                            <ArrowForwardIcon className="text-lg" />
                          </>
                        )}
                      </motion.button>
                    </div>

                    {/* Validation Error */}
                    <AnimatePresence>
                      {showError && (
                        <motion.p
                          id="email-error"
                          initial={{ opacity: 0, y: -10, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -10, height: 0 }}
                          className="text-red-500 text-sm font-body flex items-center gap-1.5"
                          role="alert"
                        >
                          <ErrorOutlineIcon className="text-base" />
                          Please enter a valid email address
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircleIcon className="text-primary-green text-base" />
                    <span className="font-body">No spam, ever. Unsubscribe anytime.</span>
                  </div>
                </motion.form>
              )}

              {status === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-2xl p-8 border border-green-200 text-center"
                >
                  <motion.div 
                    className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  >
                    <CheckCircleIcon className="text-green-500 text-3xl" />
                  </motion.div>
                  <h4 className="font-display text-xl font-bold text-deep-forest mb-2">
                    You're on the list! 🎉
                  </h4>
                  <p className="font-body text-gray-600 text-sm mb-4">
                    Thank you for joining! We'll notify you when Sentinelr is ready to launch.
                  </p>
                  <button
                    onClick={handleReset}
                    className="font-body text-sm text-primary-green hover:text-primary-green/80 transition-colors inline-flex items-center gap-1"
                  >
                    <RefreshIcon className="text-base" />
                    Sign up another email
                  </button>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-2xl p-8 border border-red-200 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <ErrorOutlineIcon className="text-red-500 text-3xl" />
                  </div>
                  <h4 className="font-display text-xl font-bold text-deep-forest mb-2">
                    Something went wrong
                  </h4>
                  <p className="font-body text-gray-600 text-sm mb-4">
                    {errorMessage || 'Unable to join the waitlist. Please try again.'}
                  </p>
                  <motion.button
                    onClick={handleReset}
                    className="px-6 py-3 bg-primary-green hover:bg-primary-green/90 text-white rounded-xl font-semibold text-sm transition-all inline-flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <RefreshIcon className="text-base" />
                    Try Again
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Benefits Card */}
          <motion.div 
            className="bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-deep-forest text-white flex items-center justify-center">
                <GroupsIcon className="text-2xl" />
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-deep-forest">
                Member Benefits
              </h3>
            </div>
            
            <p className="font-body text-gray-600 leading-relaxed mb-6">
              Early supporters get exclusive perks that won't be available after launch.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-green/30 hover:shadow-[0_4px_16px_rgba(224,112,48,0.1)] transition-all duration-300"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.08 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-green/10 text-primary-green flex items-center justify-center mb-3">
                    {benefit.icon}
                  </div>
                  <h4 className="font-display font-semibold text-deep-forest mb-1">
                    {benefit.title}
                  </h4>
                  <p className="font-body text-sm text-gray-500">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
