import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useAuth } from '../../../context/AuthContext';
import styles from './VerificationCode.module.css';

export default function VerificationCode({ email = 'user@sentinelr.com' }) {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationState, setVerificationState] = useState('input'); // 'input', 'success', 'failed'
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    // Focus first input on mount
    if (verificationState === 'input') {
      inputRefs[0].current?.focus();
    }
  }, [verificationState]);

  const handleChange = (index, value) => {
    // Only allow single digit
    if (value.length > 1) return;
    
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 3) {
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
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split('').slice(0, 4);
    setCode([...newCode, ...Array(4 - newCode.length).fill('')]);
    
    // Focus last filled input
    const lastIndex = Math.min(newCode.length - 1, 3);
    inputRefs[lastIndex].current?.focus();
  };

  const { verifyEmail } = useAuth(); // Destructure verifyEmail from context
  
  const handleVerify = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 4) {
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

  const handleResend = async () => {
    setCode(['', '', '', '']);
    inputRefs[0].current?.focus();
    // Simulate resend API call
    console.log('Resending verification code...');
  };

  const handleReverify = () => {
    setVerificationState('input');
    setCode(['', '', '', '']);
    inputRefs[0].current?.focus();
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const isCodeComplete = code.every(digit => digit !== '');

  return (
    <div className={styles.container}>
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
