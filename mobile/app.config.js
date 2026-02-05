import 'dotenv/config';

export default {
  expo: {
    name: 'Sentinelr',
    slug: 'sentinelr-mobile',
    version: '1.0.0',
    orientation: 'portrait',
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
      bundleIdentifier: 'com.sentinelr.mobile',
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'Sentinelr needs access to your location to track device position for family safety.',
        NSLocationAlwaysAndWhenInUseUsageDescription:
          'Sentinelr needs continuous access to your location for real-time tracking and safety alerts.',
        UIBackgroundModes: ['location', 'fetch'],
      },
    },
    android: {
      package: 'com.sentinelr.mobile',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#000000',
      },
      edgeToEdgeEnabled: true,
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
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      apiBaseUrl: process.env.API_BASE_URL,
      eas: {
        projectId: '115f15f3-31c3-4815-8b68-864821bf83d9',
      },
    },
  },
};
