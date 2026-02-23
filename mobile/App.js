import React, { useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { DeviceProvider, useDevice } from './src/context/DeviceContext';
import AnimatedSplash from './src/components/AnimatedSplash';
import { locationService } from './src/services/locationService';

// Screens
import PairingScreen from './src/screens/PairingScreen';
import QRScannerScreen from './src/screens/QRScannerScreen';
import PermissionsScreen from './src/screens/PermissionsScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Prevent auto-hiding of native splash screen
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

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
          <Stack.Screen name="Permissions" component={PermissionsScreen} />
          <Stack.Screen name="Tracking" component={TrackingScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
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
