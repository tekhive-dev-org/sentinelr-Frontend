import 'dotenv/config';

export default {
  expo: {
    name: 'Sentinelr',
    slug: 'sentinelr-mobile',
    owner: 'techchive-llc',
    version: '1.1.2',
    orientation: 'default',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#000000',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.techhive.sentinelr',
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'Sentinelr needs access to your location to track device position for family safety.',
        NSLocationAlwaysAndWhenInUseUsageDescription:
          'Sentinelr needs continuous access to your location for real-time tracking and safety alerts.',
        UIBackgroundModes: ['location', 'fetch'],
      },
    },
    android: {
      package: 'com.techhive.sentinelr',
      // versionCode: 2,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#000000',
      },
      permissions: [
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'ACCESS_BACKGROUND_LOCATION',
        'FOREGROUND_SERVICE',
        'FOREGROUND_SERVICE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_BACKGROUND_LOCATION',
        'android.permission.FOREGROUND_SERVICE',
        'android.permission.FOREGROUND_SERVICE_LOCATION',
      ],
    },
    plugins: [
      './plugins/withLargeScreenSupport',
      [
        'expo-camera',
        {
          cameraPermission:
            'Allow Sentinelr to use your camera to scan QR codes when pairing a device.',
        },
      ],
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'Sentinelr needs continuous access to your location for real-time tracking and safety alerts.',
          locationAlwaysPermission:
            'Allow Sentinelr to access your location in the background for continuous tracking.',
          locationWhenInUsePermission:
            'Allow Sentinelr to access your location while using the app.',
          isAndroidBackgroundLocationEnabled: true,
          isAndroidForegroundServiceEnabled: true,
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#1a1a2e',
        },
      ],
    ],
    updates: {
      url: 'https://u.expo.dev/2542921c-4083-4d6d-83eb-1fbcfa79d891',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      apiBaseUrl: process.env.API_BASE_URL,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      eas: {
        projectId: '2542921c-4083-4d6d-83eb-1fbcfa79d891',
      },
    },
  },
};
