import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { DeviceProvider, useDevice } from './src/context/DeviceContext';
import AnimatedSplash from './src/components/AnimatedSplash';
import { locationService } from './src/services/locationService';
import { geofencingService } from './src/services/geofencingService';

// Screens
import PairingScreen from './src/screens/PairingScreen';
import QRScannerScreen from './src/screens/QRScannerScreen';
import PermissionsScreen from './src/screens/PermissionsScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SOSScreen from './src/screens/SOSScreen';
import ParentalControlScreen from './src/screens/ParentalControlScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';

// Prevent auto-hiding of native splash screen
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 6,
          shadowColor: colors.neuDark,
          ...(Platform.OS === 'ios'
            ? { shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.3, shadowRadius: 8 }
            : { elevation: 8 }),
        },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={TrackingScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Permissions"
        component={PermissionsScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Controls"
        component={ParentalControlScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'shield' : 'shield-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="SOS"
        component={SOSScreen}
        options={{
          tabBarIcon: ({ size }) => (
            <View
              style={{
                backgroundColor: 'rgba(219, 50, 63, 0.15)',
                borderRadius: 20,
                padding: 2,
              }}
            >
              <Ionicons name="alert-circle" size={size} color={colors.danger} />
            </View>
          ),
          tabBarActiveTintColor: colors.danger,
          tabBarInactiveTintColor: colors.danger,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { isPaired, isLoading: deviceLoading } = useDevice();
  const { isLoading: themeLoading } = useTheme();

  if (deviceLoading || themeLoading) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {!isPaired ? (
        <>
          <Stack.Screen name="Pairing" component={PairingScreen} />
          <Stack.Screen name="QRScanner" component={QRScannerScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

function AppContent() {
  const { isDark, isLoading: themeLoading, colors } = useTheme();
  const { isLoading: deviceLoading } = useDevice();
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  // Hide native splash when contexts are loaded
  useEffect(() => {
    const prepare = async () => {
      if (!themeLoading && !deviceLoading) {
        await locationService.ensureTrackingState();
        await geofencingService.ensureGeofencingState();
        // Hide native splash screen
        await SplashScreen.hideAsync();
        setAppReady(true);
      }
    };
    prepare();
  }, [themeLoading, deviceLoading]);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  // Don't render anything until ready
  if (!appReady) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <NavigationContainer>
        <AppNavigator />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </NavigationContainer>
      
      {/* Animated Splash overlay */}
      {showSplash && (
        <AnimatedSplash onAnimationComplete={handleSplashComplete} />
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <DeviceProvider>
          <AppContent />
        </DeviceProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
