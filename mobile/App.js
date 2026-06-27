import React, { useState, useEffect, useCallback } from 'react';
import { View, Platform, Text, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_800ExtraBold,
  PlayfairDisplay_900Black,
} from '@expo-google-fonts/playfair-display';
import {
  SpaceGrotesk_300Light,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
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
import { FONT_FAMILIES } from './src/utils/typography';

// Screens
import LandingScreen from './src/screens/LandingScreen';
import PairingScreen from './src/screens/PairingScreen';
import QRScannerScreen from './src/screens/QRScannerScreen';
import PermissionsScreen from './src/screens/PermissionsScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SOSScreen from './src/screens/SOSScreen';
import ParentalControlScreen from './src/screens/ParentalControlScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import HelpCenterScreen from './src/screens/HelpCenterScreen';
import TermsOfServiceScreen from './src/screens/TermsOfServiceScreen';
import AboutSentinelrScreen from './src/screens/AboutSentinelrScreen';
import RateAppScreen from './src/screens/RateAppScreen';

// Prevent auto-hiding of native splash screen
SplashScreen.preventAutoHideAsync();

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.style = [
  { fontFamily: FONT_FAMILIES.body },
  Text.defaultProps.style,
];

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.style = [
  { fontFamily: FONT_FAMILIES.body },
  TextInput.defaultProps.style,
];

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
          fontFamily: FONT_FAMILIES.bodySemiBold,
          fontSize: 11,
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
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Pairing" component={PairingScreen} />
          <Stack.Screen name="QRScanner" component={QRScannerScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Permissions" component={PermissionsScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
          <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
          <Stack.Screen name="AboutSentinelr" component={AboutSentinelrScreen} />
          <Stack.Screen name="RateApp" component={RateAppScreen} />
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
        // Fire-and-forget: restore background services without blocking the splash screen.
        // These make network calls that can stall on app resume when the radio is waking up.
        locationService.ensureTrackingState().catch(() => {});
        geofencingService.ensureGeofencingState().catch(() => {});
        // Hide native splash screen immediately — don't wait for network
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
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_800ExtraBold,
    PlayfairDisplay_900Black,
    SpaceGrotesk_300Light,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

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
