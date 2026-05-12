import { Platform } from 'react-native';
import NativeParentalControls from '../../modules/sentinelr-parental-controls';

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

export function isAndroidParentalEnforcementAvailable() {
  return Platform.OS === 'android' && NativeParentalControls.isNativeModuleAvailable();
}

export async function applyAndroidParentalControls(controls) {
  if (!isAndroidParentalEnforcementAvailable()) {
    return false;
  }
  return NativeParentalControls.applyControls(toNativePayload(controls));
}

export async function clearAndroidParentalControls() {
  if (!isAndroidParentalEnforcementAvailable()) {
    return false;
  }
  return NativeParentalControls.clearControls();
}

export function isAndroidAccessibilityEnabled() {
  if (!isAndroidParentalEnforcementAvailable()) {
    return false;
  }
  return NativeParentalControls.isAccessibilityServiceEnabled();
}

export function openAndroidAccessibilitySettings() {
  if (!isAndroidParentalEnforcementAvailable()) {
    return false;
  }
  return NativeParentalControls.openAccessibilitySettings();
}

export function getAndroidParentalEnforcementState() {
  if (!isAndroidParentalEnforcementAvailable()) {
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
  return NativeParentalControls.getEnforcementState();
}
