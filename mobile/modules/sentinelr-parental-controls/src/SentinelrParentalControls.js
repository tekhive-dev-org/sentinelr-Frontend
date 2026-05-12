let nativeModule = null;

try {
  const { requireNativeModule } = require('expo-modules-core');
  nativeModule = requireNativeModule('SentinelrParentalControls');
} catch {
  nativeModule = null;
}

export function isNativeModuleAvailable() {
  return !!nativeModule;
}

export function isAccessibilityServiceEnabled() {
  return nativeModule?.isAccessibilityServiceEnabled?.() ?? false;
}

export function openAccessibilitySettings() {
  return nativeModule?.openAccessibilitySettings?.() ?? false;
}

export function applyControls(payload) {
  return nativeModule?.applyControls?.(payload) ?? false;
}

export function clearControls() {
  return nativeModule?.clearControls?.() ?? false;
}

export function getEnforcementState() {
  return nativeModule?.getEnforcementState?.() ?? {
    accessibilityEnabled: false,
    monitoringEnabled: false,
    quickPauseEnabled: false,
    bedtimeActive: false,
    screenTimeExpired: false,
    blockedPackagesCount: 0,
    syncedAt: 0,
  };
}

export default {
  isNativeModuleAvailable,
  isAccessibilityServiceEnabled,
  openAccessibilitySettings,
  applyControls,
  clearControls,
  getEnforcementState,
};
