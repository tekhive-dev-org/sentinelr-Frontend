import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useAuth } from '../../../context/AuthContext';
import Toast from '../../common/Toast';
import styles from './VerificationCode.module.css';

export default function VerificationCode({ email = '' }) {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']); // 6 digits
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationState, setVerificationState] = useState('input'); // 'input', 'success', 'failed'
  const [toast, setToast] = useState(null);
  
  // OTP expiry countdown - 10 minutes (600 seconds)
  const OTP_EXPIRY_SECONDS = 600;
  const [timeRemaining, setTimeRemaining] = useState(OTP_EXPIRY_SECONDS);
  const [isExpired, setIsExpired] = useState(false);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)]; // 6 refs

  useEffect(() => {
    // Focus first input on mount
    if (verificationState === 'input') {
      inputRefs[0].current?.focus();
    }
  }, [verificationState]);

  // Countdown timer effect
  useEffect(() => {
    if (verificationState !== 'input' || isExpired) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [verificationState, isExpired]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage for circular indicator
  const progressPercent = (timeRemaining / OTP_EXPIRY_SECONDS) * 100;
  
  // Determine urgency level
  const isUrgent = timeRemaining <= 60; // Last minute
  const isWarning = timeRemaining <= 180 && !isUrgent; // Last 3 minutes

  const handleChange = (index, value) => {
    // Only allow single digit
    if (value.length > 1) return;
    
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split('').slice(0, 6);
    setCode([...newCode, ...Array(6 - newCode.length).fill('')]);
    
    // Focus last filled input
    const lastIndex = Math.min(newCode.length - 1, 5);
    inputRefs[lastIndex].current?.focus();
  };

  const { verifyEmail, resendOTP, loading } = useAuth();
  
  const handleVerify = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      return;
    }

    setIsVerifying(true);
    
    try {
      const result = await verifyEmail(email, verificationCode);
      
      if (result.success) {
        setVerificationState('success');
        // Redirect to home or dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard'); // Changed to dashboard to match flow
        }, 2000);
      } else {
        setVerificationState('failed');
      }
    } catch (err) {
      setVerificationState('failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const [resending, setResending] = useState(false);
  
  const handleResend = async () => {
    if (!email || resending) return;
    
    setResending(true);
    setCode(['', '', '', '', '', '']);
    inputRefs[0].current?.focus();
    
    try {
      const result = await resendOTP(email);
      if (result.success) {
        setToast({ message: 'Verification code sent!', type: 'success' });
        // Reset timer on successful resend
        setTimeRemaining(OTP_EXPIRY_SECONDS);
        setIsExpired(false);
      } else {
        setToast({ message: result.error || 'Failed to resend code', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Failed to resend code', type: 'error' });
    } finally {
      setResending(false);
    }
  };

  const handleReverify = () => {
    setVerificationState('input');
    setCode(['', '', '', '', '', '']);
    inputRefs[0].current?.focus();
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const isCodeComplete = code.every(digit => digit !== '');

  return (
    <div className={styles.container}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/* Left Section (Lock Image) */}
      <div className={styles.leftSection}>
        <div className={styles.lockImageWrapper}>
          <Image 
            src="/assets/images/lock.svg" 
            alt="Security" 
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
      </div>

      {/* Right Section */}
      <div className={styles.rightSection}>
        <div className={styles.formContainer}>
          {/* Input State */}
          {verificationState === 'input' && (
            <>
              {/* Email Icon */}
              <div className={styles.iconWrapper}>
                <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <h1 className={styles.title}>Enter Verification Code</h1>
              <p className={styles.subtitle}>
                We've sent a code to <strong>{email}</strong>
              </p>

              {/* OTP Expiry Countdown Timer */}
              <div className={`${styles.timerContainer} ${isExpired ? styles.timerExpired : ''} ${isUrgent ? styles.timerUrgent : ''} ${isWarning ? styles.timerWarning : ''}`}>
                <div className={styles.timerCircle}>
                  <svg className={styles.timerSvg} viewBox="0 0 36 36">
                    {/* Background circle */}
                    <path
                      className={styles.timerBg}
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Progress circle */}
                    <path
                      className={styles.timerProgress}
                      strokeDasharray={`${progressPercent}, 100`}
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className={styles.timerIcon}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className={styles.timerInfo}>
                  <span className={styles.timerLabel}>
                    {isExpired ? 'Code expired' : 'Code expires in'}
                  </span>
                  <span className={styles.timerValue}>
                    {isExpired ? '00:00' : formatTime(timeRemaining)}
                  </span>
                </div>
              </div>

              {/* Code Input */}
              <div className={styles.codeInputs}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className={styles.codeInput}
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerify}
                disabled={!isCodeComplete || isVerifying}
                className={`${styles.verifyButton} ${
                  !isCodeComplete || isVerifying ? styles.verifyButtonDisabled : styles.verifyButtonEnabled
                }`}
              >
                {isVerifying ? 'Verifying...' : 'Verify'}
              </button>

              {/* Resend Link */}
              <div className={styles.resendContainer}>
                <p className={styles.resendText}>
                  Experiencing issues receiving the code?{' '}
                  <button onClick={handleResend} className={styles.resendLink}>
                    Resend code
                  </button>
                </p>
              </div>
            </>
          )}

          {/* Success State */}
          {verificationState === 'success' && (
            <>
              <div className={styles.iconWrapper}>
                <div className={styles.successIconCircle}>
                  <svg className={styles.successIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <h1 className={styles.successTitle}>Verification Successful!</h1>
              <p className={styles.successSubtitle}>
                Congratulations! Your SENTINELR account is successfully verified.
              </p>

              <button onClick={handleBackToHome} className={styles.homeButton}>
                Back to Home
              </button>
            </>
          )}

          {/* Failed State */}
          {verificationState === 'failed' && (
            <>
              <div className={styles.iconWrapper}>
                <div className={styles.failedIconCircle}>
                  <svg className={styles.failedIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>

              <h1 className={styles.failedTitle}>Verification Failed!</h1>
              <p className={styles.failedSubtitle}>
                Sorry! Your SENTINELR account verification failed.
              </p>

              <button onClick={handleReverify} className={styles.reverifyButton}>
                Reverify
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
