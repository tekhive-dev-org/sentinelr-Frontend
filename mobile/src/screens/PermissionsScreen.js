import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../context/ThemeContext';
import NavigationHeader from '../components/NavigationHeader';
import GlassCard from '../components/GlassCard';
import { APP_NAME } from '../utils/constants';

export default function PermissionsScreen({ navigation }) {
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





  const getStatusIcon = (status) => {
    if (status === 'granted') return 'checkmark-circle';
    if (status === 'denied') return 'alert-circle';
    return 'ellipse-outline';
  };

  const PermissionItem = ({ title, description, status, onEnable, onDisable }) => (
    <GlassCard style={{ marginBottom: 12 }}>
      <View style={permStyles.permRow}>
        <View
          style={[
            permStyles.permIcon,
            {
              backgroundColor:
                status === 'granted' ? colors.successSoft : colors.dangerSoft,
            },
          ]}
        >
          <Ionicons
            name={getStatusIcon(status)}
            size={22}
            color={status === 'granted' ? colors.success : colors.danger}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[permStyles.permTitle, { color: colors.text }]}>
            {title}
          </Text>
          <Text style={[permStyles.permDesc, { color: colors.textSecondary }]}>
            {description}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            permStyles.permBtn,
            {
              backgroundColor:
                status === 'granted' ? colors.successSoft : colors.dangerSoft,
            },
          ]}
          onPress={status === 'granted' ? onDisable : onEnable}
          activeOpacity={0.7}
        >
          <Text
            style={[
              permStyles.permBtnText,
              {
                color: status === 'granted' ? colors.success : colors.danger,
              },
            ]}
          >
            {status === 'granted' ? 'Granted' : 'Enable'}
          </Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <NavigationHeader
          title="Permissions"
          subtitle="Required access for tracking"
          showMenu={false}
        />

        <View style={permStyles.body}>
          {/* Hero */}
          <View style={permStyles.heroArea}>
            <View
              style={[
                permStyles.heroIcon,
                {
                  backgroundColor: colors.neuInset,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="shield-checkmark" size={36} color={colors.warning} />
            </View>
            <Text style={[permStyles.heroTitle, { color: colors.text }]}>
              Grant Access
            </Text>
            <Text style={[permStyles.heroSub, { color: colors.textSecondary }]}>
              {APP_NAME} needs these permissions to keep your device tracked and
              secure
            </Text>
          </View>

          {/* Permissions List */}
          <View style={{ marginTop: 8 }}>
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
            style={permStyles.settingsLink}
            onPress={() => Linking.openSettings()}
          >
            <Ionicons name="settings-outline" size={18} color={colors.warning} />
            <Text style={[permStyles.settingsText, { color: colors.warning }]}>
              Open Device Settings
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const permStyles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroArea: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  permTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  permDesc: {
    fontSize: 12,
  },
  permBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 12,
  },
  permBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  settingsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  settingsText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});
