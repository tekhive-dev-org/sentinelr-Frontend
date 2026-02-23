import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import styles from "./PairDevice.module.css";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import TabletIcon from "@mui/icons-material/Tablet";
import LaptopIcon from "@mui/icons-material/Laptop";
import WatchIcon from "@mui/icons-material/Watch";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import { devicesService } from "../../../../services/devicesService";
import Image from "next/image";
import AppleIcon from "@mui/icons-material/Apple";
import AndroidIcon from "@mui/icons-material/Android";

// Pairing flow steps
const STEPS = {
  FORM: "form",
  CODE: "code",
  QR: "qr",
  CONNECTING: "connecting",
  SUCCESS: "success",
  TIMEOUT: "timeout",
  EXPIRED: "expired",
};

// Device types
const deviceTypes = [
  { id: "Phone", label: "Smartphone", icon: SmartphoneIcon },
  { id: "Tablet", label: "Tablet", icon: TabletIcon },
  { id: "Laptop", label: "Laptop", icon: LaptopIcon },
  { id: "Watch", label: "Smartwatch", icon: WatchIcon },
];

export default function PairDevice({
  onComplete,
  onCancel,
  onViewDevices,
  familyMembers = [],
}) {
  const [step, setStep] = useState(STEPS.FORM);
  const [pairingCode, setPairingCode] = useState("");
  const [qrCodeData, setQrCodeData] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(600); // 4 minutes in seconds
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [error, setError] = useState(null);

  // Device form state
  const [deviceName, setDeviceName] = useState("");
  const [deviceType, setDeviceType] = useState("Phone");
  const [smartphoneOS, setSmartphoneOS] = useState("ios");
  const [assignedUser, setAssignedUser] = useState("");

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

  // Polling for pairing status
  useEffect(() => {
    if ((step !== STEPS.CODE && step !== STEPS.QR) || !pairingCode) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await devicesService.checkCodeStatus(pairingCode);

        // Update UI based on pairing status
        if (response.success) {
          switch (response.pairStatus) {
            case "paired":
              clearInterval(pollInterval);
              // Show connecting briefly for better UX, then success
              setStep(STEPS.CONNECTING);
              setProgress(100);
              setTimeout(() => {
                setStep(STEPS.SUCCESS);
                if (onComplete) {
                  onComplete({
                    deviceName: deviceName || "Device",
                    status: "online",
                  });
                }
              }, 1500);
              break;
            case "expired":
              clearInterval(pollInterval);
              setStep(STEPS.EXPIRED);
              break;
            case "pending":
            default:
              // Keep waiting
              break;
          }
        }
      } catch (err) {
        // console.error("Error checking pairing status:", err);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [step, pairingCode, onComplete, deviceName]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Copy code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(pairingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Generate pairing code via API
  const generatePairingCode = async () => {
    setIsGeneratingCode(true);
    setError(null);

    try {
      // Ensure platform uses Title Case for backend compatibility
      const platformValue =
        deviceType === "Phone"
          ? smartphoneOS === "ios"
            ? "iOS"
            : "Android"
          : null;

      const result = await devicesService.generatePairingCode({
        memberUserId: assignedUser ? parseInt(assignedUser) : null,
        deviceName: deviceName,
        deviceType: deviceType,
        platform: platformValue,
      });

      setPairingCode(result.pairingCode);
      setQrCodeData(result.qrCode || "");
      setTimeRemaining(600);
      setCopied(false);
      return result;
    } catch (err) {
      console.error("Failed to generate pairing code:", err);
      let message =
        err.message || "Failed to generate pairing code. Please try again.";

      // Clean up error message
      if (message.includes("Member already has a paired device")) {
        message =
          "This member already has a paired device. Please unpair the existing device first or select another member.";
      } else if (message.startsWith("Error:")) {
        message = message.substring(6).trim();
      }

      setError(message);
      throw err;
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Refresh/regenerate code
  const handleRefreshCode = async () => {
    await generatePairingCode();
  };

  // Handle form submit - proceed to pairing code
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!deviceName.trim()) return;

    try {
      await generatePairingCode();
      setStep(STEPS.CODE);
    } catch (err) {
      // Error already handled in generatePairingCode
    }
  };

  // Handle try again from timeout
  const handleTryAgain = async () => {
    try {
      await generatePairingCode();
      setStep(STEPS.CODE);
    } catch (err) {
      // Error already handled
    }
  };

  // Generate new code from expired
  const handleGenerateNewCode = async () => {
    try {
      await generatePairingCode();
      setStep(STEPS.CODE);
    } catch (err) {
      // Error already handled
    }
  };

  // Render device form step
  const renderFormStep = () => (
    <div className={styles.pairingCard}>
      <h2 className={styles.cardTitle}>Add New Device</h2>
      <p className={styles.cardDescription}>
        Enter the device details to start the pairing process.
      </p>

      {error && (
        <div
          className={styles.errorMessage}
          style={{
            color: "#EF4444",
            backgroundColor: "#FEE2E2",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

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
            disabled={isGeneratingCode}
          />
        </div>

        {/* Device Type */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Device Type</label>
          <div className={styles.deviceTypeGrid}>
            {deviceTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = deviceType === type.id;
              const isDisabled =
                type.id === "Tablet" ||
                type.id === "Laptop" ||
                type.id === "Watch";
              return (
                <button
                  key={type.id}
                  type="button"
                  className={`${styles.deviceTypeBtn} ${isSelected ? styles.deviceTypeBtnActive : ""}`}
                  onClick={() => setDeviceType(type.id)}
                  disabled={isDisabled || isGeneratingCode}
                >
                  <Icon style={{ fontSize: 24 }} />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>

          {/* Smartphone OS Selection */}
          {deviceType === "Phone" && (
            <div
              style={{
                marginTop: "16px",
                padding: "16px",
                backgroundColor: "#F9FAFB",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
              }}
            >
              <label
                className={styles.formLabel}
                style={{ marginBottom: "12px", fontSize: "13px" }}
              >
                Select Mobile Operating System
              </label>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setSmartphoneOS("ios")}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "10px",
                    borderRadius: "6px",
                    border:
                      smartphoneOS === "ios"
                        ? "2px solid #1F2937"
                        : "1px solid #E5E7EB",
                    backgroundColor:
                      smartphoneOS === "ios" ? "#FFFFFF" : "#FFFFFF",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <AppleIcon
                    style={{
                      fontSize: 20,
                      color: smartphoneOS === "ios" ? "#000" : "#6B7280",
                    }}
                  />
                  <span
                    style={{
                      fontWeight: smartphoneOS === "ios" ? "600" : "400",
                      color: smartphoneOS === "ios" ? "#000" : "#6B7280",
                    }}
                  >
                    iOS
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSmartphoneOS("android")}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "10px",
                    borderRadius: "6px",
                    border:
                      smartphoneOS === "android"
                        ? "2px solid #1F2937"
                        : "1px solid #E5E7EB",
                    backgroundColor:
                      smartphoneOS === "android" ? "#FFFFFF" : "#FFFFFF",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <AndroidIcon
                    style={{
                      fontSize: 20,
                      color: smartphoneOS === "android" ? "#3DDC84" : "#6B7280",
                    }}
                  />
                  <span
                    style={{
                      fontWeight: smartphoneOS === "android" ? "600" : "400",
                      color: smartphoneOS === "android" ? "#000" : "#6B7280",
                    }}
                  >
                    Android
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Assign to Family Member */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Assign to Member</label>
          {familyMembers.length === 0 ? (
            <p className={styles.noChildrenText}>
              No family members yet. Please add a member first from the Users
              tab.
            </p>
          ) : (
            <select
              className={styles.formSelect}
              value={assignedUser}
              onChange={(e) => setAssignedUser(e.target.value)}
              disabled={isGeneratingCode}
              required
            >
              <option value="">Select a member...</option>
              {familyMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.role})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onCancel}
            disabled={isGeneratingCode}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={isGeneratingCode}
          >
            {isGeneratingCode ? "Generating..." : "+ Pair device"}
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

      {error && (
        <div
          className={styles.errorMessage}
          style={{
            color: "#EF4444",
            backgroundColor: "#FEE2E2",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      <div className={styles.codeContainer}>
        {pairingCode.split("").map((char, index) => (
          <div key={index} className={styles.codeDigit}>
            {char}
          </div>
        ))}
      </div>

      <div className={styles.codeActions}>
        <button
          className={styles.refreshLink}
          onClick={handleRefreshCode}
          disabled={isGeneratingCode}
        >
          {isGeneratingCode ? "Generating..." : "Refresh code"}
        </button>
        <span className={styles.expiryText}>
          Code expires in <strong>{formatTime(timeRemaining)}</strong>
        </span>
      </div>

      <button className={styles.copyButton} onClick={handleCopyCode}>
        <ContentCopyIcon style={{ fontSize: 18 }} />
        {copied ? "Copied!" : "Copy to clipboard"}
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
    // Use QR data from API or fallback to generated URL
    const qrData =
      qrCodeData ||
      `sentinelr://pair?code=${pairingCode}&name=${encodeURIComponent(deviceName || "Device")}`;

    return (
      <div className={styles.pairingCard}>
        <h2 className={styles.cardTitle}>Scan QR Code</h2>
        <p className={styles.cardDescription}>
          Ensure to scan this QR in app to pair device.
        </p>

        <div className={styles.qrCodeContainer}>
          {qrCodeData && qrCodeData.startsWith("data:image") ? (
            // If API returns a base64 image, display it directly
            <img
              src={qrCodeData}
              alt="Pairing QR Code"
              style={{ width: 200, height: 200 }}
            />
          ) : (
            // Otherwise generate QR from code
            <QRCodeSVG
              value={qrData}
              size={200}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          )}
        </div>

        <button className={styles.backLink} onClick={() => setStep(STEPS.CODE)}>
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
          <SmartphoneIcon style={{ fontSize: 40, color: "#1F2937" }} />
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
          Connecting to{" "}
          <span className={styles.deviceNameHighlight}>{deviceName}</span>...
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

        <button className={styles.regenerateButton} onClick={handleRefreshCode}>
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
        <Image
          src="/assets/icons/pair-success.png"
          alt="Pairing Successful"
          width={120}
          height={120}
          className={styles.emptyIllustration}
        />
      </div>

      <h2 className={styles.successTitle}>Pairing Successful</h2>
      <p className={styles.successDescription}>
        You have successfully paired {deviceName || "your device"}. You are now
        synced and ready to use.
      </p>

      {/* Device Connection Card */}
      <div className={styles.deviceConnectionCard}>
        {/* Connection Illustration */}
        <div className={styles.connectionIllustration}>
          {/* Laptop Icon */}
          <div className={styles.laptopIcon}>
            <svg
              viewBox="0 0 48 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="4"
                y="4"
                width="40"
                height="26"
                rx="2"
                stroke="#374151"
                strokeWidth="2"
                fill="none"
              />
              <rect x="8" y="8" width="32" height="18" fill="#E5E7EB" />
              <path d="M0 32H48L44 38H4L0 32Z" fill="#374151" />
            </svg>
          </div>

          {/* Connection Line */}
          <div className={styles.connectionLine}>
            <div className={styles.connectionDot}></div>
          </div>

          {/* Phone Icon */}
          <div className={styles.phoneIcon}>
            <svg
              viewBox="0 0 24 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="1"
                y="1"
                width="22"
                height="38"
                rx="3"
                stroke="#374151"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="12" cy="35" r="2" fill="#374151" />
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
            <div className={styles.deviceNameBold}>
              {deviceName || "Device"}{" "}
              <span className={styles.deviceUserTag}>
                (
                {familyMembers.find((m) => m.id == assignedUser)?.name ||
                  "Child"}
                's phone)
              </span>
            </div>
            <div className={styles.deviceStatusText}>Online • Active now</div>
          </div>
          <div className={styles.deviceThumbnail}>
            <Image
              src="/assets/icons/phone.png"
              alt="Pairing Successful"
              width={120}
              height={120}
            />
          </div>
        </div>

        <button className={styles.disconnectBtn}>Disconnect</button>
      </div>

      {/* Action Buttons */}
      <div className={styles.successActions}>
        <button className={styles.primaryButton} onClick={onViewDevices}>
          View Device
        </button>

        <button
          className={styles.secondaryButton}
          onClick={() => {
            setDeviceName("");
            setDeviceType("phone");
            setAssignedUser("");
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
        <WifiOffIcon style={{ fontSize: 36, color: "#F59E0B" }} />
      </div>

      <h2 className={styles.cardTitle}>Pairing Timed Out</h2>
      <p className={styles.cardDescription}>
        The connection took longer than expected. Please, ensure that both
        devices are nearby and connected to the internet
      </p>

      {error && (
        <div
          className={styles.errorMessage}
          style={{
            color: "#EF4444",
            backgroundColor: "#FEE2E2",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      <button className={styles.primaryButton} onClick={handleTryAgain}>
        Try Again
      </button>
    </div>
  );

  // Render expired step
  const renderExpiredStep = () => (
    <div className={styles.pairingCard}>
      <div className={styles.expiredIcon}>
        <ErrorOutlineIcon style={{ fontSize: 36, color: "#EF4444" }} />
      </div>

      <h2 className={styles.cardTitle}>Code Expired</h2>
      <p className={styles.cardDescription}>
        For your security, pairing codes expire after 10 minutes. Please,
        generate a new code to continue.
      </p>

      {error && (
        <div
          className={styles.errorMessage}
          style={{
            color: "#EF4444",
            backgroundColor: "#FEE2E2",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

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
  const stepOrder = [
    STEPS.FORM,
    STEPS.CODE,
    STEPS.QR,
    STEPS.CONNECTING,
    STEPS.SUCCESS,
    STEPS.TIMEOUT,
    STEPS.EXPIRED,
  ];
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
      {/* {renderNav()} */}
      {renderStep()}
    </div>
  );
}
