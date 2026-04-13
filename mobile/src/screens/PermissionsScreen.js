import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking, StyleSheet, Platform, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { isRunningInExpoGo } from 'expo';
import * as Location from 'expo-location';
import { useTheme } from '../context/ThemeContext';
import NavigationHeader from '../components/NavigationHeader';
import GlassCard from '../components/GlassCard';
import { APP_NAME } from '../utils/constants';

const isExpoGoAndroid = Platform.OS === 'android' && isRunningInExpoGo();

async function getNotificationsModule() {
  if (isExpoGoAndroid) {
    return null;
  }

  const module = await import('expo-notifications');
  return module;
}

export default function PermissionsScreen({ navigation }) {
  const { colors } = useTheme();
  const [locationStatus, setLocationStatus] = useState('pending');
  const [notificationStatus, setNotificationStatus] = useState('pending');
  const [backgroundStatus, setBackgroundStatus] = useState('pending');
  const [showBgDisclosure, setShowBgDisclosure] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const { status: foreground } = await Location.getForegroundPermissionsAsync();
      const { status: background } = await Location.getBackgroundPermissionsAsync();

      let notification = isExpoGoAndroid ? 'unavailable' : 'denied';
      if (!isExpoGoAndroid) {
        try {
          const Notifications = await getNotificationsModule();
          const { status } = await Notifications.getPermissionsAsync();
          notification = status;
        } catch (e) {
          console.log('Notifications permission check failed:', e.message);
        }
      }

      setLocationStatus(foreground === 'granted' ? 'granted' : 'denied');
      setBackgroundStatus(background === 'granted' ? 'granted' : 'denied');
      setNotificationStatus(
        notification === 'granted'
          ? 'granted'
          : notification === 'unavailable'
            ? 'unavailable'
            : 'denied'
      );
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

  const showBackgroundLocationDisclosure = async () => {
    const { status: foreground } = await Location.getForegroundPermissionsAsync();
    if (foreground !== 'granted') {
      Alert.alert(
        'Enable Location First',
        'Please enable Location Access before requesting background location.',
        [{ text: 'OK' }]
      );
      return;
    }
    setShowBgDisclosure(true);
  };

  const requestBackgroundLocationPermission = async () => {
    setShowBgDisclosure(false);
    try {
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
    if (isExpoGoAndroid) {
      setNotificationStatus('unavailable');
      Alert.alert(
        'Development Build Required',
        'Android push notifications are not available in Expo Go. Use a development build or standalone app to enable notification permissions.'
      );
      return;
    }

    try {
      const Notifications = await getNotificationsModule();
      const { status } = await Notifications.requestPermissionsAsync();
      setNotificationStatus(status === 'granted' ? 'granted' : 'denied');
    } catch (error) {
      console.log('Notifications request failed:', error.message);
      setNotificationStatus('denied');
      Alert.alert('Notice', 'Notifications are not available in this environment.');
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
    if (status === 'unavailable') return 'information-circle';
    if (status === 'denied') return 'alert-circle';
    return 'ellipse-outline';
  };

  const getStatusColors = (status) => {
    if (status === 'granted') {
      return {
        backgroundColor: colors.successSoft,
        color: colors.success,
      };
    }

    if (status === 'unavailable') {
      return {
        backgroundColor: colors.warningSoft || 'rgba(230, 173, 19, 0.15)',
        color: colors.warning,
      };
    }

    return {
      backgroundColor: colors.dangerSoft,
      color: colors.danger,
    };
  };

  const PermissionItem = ({ title, description, status, onEnable, onDisable }) => {
    const statusColors = getStatusColors(status);
    const buttonLabel =
      status === 'granted' ? 'Granted' : status === 'unavailable' ? 'Dev Build' : 'Enable';

    return (
      <GlassCard style={{ marginBottom: 12 }}>
        <View style={permStyles.permRow}>
          <View
            style={[
              permStyles.permIcon,
              {
                backgroundColor: statusColors.backgroundColor,
              },
            ]}
          >
            <Ionicons
              name={getStatusIcon(status)}
              size={22}
              color={statusColors.color}
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
                backgroundColor: statusColors.backgroundColor,
              },
            ]}
            onPress={status === 'granted' ? onDisable : onEnable}
            activeOpacity={0.7}
          >
            <Text
              style={[
                permStyles.permBtnText,
                {
                  color: statusColors.color,
                },
              ]}
            >
              {buttonLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    );
  };

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
              onEnable={showBackgroundLocationDisclosure}
              onDisable={() => openSettingsToDisable('Background Location')}
            />
            <PermissionItem
              title="Notifications"
              description={
                isExpoGoAndroid
                  ? 'Push notifications require a development build on Android'
                  : 'Receive alerts and updates'
              }
              status={notificationStatus}
              onEnable={requestNotificationPermission}
              onDisable={() => openSettingsToDisable('Notifications')}
            />
          </View>

          {/* Background Location Disclosure Modal */}
          <Modal
            visible={showBgDisclosure}
            transparent
            animationType="slide"
            onRequestClose={() => setShowBgDisclosure(false)}
          >
            <View style={permStyles.modalOverlay}>
              <View style={[permStyles.modalContent, { backgroundColor: colors.card }]}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={permStyles.modalIconRow}>
                    <Ionicons name="location" size={32} color={colors.warning} />
                  </View>
                  <Text style={[permStyles.modalTitle, { color: colors.text }]}>
                    Background Location Access
                  </Text>
                  <Text style={[permStyles.modalBody, { color: colors.textSecondary }]}>
                    {APP_NAME} collects your device's <Text style={{ fontWeight: '700', color: colors.text }}>precise GPS location</Text> even when the app is closed or not in use. This is required for:
                  </Text>
                  <View style={permStyles.modalBullets}>
                    <Text style={[permStyles.modalBullet, { color: colors.textSecondary }]}>
                      {"\u2022"} <Text style={{ fontWeight: '600', color: colors.text }}>Real-time tracking</Text> — so family members can see your location at all times
                    </Text>
                    <Text style={[permStyles.modalBullet, { color: colors.textSecondary }]}>
                      {"\u2022"} <Text style={{ fontWeight: '600', color: colors.text }}>Geofence alerts</Text> — to notify you when a family member enters or leaves a designated area
                    </Text>
                    <Text style={[permStyles.modalBullet, { color: colors.textSecondary }]}>
                      {"\u2022"} <Text style={{ fontWeight: '600', color: colors.text }}>SOS emergency alerts</Text> — to share your location instantly during an emergency
                    </Text>
                  </View>
                  <Text style={[permStyles.modalBody, { color: colors.textSecondary, marginTop: 12 }]}>
                    Your location data is encrypted in transit and is only shared with members of your family group. You can disable this at any time in your device settings.
                  </Text>
                </ScrollView>
                <View style={permStyles.modalActions}>
                  <TouchableOpacity
                    style={[permStyles.modalBtnSecondary, { borderColor: colors.border }]}
                    onPress={() => setShowBgDisclosure(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={[permStyles.modalBtnText, { color: colors.textSecondary }]}>No Thanks</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[permStyles.modalBtnPrimary, { backgroundColor: colors.warning }]}
                    onPress={requestBackgroundLocationPermission}
                    activeOpacity={0.7}
                  >
                    <Text style={[permStyles.modalBtnText, { color: '#000' }]}>Allow Access</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '75%',
  },
  modalIconRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalBody: {
    fontSize: 14,
    lineHeight: 21,
  },
  modalBullets: {
    marginTop: 10,
    paddingLeft: 4,
  },
  modalBullet: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 6,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  modalBtnSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalBtnPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
