import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  AppState,
  Linking,
  StyleSheet,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { isRunningInExpoGo } from 'expo';
import * as Location from 'expo-location';
import { useTheme } from '../context/ThemeContext';
import NavigationHeader from '../components/NavigationHeader';
import GlassCard from '../components/GlassCard';
import { APP_NAME } from '../utils/constants';
import {
  isAndroidAccessibilityEnabled,
  isAndroidParentalEnforcementAvailable,
  openAndroidAccessibilitySettings,
} from '../services/androidParentalEnforcement';

const isExpoGoAndroid = Platform.OS === 'android' && isRunningInExpoGo();

async function getNotificationsModule() {
  if (isExpoGoAndroid) return null;
  return import('expo-notifications');
}

// ── Permission row ─────────────────────────────────────────────────────────
const PermissionRow = ({ icon, title, description, status, onEnable, onDisable, colors }) => {
  const granted = status === 'granted';
  const unavailable = status === 'unavailable';

  const tint = granted
    ? colors.success
    : unavailable
    ? colors.warning
    : colors.danger;
  const tintSoft = granted
    ? colors.successSoft
    : unavailable
    ? colors.warningSoft
    : colors.dangerSoft;
  const statusIcon = granted
    ? 'checkmark-circle'
    : unavailable
    ? 'information-circle'
    : 'close-circle';
  const btnLabel = granted ? 'Granted' : unavailable ? 'Dev build' : 'Enable';

  return (
    <View style={[s.permCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Left icon badge */}
      <View style={[s.permBadge, { backgroundColor: tintSoft }]}>
        <Ionicons name={icon} size={20} color={tint} />
      </View>

      {/* Text */}
      <View style={s.permText}>
        <Text style={[s.permTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[s.permDesc, { color: colors.textSecondary }]}>{description}</Text>
      </View>

      {/* Status + button */}
      <View style={s.permRight}>
        <Ionicons name={statusIcon} size={18} color={tint} style={{ marginBottom: 6 }} />
        <TouchableOpacity
          style={[s.permBtn, { backgroundColor: tintSoft, borderColor: tint }]}
          onPress={granted ? onDisable : onEnable}
          activeOpacity={0.7}
        >
          <Text style={[s.permBtnText, { color: tint }]}>{btnLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function PermissionsScreen({ navigation }) {
  const { colors } = useTheme();
  const [locationStatus, setLocationStatus] = useState('pending');
  const [notificationStatus, setNotificationStatus] = useState('pending');
  const [backgroundStatus, setBackgroundStatus] = useState('pending');
  const [accessibilityStatus, setAccessibilityStatus] = useState(
    Platform.OS === 'android' ? 'pending' : 'unavailable'
  );
  const [showBgDisclosure, setShowBgDisclosure] = useState(false);

  useEffect(() => { checkPermissions(); }, []);

  // Re-check when user returns from Accessibility Settings (or any system settings screen)
  const appStateRef = useRef(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appStateRef.current !== 'active' && nextState === 'active') {
        checkPermissions();
      }
      appStateRef.current = nextState;
    });
    return () => sub.remove();
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
        } catch {}
      }

      setLocationStatus(foreground === 'granted' ? 'granted' : 'denied');
      setBackgroundStatus(background === 'granted' ? 'granted' : 'denied');
      setNotificationStatus(
        notification === 'granted' ? 'granted' : notification === 'unavailable' ? 'unavailable' : 'denied',
      );

      if (Platform.OS === 'android') {
        if (isExpoGoAndroid) {
          setAccessibilityStatus('unavailable');
        } else if (isAndroidParentalEnforcementAvailable()) {
          setAccessibilityStatus(isAndroidAccessibilityEnabled() ? 'granted' : 'denied');
        } else {
          // Production build but native module not yet linked — keep as denied so Enable is shown
          setAccessibilityStatus('denied');
        }
      }
    } catch {}
  };

  const requestAccessibilityPermission = async () => {
    if (Platform.OS !== 'android') {
      setAccessibilityStatus('unavailable');
      return;
    }

    if (isExpoGoAndroid) {
      setAccessibilityStatus('unavailable');
      Alert.alert(
        'Development Build Required',
        'Parental control enforcement is not available in Expo Go. Use a development or release build.',
      );
      return;
    }

    if (!isAndroidParentalEnforcementAvailable()) {
      // Module not linked in this build — direct the user to open Accessibility settings
      // (they should rebuild the app with the module included for full enforcement)
      Alert.alert(
        'Enable Accessibility Service',
        'Go to Accessibility settings and enable Sentinelr Parental Controls to activate app blocking and freeze.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }

    const opened = openAndroidAccessibilitySettings();
    if (!opened) {
      Alert.alert('Accessibility Service', 'Unable to open accessibility settings on this device.');
      return;
    }

    Alert.alert(
      'Enable Sentinelr Protection',
      'In Accessibility settings, enable Sentinelr Parental Controls so the app can block restricted apps during freeze, bedtime, and app-blocking periods.',
      [{ text: 'OK' }],
    );
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationStatus(status === 'granted' ? 'granted' : 'denied');
      if (status !== 'granted') {
        Alert.alert('Location Required', 'Please enable location access to use tracking features.', [{ text: 'OK' }]);
      }
    } catch {
      Alert.alert('Error', 'Failed to request location permission');
    }
  };

  const showBackgroundLocationDisclosure = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Enable Location First', 'Please enable Location Access before requesting background location.', [{ text: 'OK' }]);
      return;
    }
    setShowBgDisclosure(true);
  };

  const requestBackgroundLocationPermission = async () => {
    setShowBgDisclosure(false);
    try {
      const { status } = await Location.requestBackgroundPermissionsAsync();
      setBackgroundStatus(status === 'granted' ? 'granted' : 'denied');
      if (status !== 'granted') {
        Alert.alert(
          'Background Location Required',
          'For continuous tracking, enable "Allow all the time" in your device settings.\n\nGo to Settings > Apps > ' + APP_NAME + ' > Permissions > Location > Allow all the time',
          [{ text: 'Cancel', style: 'cancel' }, { text: 'Open Settings', onPress: () => Linking.openSettings() }],
        );
      }
    } catch {
      Alert.alert('Background Location', 'Could not request permission. Please enable it manually in Settings.', [
        { text: 'Cancel', style: 'cancel' }, { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]);
    }
  };

  const requestNotificationPermission = async () => {
    if (isExpoGoAndroid) {
      setNotificationStatus('unavailable');
      Alert.alert('Development Build Required', 'Android push notifications are not available in Expo Go. Use a development build to enable notifications.');
      return;
    }
    try {
      const Notifications = await getNotificationsModule();
      const { status } = await Notifications.requestPermissionsAsync();
      setNotificationStatus(status === 'granted' ? 'granted' : 'denied');
    } catch {
      setNotificationStatus('denied');
      Alert.alert('Notice', 'Notifications are not available in this environment.');
    }
  };

  const openSettingsToDisable = (name) => {
    Alert.alert(
      `Disable ${name}`,
      `To disable ${name.toLowerCase()}, go to your device settings.`,
      [{ text: 'Cancel', style: 'cancel' }, { text: 'Open Settings', onPress: async () => { await Linking.openSettings(); setTimeout(checkPermissions, 1000); } }],
    );
  };

  // Progress count
  const requiredStatuses = [locationStatus, backgroundStatus, notificationStatus];
  if (Platform.OS === 'android') {
    requiredStatuses.push(accessibilityStatus);
  }
  const grantedCount = requiredStatuses.filter(s => s === 'granted').length;
  const totalRequired = requiredStatuses.length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <NavigationHeader title="Permissions" subtitle="Required access" showMenu={false} />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Hero ──────────────────────────────────────────────────────── */}
          <GlassCard style={s.hero}>
            <View style={[s.heroBadge, { backgroundColor: colors.warningSoft }]}>
              <Ionicons name="shield-checkmark" size={32} color={colors.warning} />
            </View>
            <Text style={[s.heroTitle, { color: colors.text }]}>App Permissions</Text>
            <Text style={[s.heroSub, { color: colors.textSecondary }]}>
              {APP_NAME} needs the following permissions to track your location and keep your family safe.
            </Text>

            {/* Progress bar */}
            <View style={s.progressWrap}>
              <View style={[s.progressTrack, { backgroundColor: colors.neuInset }]}>
                <View
                  style={[
                    s.progressFill,
                    {
                      width: `${(grantedCount / totalRequired) * 100}%`,
                      backgroundColor: grantedCount === totalRequired ? colors.success : colors.warning,
                    },
                  ]}
                />
              </View>
              <Text style={[s.progressLabel, { color: colors.textMuted }]}>
                {grantedCount}/{totalRequired} granted
              </Text>
            </View>
          </GlassCard>

          {/* ── Permission Cards ──────────────────────────────────────────── */}
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: colors.textMuted }]}>REQUIRED PERMISSIONS</Text>
          </View>

          <PermissionRow
            icon="location"
            title="Location Access"
            description="Foreground GPS tracking"
            status={locationStatus}
            onEnable={requestLocationPermission}
            onDisable={() => openSettingsToDisable('Location Access')}
            colors={colors}
          />
          <PermissionRow
            icon="navigate"
            title="Background Location"
            description="Track when app is closed"
            status={backgroundStatus}
            onEnable={showBackgroundLocationDisclosure}
            onDisable={() => openSettingsToDisable('Background Location')}
            colors={colors}
          />
          <PermissionRow
            icon="notifications"
            title="Notifications"
            description={isExpoGoAndroid ? 'Requires development build on Android' : 'Alerts and SOS updates'}
            status={notificationStatus}
            onEnable={requestNotificationPermission}
            onDisable={() => openSettingsToDisable('Notifications')}
            colors={colors}
          />
          {Platform.OS === 'android' && (
            <PermissionRow
              icon="shield-half-outline"
              title="Parental Control Access"
              description={
                isExpoGoAndroid
                  ? 'Requires development build on Android'
                  : 'Required for real app blocking, freeze, and bedtime enforcement'
              }
              status={accessibilityStatus}
              onEnable={requestAccessibilityPermission}
              onDisable={requestAccessibilityPermission}
              colors={colors}
            />
          )}

          {/* ── Open Settings ─────────────────────────────────────────────── */}
          <TouchableOpacity
            style={[s.settingsBtn, { borderColor: colors.border }]}
            onPress={() => Linking.openSettings()}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={16} color={colors.textSecondary} />
            <Text style={[s.settingsBtnText, { color: colors.textSecondary }]}>Open Device Settings</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      {/* ── Background Location Disclosure Modal ─────────────────────────── */}
      <Modal
        visible={showBgDisclosure}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBgDisclosure(false)}
      >
        <View style={s.modalOverlay}>
          <View style={[s.modalSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Handle */}
            <View style={[s.modalHandle, { backgroundColor: colors.border }]} />

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={[s.modalIconWrap, { backgroundColor: colors.warningSoft }]}>
                <Ionicons name="navigate" size={28} color={colors.warning} />
              </View>
              <Text style={[s.modalTitle, { color: colors.text }]}>
                Background Location Access
              </Text>
              <Text style={[s.modalBody, { color: colors.textSecondary }]}>
                {APP_NAME} collects your device's{' '}
                <Text style={{ fontWeight: '700', color: colors.text }}>precise GPS location</Text>{' '}
                even when the app is closed or not in use. This is required for:
              </Text>

              {[
                { icon: 'location', label: 'Real-time tracking', detail: 'Family members can see your location at all times' },
                { icon: 'map', label: 'Geofence alerts', detail: 'Get notified when someone enters or leaves a zone' },
                { icon: 'alert-circle', label: 'SOS emergency alerts', detail: 'Share your location instantly during an emergency' },
              ].map((item) => (
                <View key={item.label} style={[s.modalBulletRow, { borderColor: colors.border }]}>
                  <View style={[s.modalBulletIcon, { backgroundColor: colors.warningSoft }]}>
                    <Ionicons name={item.icon} size={15} color={colors.warning} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.modalBulletLabel, { color: colors.text }]}>{item.label}</Text>
                    <Text style={[s.modalBulletDetail, { color: colors.textSecondary }]}>{item.detail}</Text>
                  </View>
                </View>
              ))}

              <Text style={[s.modalFootnote, { color: colors.textMuted }]}>
                Your location data is encrypted in transit and only shared with members of your family group. You can disable this at any time in Settings.
              </Text>
            </ScrollView>

            <View style={s.modalActions}>
              <TouchableOpacity
                style={[s.modalBtnSecondary, { borderColor: colors.border }]}
                onPress={() => setShowBgDisclosure(false)}
                activeOpacity={0.7}
              >
                <Text style={[s.modalBtnText, { color: colors.textSecondary }]}>No Thanks</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalBtnPrimary, { backgroundColor: colors.warning }]}
                onPress={requestBackgroundLocationPermission}
                activeOpacity={0.7}
              >
                <Text style={[s.modalBtnText, { color: '#000' }]}>Allow Access</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 10,
  },

  // Hero card
  hero: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 10,
  },
  heroBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  heroSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
  },
  progressWrap: {
    width: '100%',
    paddingHorizontal: 8,
    gap: 6,
    marginTop: 4,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.4,
  },

  // Section header
  sectionHeader: {
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },

  // Permission row card
  permCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  permBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  permText: {
    flex: 1,
    gap: 2,
  },
  permTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  permDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  permRight: {
    alignItems: 'center',
    flexShrink: 0,
  },
  permBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  permBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },

  // Open settings link
  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  settingsBtnText: {
    fontSize: 13.5,
    fontWeight: '500',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    padding: 24,
    paddingTop: 14,
    maxHeight: '78%',
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  modalBody: {
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 12,
  },
  modalBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  modalBulletIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  modalBulletLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  modalBulletDetail: {
    fontSize: 12,
    lineHeight: 17,
  },
  modalFootnote: {
    fontSize: 11.5,
    lineHeight: 17,
    marginTop: 14,
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalBtnSecondary: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnPrimary: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});


