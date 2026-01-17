import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DeviceContext = createContext(null);

const STORAGE_KEYS = {
  DEVICE_ID: '@sentinelr/device_id',
  UPLOAD_TOKEN: '@sentinelr/upload_token',
  IS_PAIRED: '@sentinelr/is_paired',
};

export function DeviceProvider({ children }) {
  const [deviceId, setDeviceId] = useState(null);
  const [uploadToken, setUploadToken] = useState(null);
  const [isPaired, setIsPaired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [batteryLevel, setBatteryLevel] = useState(null);
  const [lastPingTime, setLastPingTime] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('offline');

  // Load saved state on mount
  useEffect(() => {
    loadSavedState();
  }, []);

  const loadSavedState = async () => {
    try {
      const [savedDeviceId, savedToken, savedPaired] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID),
        AsyncStorage.getItem(STORAGE_KEYS.UPLOAD_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.IS_PAIRED),
      ]);

      if (savedDeviceId) setDeviceId(savedDeviceId);
      if (savedToken) setUploadToken(savedToken);
      if (savedPaired === 'true') setIsPaired(true);
    } catch (error) {
      console.error('Error loading saved state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completePairing = async (newDeviceId, newToken) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, newDeviceId),
        AsyncStorage.setItem(STORAGE_KEYS.UPLOAD_TOKEN, newToken),
        AsyncStorage.setItem(STORAGE_KEYS.IS_PAIRED, 'true'),
      ]);

      setDeviceId(newDeviceId);
      setUploadToken(newToken);
      setIsPaired(true);
      
      console.log('[DeviceContext] Pairing completed:', newDeviceId);
    } catch (error) {
      console.error('Error saving pairing data:', error);
      throw error;
    }
  };

  const unpairDevice = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.DEVICE_ID),
        AsyncStorage.removeItem(STORAGE_KEYS.UPLOAD_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.IS_PAIRED),
      ]);

      setDeviceId(null);
      setUploadToken(null);
      setIsPaired(false);
      setIsTracking(false);
      setCurrentLocation(null);
      setBatteryLevel(null);
      setLastPingTime(null);
      setConnectionStatus('offline');
      
      console.log('[DeviceContext] Device unpaired');
    } catch (error) {
      console.error('Error unpairing device:', error);
      throw error;
    }
  };

  const toggleTracking = (value) => {
    setIsTracking(typeof value === 'boolean' ? value : !isTracking);
  };

  const updateLocation = (location) => {
    setCurrentLocation(location);
    setLastPingTime(new Date());
  };

  const updateBattery = (level) => {
    setBatteryLevel(level);
  };

  const updateConnectionStatus = (status) => {
    setConnectionStatus(status);
  };

  const value = {
    // Pairing state
    deviceId,
    uploadToken,
    isPaired,
    isLoading,
    
    // Tracking state
    isTracking,
    currentLocation,
    batteryLevel,
    lastPingTime,
    connectionStatus,
    
    // Actions
    completePairing,
    unpairDevice,
    toggleTracking,
    updateLocation,
    updateBattery,
    updateConnectionStatus,
  };

  return (
    <DeviceContext.Provider value={value}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevice must be used within DeviceProvider');
  }
  return context;
}
