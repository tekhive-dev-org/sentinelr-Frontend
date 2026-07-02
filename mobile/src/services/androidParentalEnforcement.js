import { Platform } from 'react-native';
import NativeParentalControls from '../../modules/sentinelr-parental-controls';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function blockedPackagesFromControls(controls) {
  const explicit = Array.isArray(controls?.appBlocking?.blockedApps)
    ? controls.appBlocking.blockedApps
    : [];
  const overrides = Array.isArray(controls?.appBlocking?.appOverrides)
    ? controls.appBlocking.appOverrides
        .filter((item) => item?.isBlocked && item?.packageName)
        .map((item) => item.packageName)
    : [];

  return [...new Set([...explicit, ...overrides].filter(Boolean))];
}

function toNativePayload(controls) {
  const screenTime = controls?.screenTimeLimit;
  const dailyLimit = Number(screenTime?.dailyLimit ?? 0);
  const usedToday = Number(screenTime?.usedToday ?? 0);
  const remaining = Number(screenTime?.remaining ?? dailyLimit - usedToday);

  return {
    monitoringEnabled: !!controls?.isMonitoring,
    quickPauseEnabled: !!controls?.quickPause?.isDeviceFrozen,
    bedtimeEnabled: !!controls?.bedtime?.enabled,
    bedtimeStart: controls?.bedtime?.startTime ?? null,
    bedtimeEnd: controls?.bedtime?.endTime ?? null,
    screenTimeExpired: !!screenTime?.enabled && (remaining <= 0 || (dailyLimit > 0 && usedToday >= dailyLimit)),
    blockedPackages: blockedPackagesFromControls(controls),
    syncedAt: Date.now(),
  };
}

// ─── Cross-platform: is native module available at all? ─────────────────────
// NOTE: iOS enforcement is disabled until Apple grants the Family Controls
// distribution entitlement (com.apple.developer.family-controls). The feature
// is hidden on iOS and all enforcement calls are no-ops there.

const IOS_ENFORCEMENT_ENABLED = false;

export function isNativeEnforcementAvailable() {
  if (Platform.OS === 'ios' && !IOS_ENFORCEMENT_ENABLED) return false;
  return NativeParentalControls.isNativeModuleAvailable();
}

// ─── Permission status ───────────────────────────────────────────────────────

export function isEnforcementPermissionGranted() {
  if (Platform.OS === 'android') {
    return NativeParentalControls.isAccessibilityServiceEnabled?.() ?? false;
  }
  if (Platform.OS === 'ios' && IOS_ENFORCEMENT_ENABLED) {
    return NativeParentalControls.isFamilyControlsAuthorized?.() ?? false;
  }
  return false;
}

// ─── Request permission ──────────────────────────────────────────────────────

export function requestEnforcementPermission() {
  if (Platform.OS === 'ios' && IOS_ENFORCEMENT_ENABLED) {
    NativeParentalControls.requestFamilyControlsAuthorization?.();
  }
  // Android: user must enable Accessibility Service manually via system settings.
  // The openEnforcementSettings() function directs them there.
}

export function openEnforcementSettings() {
  if (Platform.OS === 'android') {
    return NativeParentalControls.openAccessibilitySettings?.() ?? false;
  }
  if (Platform.OS === 'ios' && IOS_ENFORCEMENT_ENABLED) {
    NativeParentalControls.openFamilyControlsSettings?.();
    return true;
  }
  return false;
}

// ─── Apply / Clear controls ─────────────────────────────────────────────────

export async function applyNativeControls(controls) {
  if (!isNativeEnforcementAvailable()) return false;
  return NativeParentalControls.applyControls(toNativePayload(controls));
}

export async function clearNativeControls() {
  if (!isNativeEnforcementAvailable()) return false;
  return NativeParentalControls.clearControls();
}

// ─── Get enforcement state ───────────────────────────────────────────────────

export function getNativeEnforcementState() {
  if (!isNativeEnforcementAvailable()) {
    return {
      monitoringEnabled: false,
      quickPauseEnabled: false,
      bedtimeActive: false,
      screenTimeExpired: false,
      blockedPackagesCount: 0,
      syncedAt: 0,
      ...(Platform.OS === 'android' ? { accessibilityEnabled: false } : {}),
      ...(Platform.OS === 'ios' ? { familyControlsAuthorized: false } : {}),
    };
  }
  return NativeParentalControls.getEnforcementState();
}

// ─── Backward-compatible Android aliases ─────────────────────────────────────

export const isAndroidParentalEnforcementAvailable = () =>
  Platform.OS === 'android' && isNativeEnforcementAvailable();

export const isAndroidAccessibilityEnabled = () =>
  Platform.OS === 'android' && isEnforcementPermissionGranted();

export const openAndroidAccessibilitySettings = () =>
  Platform.OS === 'android' ? openEnforcementSettings() : false;

export async function applyAndroidParentalControls(controls) {
  if (Platform.OS !== 'android') return false;
  return applyNativeControls(controls);
}

export async function clearAndroidParentalControls() {
  if (Platform.OS !== 'android') return false;
  return clearNativeControls();
}

export function getAndroidParentalEnforcementState() {
  if (Platform.OS !== 'android') {
    return {
      accessibilityEnabled: false,
      monitoringEnabled: false,
      quickPauseEnabled: false,
      bedtimeActive: false,
      screenTimeExpired: false,
      blockedPackagesCount: 0,
      syncedAt: 0,
    };
  }
  return getNativeEnforcementState();
}

