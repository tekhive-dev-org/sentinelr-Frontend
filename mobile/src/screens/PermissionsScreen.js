import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useDevice } from '../context/DeviceContext';
import { useTheme } from '../context/ThemeContext';
import NavigationHeader from '../components/NavigationHeader';
import { APP_NAME } from '../utils/constants';

export default function PermissionsScreen({ navigation }) {
  const { unpairDevice } = useDevice();
  const { colors } = useTheme();
  const [locationStatus, setLocationStatus] = useState('pending');
  const [notificationStatus, setNotificationStatus] = useState('pending');
  const [backgroundStatus, setBackgroundStatus] = useState('pending');

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const { status: foreground } = await Location.getForegroundPermissionsAsync();
      const { status: background } = await Location.getBackgroundPermissionsAsync();
      
      let notification = 'denied';
      try {
        const { status } = await Notifications.getPermissionsAsync();
        notification = status;
      } catch (e) {
        console.log('Notifications not supported (likely Expo Go)', e.message);
        notification = 'granted'; 
      }

      setLocationStatus(foreground === 'granted' ? 'granted' : 'denied');
      setBackgroundStatus(background === 'granted' ? 'granted' : 'denied');
      setNotificationStatus(notification === 'granted' ? 'granted' : 'denied');
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status: foreground } = await Location.requestForegroundPermissionsAsync();
      setLocationStatus(foreground === 'granted' ? 'granted' : 'denied');

      if (foreground !== 'granted') {
        Alert.alert(
          'Location Required',
          'Please enable location access to use tracking features.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Location permission error:', error);
      Alert.alert('Error', 'Failed to request location permission');
    }
  };

  const requestBackgroundLocationPermission = async () => {
    try {
      const { status: foreground } = await Location.getForegroundPermissionsAsync();
      
      if (foreground !== 'granted') {
        Alert.alert(
          'Enable Location First',
          'Please enable Location Access before requesting background location.',
          [{ text: 'OK' }]
        );
        return;
      }

      const { status: background } = await Location.requestBackgroundPermissionsAsync();
      setBackgroundStatus(background === 'granted' ? 'granted' : 'denied');

      if (background !== 'granted') {
        Alert.alert(
          'Background Location Required',
          'For continuous tracking, please enable "Allow all the time" in your device settings.\n\nGo to Settings > Apps > Sentinelr > Permissions > Location > Allow all the time',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
      }
    } catch (error) {
      console.error('Background location permission error:', error);
      Alert.alert(
        'Background Location',
        'Could not request background location permission. Please enable it manually in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() }
        ]
      );
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setNotificationStatus(status === 'granted' ? 'granted' : 'denied');
    } catch (error) {
      console.log('Notifications request failed:', error.message);
      setNotificationStatus('granted');
      if (!error.message.includes('Expo Go')) {
        Alert.alert('Notice', 'Notifications are limited in this environment');
      }
    }
  };

  const openSettingsToDisable = (permissionName) => {
    Alert.alert(
      `Disable ${permissionName}`,
      `To disable ${permissionName.toLowerCase()}, you need to go to your device settings.\n\nWould you like to open settings now?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Settings', 
          onPress: async () => {
            await Linking.openSettings();
            // Re-check permissions when user comes back
            setTimeout(checkPermissions, 1000);
          }
        }
      ]
    );
  };

  const handleGoBack = () => {
    Alert.alert(
      'Return to Pairing',
      'This will unpair your device and return you to the pairing screen. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unpair & Go Back',
          style: 'destructive',
          onPress: async () => {
            await unpairDevice();
          },
        },
      ]
    );
  };

  const canProceed = locationStatus === 'granted' && backgroundStatus === 'granted';

  const handleContinue = () => {
    if (canProceed) {
      navigation.replace('Tracking');
    } else {
      Alert.alert(
        'Permissions Required',
        'Location permissions are required for tracking. Please enable them to continue.',
        [{ text: 'OK' }]
      );
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'granted') return 'checkmark';
    if (status === 'denied') return 'alert';
    return 'ellipse';
  };

  const PermissionItem = ({ title, description, status, onEnable, onDisable }) => (
    <View 
      className="flex-row items-center rounded-2xl p-4 mb-3 border"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <View 
        className="w-10 h-10 rounded-full justify-center items-center mr-4"
        style={{ backgroundColor: colors.primary }}
      >
        <Ionicons 
          name={getStatusIcon(status)} 
          size={20} 
          color={colors.warning} 
        />
      </View>
      <View className="flex-1">
        <Text style={{ color: colors.text }} className="text-base font-semibold mb-1">{title}</Text>
        <Text style={{ color: colors.textSecondary }} className="text-xs">{description}</Text>
      </View>
      <TouchableOpacity
        className="px-4 py-2.5 rounded-xl min-w-[80px] items-center"
        style={{ backgroundColor: status === 'granted' ? colors.success : colors.danger }}
        onPress={status === 'granted' ? onDisable : onEnable}
        activeOpacity={0.7}
      >
        <Text className="text-light font-semibold text-sm">
          {status === 'granted' ? 'Disable' : 'Enable'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <NavigationHeader
        title="Permissions"
        subtitle="Required access for tracking"
        // onBack={handleGoBack}
        // backLabel="Pairing"
        showMenu={true}
        navigation={navigation}
        currentScreen="Permissions"
      />

      <View className="flex-1 px-5">
        {/* Hero Section */}
        <View className="items-center py-6">
          <View 
            className="w-[72px] h-[72px] rounded-full justify-center items-center mb-4 border-2"
            style={{ backgroundColor: colors.primary, borderColor: colors.danger }}
          >
            <Ionicons name="shield-checkmark" size={36} color={colors.warning} />
          </View>
          <Text style={{ color: colors.text }} className="text-2xl font-bold mb-2">Grant Access</Text>
          <Text style={{ color: colors.textSecondary }} className="text-sm text-center leading-5 px-5">
            {APP_NAME} needs these permissions to keep your device tracked and secure
          </Text>
        </View>

        {/* Permissions List */}
        <View className="mt-2">
          <PermissionItem
            title="Location Access"
            description="Required to track device location"
            status={locationStatus}
            onEnable={requestLocationPermission}
            onDisable={() => openSettingsToDisable('Location Access')}
          />

          <PermissionItem
            title="Background Location"
            description="Track location when app is closed"
            status={backgroundStatus}
            onEnable={requestBackgroundLocationPermission}
            onDisable={() => openSettingsToDisable('Background Location')}
          />

          <PermissionItem
            title="Notifications"
            description="Receive alerts and updates"
            status={notificationStatus}
            onEnable={requestNotificationPermission}
            onDisable={() => openSettingsToDisable('Notifications')}
          />
        </View>

        {/* Settings Link */}
        <TouchableOpacity 
          className="flex-row items-center justify-center py-4"
          onPress={() => Linking.openSettings()}
        >
          <Ionicons name="settings-outline" size={18} color={colors.warning} />
          <Text style={{ color: colors.warning }} className="text-sm font-medium ml-2">Open Device Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Footer CTA */}
      <View className="p-5 pb-2">
        <TouchableOpacity
          className="flex-row rounded-xl py-[18px] px-6 items-center justify-center"
          style={{ backgroundColor: canProceed ? colors.danger : colors.textMuted }}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text className="text-light text-base font-bold">
            {canProceed ? 'Start Tracking' : 'Enable Permissions to Continue'}
          </Text>
          {canProceed && (
            <Ionicons name="arrow-forward" size={20} color="#ffffff" style={{ marginLeft: 10 }} />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
