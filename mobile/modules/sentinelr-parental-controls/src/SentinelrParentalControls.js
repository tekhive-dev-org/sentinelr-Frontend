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

// ─── Android: Accessibility Service ──────────────────────────────────────────

export function isAccessibilityServiceEnabled() {
  return nativeModule?.isAccessibilityServiceEnabled?.() ?? false;
}

export function openAccessibilitySettings() {
  return nativeModule?.openAccessibilitySettings?.() ?? false;
}

// ─── iOS: Family Controls ────────────────────────────────────────────────────

export function isFamilyControlsAuthorized() {
  return nativeModule?.isFamilyControlsAuthorized?.() ?? false;
}

export function requestFamilyControlsAuthorization() {
  return nativeModule?.requestFamilyControlsAuthorization?.();
}

export function openFamilyControlsSettings() {
  return nativeModule?.openFamilyControlsSettings?.();
}

// ─── Cross-platform: Apply / Clear / State ───────────────────────────────────

export function applyControls(payload) {
  return nativeModule?.applyControls?.(payload) ?? false;
}

export function clearControls() {
  return nativeModule?.clearControls?.() ?? false;
}

export function getEnforcementState() {
  return nativeModule?.getEnforcementState?.() ?? {
    // Fallback includes both Android and iOS keys
    accessibilityEnabled: false,
    familyControlsAuthorized: false,
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
  // Android
  isAccessibilityServiceEnabled,
  openAccessibilitySettings,
  // iOS
  isFamilyControlsAuthorized,
  requestFamilyControlsAuthorization,
  openFamilyControlsSettings,
  // Cross-platform
  applyControls,
  clearControls,
  getEnforcementState,
};
