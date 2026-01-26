import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import styles from './PairDevice.module.css';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import TabletIcon from '@mui/icons-material/Tablet';
import LaptopIcon from '@mui/icons-material/Laptop';
import WatchIcon from '@mui/icons-material/Watch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import devicesService from '../../../../services/devicesService';

// Pairing flow steps
const STEPS = {
  FORM: 'form',
  CODE: 'code',
  QR: 'qr',
  CONNECTING: 'connecting',
  SUCCESS: 'success',
  TIMEOUT: 'timeout',
  EXPIRED: 'expired',
};

// Device types
const deviceTypes = [
  { id: 'phone', label: 'Smartphone', icon: SmartphoneIcon },
  { id: 'tablet', label: 'Tablet', icon: TabletIcon },
  { id: 'laptop', label: 'Laptop', icon: LaptopIcon },
  { id: 'watch', label: 'Smartwatch', icon: WatchIcon },
];

// Generate a random 6-digit pairing code
const generateCode = () => {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');
};

export default function PairDevice({ onComplete, onCancel, onViewDevices }) {
  const [step, setStep] = useState(STEPS.FORM);
  const [pairingCode, setPairingCode] = useState(generateCode());
  const [timeRemaining, setTimeRemaining] = useState(240); // 4 minutes in seconds
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Device form state
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('phone');
  const [assignedUser, setAssignedUser] = useState('');

  // Timer countdown
  useEffect(() => {
    if (step !== STEPS.CODE && step !== STEPS.QR) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStep(STEPS.EXPIRED);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Copy code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(pairingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Refresh/regenerate code
  const handleRefreshCode = () => {
    setPairingCode(generateCode());
    setTimeRemaining(240);
    setCopied(false);
  };

  // Handle form submit - proceed to pairing code
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!deviceName.trim()) return;
    handleRefreshCode();
    setStep(STEPS.CODE);
  };

  // Start pairing simulation
  const startPairing = useCallback(() => {
    setStep(STEPS.CONNECTING);
    setProgress(0);

    // Simulate connection progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Simulate success (in real app, this would be based on actual pairing result)
          setTimeout(() => {
            // For demo: randomly succeed or timeout
            const success = Math.random() > 0.3;
            setStep(success ? STEPS.SUCCESS : STEPS.TIMEOUT);
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 200);

    // Timeout after 30 seconds if not connected
    setTimeout(() => {
      if (progress < 100) {
        clearInterval(progressInterval);
        setStep(STEPS.TIMEOUT);
      }
    }, 30000);
  }, [progress]);

  // Handle try again from timeout
  const handleTryAgain = () => {
    setStep(STEPS.CODE);
    handleRefreshCode();
  };

  // Generate new code from expired
  const handleGenerateNewCode = () => {
    handleRefreshCode();
    setStep(STEPS.CODE);
  };

  // Render device form step
  const renderFormStep = () => (
    <div className={styles.pairingCard}>
      <h2 className={styles.cardTitle}>Add New Device</h2>
      <p className={styles.cardDescription}>
        Enter the device details to start the pairing process.
      </p>

      <form onSubmit={handleFormSubmit}>
        {/* Device Name */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Device Name</label>
          <input
            type="text"
            className={styles.formInput}
            placeholder="e.g., John's iPhone"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            required
          />
        </div>

        {/* Device Type */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Device Type</label>
          <div className={styles.deviceTypeGrid}>
            {deviceTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = deviceType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  className={`${styles.deviceTypeBtn} ${isSelected ? styles.deviceTypeBtnActive : ''}`}
                  onClick={() => setDeviceType(type.id)}
                  disabled={type.id === "tablet" || type.id === "laptop" || type.id === "watch"}
                >
                  <Icon style={{ fontSize: 24 }} />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Assign to User (Optional) */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Assign User</label>
          <select
            className={styles.formSelect}
            value={assignedUser}
            onChange={(e) => setAssignedUser(e.target.value)}
          >
            <option value="">Select a user...</option>
            <option value="user1">John Doe</option>
            <option value="user2">Jane Doe</option>
            <option value="user3">Child 1</option>
          </select>
        </div>

        <div className={styles.formActions}>
          <button type="button" className={styles.secondaryButton} onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className={styles.primaryButton}>
            + Pair device
          </button>
        </div>
      </form>
    </div>
  );

  // Render pairing code step
  const renderCodeStep = () => (
    <div className={styles.pairingCard}>
      <h2 className={styles.cardTitle}>Your Pairing Code</h2>
      <p className={styles.cardDescription}>
        Enter this code on your other device to securely pair your devices.
      </p>

      <div className={styles.codeContainer}>
        {pairingCode.split('').map((digit, index) => (
          <div key={index} className={styles.codeDigit}>
            {digit}
          </div>
        ))}
      </div>

      <div className={styles.codeActions}>
        <button className={styles.refreshLink} onClick={handleRefreshCode}>
          Refresh code
        </button>
        <span className={styles.expiryText}>
          Code expires in <strong>{formatTime(timeRemaining)}</strong>
        </span>
      </div>

      <button className={styles.copyButton} onClick={handleCopyCode}>
        <ContentCopyIcon style={{ fontSize: 18 }} />
        {copied ? 'Copied!' : 'Copy to clipboard'}
      </button>

      <div className={styles.divider}>
        <span>OR</span>
      </div>

      <button className={styles.qrButton} onClick={() => setStep(STEPS.QR)}>
        <QrCode2Icon style={{ fontSize: 20 }} />
        Scan QR Code
      </button>
    </div>
  );

  // Render QR code step
  const renderQRStep = () => {
    // Generate QR data URL that mobile app can scan
    const qrData = `sentinelr://pair?code=${pairingCode}&name=${encodeURIComponent(deviceName || 'Device')}`;
    
    return (
      <div className={styles.pairingCard}>
        <h2 className={styles.cardTitle}>Scan QR Code</h2>
        <p className={styles.cardDescription}>
          Ensure to scan this QR in app to pair device.
        </p>

        <div className={styles.qrCodeContainer}>
          <QRCodeSVG 
            value={qrData}
            size={200}
            level="H"
            includeMargin={true}
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </div>

        <button 
          className={styles.backLink} 
          onClick={() => setStep(STEPS.CODE)}
        >
          ← Back to pairing code
        </button>
      </div>
    );
  };

  // Render connecting step
  const renderConnectingStep = () => (
    <div className={styles.connectingContainer}>
      <div className={styles.deviceIconLarge}>
        <div className={styles.deviceIconRing}>
          <SmartphoneIcon style={{ fontSize: 40, color: '#1F2937' }} />
        </div>
        <div className={styles.signalWaves}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div className={styles.pairingCard}>
        <div className={styles.connectingIcon}>
          <div className={styles.spinner}></div>
        </div>
        
        <h2 className={styles.cardTitle}>
          Connecting to <span className={styles.deviceNameHighlight}>{deviceName}</span>...
        </h2>
        <p className={styles.cardDescription}>
          Please, keep your device close and the app open.
        </p>

        <div className={styles.progressContainer}>
          <div className={styles.progressHeader}>
            <span>Searching for signal...</span>
            <span>{progress}%</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <button 
          className={styles.cancelButton} 
          onClick={() => setStep(STEPS.TIMEOUT)}
        >
          Cancel Pairing
        </button>

        <button 
          className={styles.regenerateButton} 
          onClick={handleRefreshCode}
        >
          Regenerate Code
        </button>
      </div>
    </div>
  );

  // Render success step
  const renderSuccessStep = () => (
    <div className={styles.successContainer}>
      {/* Success Icon */}
      <div className={styles.successIconLarge}>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 32, height: 32 }}>
          <path d="M9 12L11 14L15 10" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 3L13.4 5.65L16.4 5.9L14.4 8L15 11L12 9.5L9 11L9.6 8L7.6 5.9L10.6 5.65L12 3Z" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <h2 className={styles.successTitle}>Pairing Successful</h2>
      <p className={styles.successDescription}>
        You have successfully paired {deviceName || 'your device'}. You are now synced and ready to use.
      </p>

      {/* Device Connection Card */}
      <div className={styles.deviceConnectionCard}>
        {/* Connection Illustration */}
        <div className={styles.connectionIllustration}>
          {/* Laptop Icon */}
          <div className={styles.laptopIcon}>
            <svg viewBox="0 0 48 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="40" height="26" rx="2" stroke="#374151" strokeWidth="2" fill="none"/>
              <rect x="8" y="8" width="32" height="18" fill="#E5E7EB"/>
              <path d="M0 32H48L44 38H4L0 32Z" fill="#374151"/>
            </svg>
          </div>

          {/* Connection Line */}
          <div className={styles.connectionLine}>
            <div className={styles.connectionDot}></div>
          </div>

          {/* Phone Icon */}
          <div className={styles.phoneIcon}>
            <svg viewBox="0 0 24 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="22" height="38" rx="3" stroke="#374151" strokeWidth="2" fill="none"/>
              <circle cx="12" cy="35" r="2" fill="#374151"/>
            </svg>
          </div>
        </div>

        {/* Device Info */}
        <div className={styles.pairedDeviceInfo}>
          <div className={styles.pairedDeviceDetails}>
            <div className={styles.deviceLabel}>
              <span className={styles.deviceTypeDot}></span>
              Mobile
            </div>
            <div className={styles.deviceNameBold}>{deviceName || 'Device'} <span className={styles.deviceUserTag}>(Child phone)</span></div>
            <div className={styles.deviceStatusText}>Online • Active now</div>
          </div>
          <div className={styles.deviceThumbnail}>
            <SmartphoneIcon style={{ fontSize: 40, color: '#6B7280' }} />
          </div>
        </div>

        <button className={styles.disconnectBtn}>
          Disconnect
        </button>
      </div>

      {/* Action Buttons */}
      <div className={styles.successActions}>
        <button 
          className={styles.primaryButton} 
          onClick={onViewDevices}
        >
          View Device
        </button>

        <button 
          className={styles.secondaryButton} 
          onClick={() => {
            setDeviceName('');
            setDeviceType('phone');
            setAssignedUser('');
            handleRefreshCode();
            setStep(STEPS.FORM);
          }}
        >
          Add Another Device
        </button>
      </div>
    </div>
  );

  // Render timeout step
  const renderTimeoutStep = () => (
    <div className={styles.pairingCard}>
      <div className={styles.timeoutIcon}>
        <WifiOffIcon style={{ fontSize: 36, color: '#F59E0B' }} />
      </div>
      
      <h2 className={styles.cardTitle}>Pairing Timed Out</h2>
      <p className={styles.cardDescription}>
        The connection took longer than expected. Please, ensure that both devices are nearby and connected to the internet
      </p>

      <button className={styles.primaryButton} onClick={handleTryAgain}>
        Try Again
      </button>
    </div>
  );

  // Render expired step
  const renderExpiredStep = () => (
    <div className={styles.pairingCard}>
      <div className={styles.expiredIcon}>
        <ErrorOutlineIcon style={{ fontSize: 36, color: '#EF4444' }} />
      </div>
      
      <h2 className={styles.cardTitle}>Code Expired</h2>
      <p className={styles.cardDescription}>
        For your security, pairing codes expire after 10 minutes. Please, generate a new code to continue.
      </p>

      <button className={styles.primaryButton} onClick={handleGenerateNewCode}>
        Generate New Code
      </button>

      <button className={styles.secondaryButton} onClick={onCancel}>
        Cancel
      </button>
    </div>
  );

  // Render current step
  const renderStep = () => {
    switch (step) {
      case STEPS.FORM:
        return renderFormStep();
      case STEPS.CODE:
        return renderCodeStep();
      case STEPS.QR:
        return renderQRStep();
      case STEPS.CONNECTING:
        return renderConnectingStep();
      case STEPS.SUCCESS:
        return renderSuccessStep();
      case STEPS.TIMEOUT:
        return renderTimeoutStep();
      case STEPS.EXPIRED:
        return renderExpiredStep();
      default:
        return renderFormStep();
    }
  };

  // Step order for navigation
  const stepOrder = [STEPS.FORM, STEPS.CODE, STEPS.QR, STEPS.CONNECTING, STEPS.SUCCESS, STEPS.TIMEOUT, STEPS.EXPIRED];
  const currentIndex = stepOrder.indexOf(step);

  const goToPrevStep = () => {
    if (currentIndex > 0) {
      setStep(stepOrder[currentIndex - 1]);
    }
  };

  const goToNextStep = () => {
    if (currentIndex < stepOrder.length - 1) {
      setStep(stepOrder[currentIndex + 1]);
    }
  };

  // Navigation component
  const renderNav = () => (
    <div className={styles.navBar}>
      <button 
        className={styles.navBtn}
        onClick={goToPrevStep}
        disabled={currentIndex === 0}
      >
        ← Back
      </button>
      <button 
        className={styles.navBtn}
        onClick={goToNextStep}
        disabled={currentIndex === stepOrder.length - 1}
      >
        Next →
      </button>
    </div>
  );

  return (
    <div className={styles.container}>
      {renderNav()}
      {renderStep()}
    </div>
  );
}

