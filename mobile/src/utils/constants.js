import Constants from "expo-constants";

// API Configuration - loaded from environment via app.config.js
export const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl;

// API Endpoints
export const ENDPOINTS = {
  PAIR_DEVICE: "/device/pair",
  UPLOAD_PING: "/location/update",
  HEARTBEAT: "/device/heartbeat",
  UNPAIR_DEVICE: "/device/:id/unpair", // PATCH — changes pairStatus to Unpaired
  REMOVE_DEVICE: "/device/:id", // DELETE — hides device from dashboard
  SOS_TRIGGER: "/alerts/sos/trigger", // POST — sends SOS emergency alert
  INTRUDER_REPORT: "/alerts/intruder/report", // POST — report intruder attempt
  GEOFENCES: "/geofences", // GET — fetch all geofences for this device
  GEOFENCE_EVENT: "/geofences/event", // POST — report a geofence entry/exit event
};

// App Constants
export const APP_NAME = "Sentinelr";
export const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";
export const PAIRING_CODE_LENGTH = 9;

// Location Settings
export const LOCATION_CONFIG = {
  accuracy: "high",
  distanceInterval: 10, // meters
  timeInterval: 30000, // 30 seconds
};

// Storage Keys
export const STORAGE_KEYS = {
  DEVICE_ID: "@sentinelr/device_id",
  DEVICE_USER_ID: "@sentinelr/device_user_id",
  UPLOAD_TOKEN: "@sentinelr/upload_token",
  AUTH_TOKEN: "@sentinelr/auth_token",
  IS_PAIRED: "@sentinelr/is_paired",
  TRACKING_ENABLED: "@sentinelr/tracking_enabled",
};

// Colors (matching Tailwind config)
export const COLORS = {
  primary: "#e06f29",
  primaryHover: "#c95f20",
  secondary: "#3d09d0",
  secondaryHover: "#32109f",
  danger: "#dc323f",
  warning: "#e6ae12",
  success: "#e6ae12",
  dark: "#000000",
  light: "#ffffff",
  gray: "#6b7280",
  grayLight: "#9ca3af",
  grayDark: "#374151",
};
