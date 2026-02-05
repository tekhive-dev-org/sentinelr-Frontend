import Constants from 'expo-constants';

// API Configuration - loaded from environment via app.config.js
export const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl;

// API Endpoints
export const ENDPOINTS = {
  PAIR_DEVICE: '/device/pair',
  UPLOAD_PING: '/device/ping',
  HEARTBEAT: '/device/heartbeat',
};

// App Constants
export const APP_NAME = 'Sentinelr';
export const PAIRING_CODE_LENGTH = 6;

// Location Settings
export const LOCATION_CONFIG = {
  accuracy: 'high',
  distanceInterval: 10, // meters
  timeInterval: 30000, // 30 seconds
};

// Storage Keys
export const STORAGE_KEYS = {
  DEVICE_ID: '@sentinelr/device_id',
  UPLOAD_TOKEN: '@sentinelr/upload_token',
  IS_PAIRED: '@sentinelr/is_paired',
  TRACKING_ENABLED: '@sentinelr/tracking_enabled',
};

// Colors (matching Tailwind config)
export const COLORS = {
  primary: '#3e0d10',
  danger: '#db323f',
  warning: '#e6ad13',
  dark: '#000000',
  light: '#ffffff',
  gray: '#6b7280',
  grayLight: '#9ca3af',
  grayDark: '#374151',
};
