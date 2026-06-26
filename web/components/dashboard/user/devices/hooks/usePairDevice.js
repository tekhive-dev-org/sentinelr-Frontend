import { useState, useEffect } from "react";
import { devicesService } from "../../../../../services/devicesService";

export const STEPS = {
  FORM: "form",
  CODE: "code",
  QR: "qr",
  CONNECTING: "connecting",
  SUCCESS: "success",
  TIMEOUT: "timeout",
  EXPIRED: "expired",
};

export const deviceTypes = [
  { id: "Phone", label: "Smartphone" },
  { id: "Tablet", label: "Tablet" },
  { id: "Laptop", label: "Laptop" },
  { id: "Watch", label: "Smartwatch" },
];

export function usePairDevice({
  onComplete,
  familyMembers = [],
  initialDevice = null,
}) {
  const [step, setStep] = useState(STEPS.FORM);
  const [pairingCode, setPairingCode] = useState("");
  const [qrCodeData, setQrCodeData] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [error, setError] = useState(null);

  // Device form state
  const [deviceName, setDeviceName] = useState("");
  const [deviceType, setDeviceType] = useState("Phone");
  const [smartphoneOS, setSmartphoneOS] = useState("ios");
  const [assignedUser, setAssignedUser] = useState("");

  useEffect(() => {
    if (!initialDevice) return;

    const nextDeviceType = initialDevice.type || "Phone";
    const nextPlatform = (initialDevice.platform || "").toLowerCase();
    const nextAssignedUser =
      initialDevice.assignedUserId ??
      initialDevice.userId ??
      initialDevice.memberUserId ??
      "";

    setDeviceName(initialDevice.deviceName || initialDevice.name || "");
    setDeviceType(nextDeviceType);
    setSmartphoneOS(nextPlatform === "android" ? "android" : "ios");
    setAssignedUser(nextAssignedUser ? String(nextAssignedUser) : "");
    setError(null);
  }, [initialDevice]);

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
      // Ensure platform uses Title Case for backend compatibility!
      const platformValue =
        deviceType === "Phone"
          ? smartphoneOS === "ios"
            ? "IOS"
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
    if (e && e.preventDefault) e.preventDefault();
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

  // Step navigation helper (for testing/custom needs if required)
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

  const resetForm = () => {
    setDeviceName("");
    setDeviceType("Phone");
    setSmartphoneOS("ios");
    setAssignedUser("");
  };

  return {
    step,
    setStep,
    pairingCode,
    qrCodeData,
    timeRemaining,
    copied,
    progress,
    isGeneratingCode,
    error,
    deviceName,
    setDeviceName,
    deviceType,
    setDeviceType,
    smartphoneOS,
    setSmartphoneOS,
    assignedUser,
    setAssignedUser,
    formatTime,
    handleCopyCode,
    handleRefreshCode,
    handleFormSubmit,
    handleTryAgain,
    handleGenerateNewCode,
    goToPrevStep,
    goToNextStep,
    currentIndex,
    stepOrder,
    resetForm,
  };
}
