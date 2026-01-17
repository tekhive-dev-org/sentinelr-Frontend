import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Switch, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Battery from 'expo-battery';
import { useDevice } from '../context/DeviceContext';
import { useTheme } from '../context/ThemeContext';
import { locationService } from '../services/locationService';
import { heartbeatService } from '../services/heartbeatService';
import NavigationHeader from '../components/NavigationHeader';
import { APP_NAME } from '../utils/constants';

export default function TrackingScreen({ navigation }) {
  const { 
    deviceId, 
    isTracking, 
    toggleTracking,
    currentLocation,
    updateLocation,
    batteryLevel,
    updateBattery,
    lastPingTime,
    connectionStatus,
    updateConnectionStatus
  } = useDevice();
  const { colors } = useTheme();

  const [isOnline, setIsOnline] = useState(true);
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    initializeTracking();
    getBatteryLevel();

    const batterySubscription = Battery.addBatteryLevelListener(({ batteryLevel }) => {
      updateBattery(Math.round(batteryLevel * 100));
    });

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      batterySubscription.remove();
      appStateSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (isTracking) {
      startTracking();
    } else {
      stopTracking();
    }
  }, [isTracking]);

  const handleAppStateChange = (nextAppState) => {
    setAppState(nextAppState);
    console.log('[App State]', nextAppState);
  };

  const initializeTracking = async () => {
    try {
      const isRunning = await locationService.isRunning();
      if (isRunning && !isTracking) {
        toggleTracking(true);
      }
      
      const location = await locationService.getCurrentLocation();
      updateLocation(location);
    } catch (error) {
      console.error('Failed to initialize tracking:', error);
    }
  };

  const getBatteryLevel = async () => {
    const level = await Battery.getBatteryLevelAsync();
    updateBattery(Math.round(level * 100));
  };

  const startTracking = async () => {
    try {
      await locationService.start();
      heartbeatService.start();
      updateConnectionStatus('online');
      setIsOnline(true);
      console.log('[Tracking] Started');
    } catch (error) {
      console.error('[Tracking] Failed to start:', error);
      setIsOnline(false);
    }
  };

  const stopTracking = async () => {
    try {
      await locationService.stop();
      heartbeatService.stop();
      updateConnectionStatus('offline');
      console.log('[Tracking] Stopped');
    } catch (error) {
      console.error('[Tracking] Failed to stop:', error);
    }
  };

  const handleToggleTracking = () => {
    toggleTracking(!isTracking);
  };

  const formatTime = (date) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
  };

  const formatCoords = (location) => {
    if (!location) return 'Waiting...';
    return `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
  };

  const StatusCard = ({ icon, title, value, valueColor }) => (
    <View className="w-1/2 p-2">
      <View 
        className="rounded-2xl p-4 items-center min-h-[120px] border"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <View 
          className="w-11 h-11 rounded-full justify-center items-center mb-2.5"
          style={{ backgroundColor: colors.primary }}
        >
          <Ionicons name={icon} size={22} color={colors.warning} />
        </View>
        <Text 
          style={{ color: colors.textSecondary }}
          className="text-[11px] mb-1.5 uppercase tracking-wider font-semibold"
        >
          {title}
        </Text>
        <Text 
          style={{ color: valueColor || colors.text }}
          className="text-[13px] font-semibold text-center"
        >
          {value}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <NavigationHeader
        title={APP_NAME}
        subtitle="Security App"
        showMenu={true}
        navigation={navigation}
        currentScreen="Tracking"
      />

      {/* Connection Status */}
      <View 
        className="mx-5 mt-4 p-4 rounded-[14px] flex-row items-center justify-center border"
        style={{ 
          backgroundColor: isTracking ? 'rgba(34, 197, 94, 0.1)' : 'rgba(219, 50, 63, 0.1)',
          borderColor: isTracking ? 'rgba(34, 197, 94, 0.25)' : 'rgba(219, 50, 63, 0.25)'
        }}
      >
        <View className="relative mr-2.5">
          <View 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: isTracking ? colors.success : colors.danger }}
          />
          {isTracking && (
            <View 
              className="absolute w-3 h-3 rounded-full opacity-40"
              style={{ backgroundColor: colors.success }}
            />
          )}
        </View>
        <Text style={{ color: colors.text }} className="font-semibold text-[15px] tracking-wide">
          {isTracking ? 'Tracking Active' : 'Tracking Paused'}
        </Text>
      </View>

      {/* Status Cards Grid */}
      <View className="flex-row flex-wrap px-3 mt-4">
        <StatusCard
          icon="location"
          title="Location"
          value={formatCoords(currentLocation)}
          valueColor={currentLocation ? colors.text : colors.textMuted}
        />
        
        <StatusCard
          icon="battery-half"
          title="Battery"
          value={batteryLevel !== null ? `${batteryLevel}%` : '--'}
          valueColor={batteryLevel > 20 ? colors.success : colors.danger}
        />
        
        <StatusCard
          icon="time"
          title="Last Update"
          value={formatTime(lastPingTime)}
          valueColor={colors.warning}
        />
        
        <StatusCard
          icon="finger-print"
          title="Device"
          value={deviceId ? `...${deviceId.slice(-6)}` : 'Unknown'}
          valueColor={colors.warning}
        />
      </View>

      {/* Tracking Toggle Control */}
      <View 
        className="flex-row justify-between items-center mx-5 mt-4 p-5 rounded-2xl border"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <View className="flex-1 mr-4">
          <View className="flex-row items-center mb-1.5">
            <View 
              className="w-2.5 h-2.5 rounded-full mr-2"
              style={{ backgroundColor: isTracking ? colors.success : colors.textMuted }}
            />
            <Text style={{ color: colors.text }} className="text-lg font-bold">
              {isTracking ? 'Active' : 'Paused'}
            </Text>
          </View>
          <Text style={{ color: colors.textSecondary }} className="text-[13px] leading-[18px]">
            {isTracking 
              ? 'Location is being shared with your family' 
              : 'Tap to enable location sharing'}
          </Text>
        </View>
        <Switch
          value={isTracking}
          onValueChange={handleToggleTracking}
          trackColor={{ false: '#374151', true: 'rgba(219, 50, 63, 0.4)' }}
          thumbColor={isTracking ? colors.danger : colors.textMuted}
          ios_backgroundColor="#374151"
        />
      </View>

      {/* Background Mode Indicator */}
      {appState !== 'active' && isTracking && (
        <View 
          className="mx-5 mt-4 p-3.5 rounded-xl items-center border flex-row justify-center"
          style={{ 
            backgroundColor: 'rgba(230, 173, 19, 0.1)',
            borderColor: 'rgba(230, 173, 19, 0.25)'
          }}
        >
          <Ionicons name="phone-portrait-outline" size={16} color={colors.warning} />
          <Text style={{ color: colors.warning }} className="text-[13px] font-medium ml-2">
            Tracking continues in background
          </Text>
        </View>
      )}

      {/* Footer */}
      <View className="flex-1 justify-end items-center pb-6">
        <View className="flex-row items-center">
          <View 
            className="w-2 h-2 rounded-full mr-2"
            style={{ backgroundColor: isTracking ? colors.success : colors.textMuted }}
          />
          <Text style={{ color: colors.textMuted }} className="text-[13px]">
            {isTracking 
              ? 'Background tracking enabled' 
              : 'Enable tracking to share your location'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
