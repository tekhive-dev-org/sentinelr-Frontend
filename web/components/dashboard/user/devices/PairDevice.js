import React from "react";
import styles from "./PairDevice.module.css";
import { usePairDevice, STEPS } from "./hooks/usePairDevice";
import PairingFormStep from "./components/PairingFormStep";
import PairingCodeStep from "./components/PairingCodeStep";
import PairingQrStep from "./components/PairingQrStep";
import PairingConnectingStep from "./components/PairingConnectingStep";
import PairingSuccessStep from "./components/PairingSuccessStep";
import PairingTimeoutStep from "./components/PairingTimeoutStep";
import PairingExpiredStep from "./components/PairingExpiredStep";

export default function PairDevice({
  onComplete,
  onCancel,
  onViewDevices,
  familyMembers = [],
  initialDevice = null,
}) {
  const {
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
    resetForm,
  } = usePairDevice({
    onComplete,
    familyMembers,
    initialDevice,
  });

  const renderStep = () => {
    switch (step) {
      case STEPS.FORM:
        return (
          <PairingFormStep
            deviceName={deviceName}
            setDeviceName={setDeviceName}
            deviceType={deviceType}
            setDeviceType={setDeviceType}
            smartphoneOS={smartphoneOS}
            setSmartphoneOS={setSmartphoneOS}
            assignedUser={assignedUser}
            setAssignedUser={setAssignedUser}
            familyMembers={familyMembers}
            isGeneratingCode={isGeneratingCode}
            error={error}
            onSubmit={handleFormSubmit}
            onCancel={onCancel}
          />
        );
      case STEPS.CODE:
        return (
          <PairingCodeStep
            pairingCode={pairingCode}
            error={error}
            isGeneratingCode={isGeneratingCode}
            timeRemaining={timeRemaining}
            formatTime={formatTime}
            copied={copied}
            handleRefreshCode={handleRefreshCode}
            handleCopyCode={handleCopyCode}
            onScanQr={() => setStep(STEPS.QR)}
          />
        );
      case STEPS.QR:
        return (
          <PairingQrStep
            qrCodeData={qrCodeData}
            pairingCode={pairingCode}
            deviceName={deviceName}
            onBack={() => setStep(STEPS.CODE)}
          />
        );
      case STEPS.CONNECTING:
        return (
          <PairingConnectingStep
            deviceName={deviceName}
            progress={progress}
            onCancel={() => setStep(STEPS.TIMEOUT)}
            handleRefreshCode={handleRefreshCode}
          />
        );
      case STEPS.SUCCESS:
        return (
          <PairingSuccessStep
            deviceName={deviceName}
            assignedUser={assignedUser}
            familyMembers={familyMembers}
            onViewDevices={onViewDevices}
            onAddAnother={() => {
              resetForm();
              handleRefreshCode();
              setStep(STEPS.FORM);
            }}
          />
        );
      case STEPS.TIMEOUT:
        return (
          <PairingTimeoutStep
            error={error}
            onTryAgain={handleTryAgain}
            onCancel={onCancel}
          />
        );
      case STEPS.EXPIRED:
        return (
          <PairingExpiredStep
            error={error}
            onGenerateNewCode={handleGenerateNewCode}
            onCancel={onCancel}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      {renderStep()}
    </div>
  );
}

