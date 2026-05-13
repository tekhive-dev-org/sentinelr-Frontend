import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useDevice } from "../context/DeviceContext";
import { useTheme } from "../context/ThemeContext";
import NavigationHeader from "../components/NavigationHeader";
import GlassCard from "../components/GlassCard";
import { APP_NAME } from "../utils/constants";

// Maps icon name to a background tint for the colored icon pill
const ICON_COLORS = {
  // appearance
  moon: '#6366f1',
  sunny: '#f59e0b',
  // device
  phone_portrait: '#0ea5e9',
  barcode: '#8b5cf6',
  checkmark_circle: '#16a34a',
  // notifications
  notifications: '#f97316',
  // privacy & security
  lock_closed: '#ef4444',
  eye_off: '#64748b',
  finger_print: '#0ea5e9',
  // support
  help_circle: '#10b981',
  shield: '#6366f1',
  document_text: '#64748b',
  // danger
  unlink: '#d97706',
  trash: '#ef4444',
};

function IconBadge({ name, bgColor }) {
  return (
    <View style={[setStyles.iconBadge, { backgroundColor: bgColor + '28' }]}>
      <Ionicons name={name} size={16} color={bgColor} />
    </View>
  );
}

export default function SettingsScreen({ navigation }) {
  const { deviceId, unpairDevice, removeDeviceFromDashboard } = useDevice();
  const { isDark, toggleTheme, colors } = useTheme();
  const [isUnpairing, setIsUnpairing] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationAlerts, setLocationAlerts] = useState(true);

  const handleUnpair = () => {
    Alert.alert(
      "Unpair Device",
      'Are you sure you want to unpair this device?\n\nThe device will remain visible on the web dashboard with an "Unpaired" status. You can re-pair it later.',
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unpair",
          style: "destructive",
          onPress: async () => {
            setIsUnpairing(true);
            try {
              await unpairDevice();
            } catch (err) {
              Alert.alert("Error", "Failed to unpair device. Please try again.");
            } finally {
              setIsUnpairing(false);
            }
          },
        },
      ],
    );
  };

  const handleRemoveFromDashboard = () => {
    Alert.alert(
      "Remove from Dashboard",
      "Are you sure you want to remove this device from the dashboard?\n\nThis will hide the device from the web dashboard view.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setIsRemoving(true);
            try {
              await removeDeviceFromDashboard();
            } catch (err) {
              Alert.alert("Error", "Failed to remove device. Please try again.");
            } finally {
              setIsRemoving(false);
            }
          },
        },
      ],
    );
  };

  /** Plain info row (label + value, no press) */
  const InfoRow = ({ icon, iconColor, title, value, isLast = false }) => (
    <View
      style={[
        setStyles.row,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.borderLight },
      ]}
    >
      <View style={setStyles.rowLeft}>
        <IconBadge name={icon} bgColor={iconColor} />
        <Text style={[setStyles.rowTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <Text style={[setStyles.rowValue, { color: colors.textSecondary }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );

  /** Tappable navigation row */
  const NavRow = ({ icon, iconColor, title, subtitle, onPress, isLast = false }) => (
    <TouchableOpacity
      style={[
        setStyles.row,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.borderLight },
      ]}
      onPress={onPress}
      activeOpacity={0.65}
    >
      <View style={setStyles.rowLeft}>
        <IconBadge name={icon} bgColor={iconColor} />
        <View>
          <Text style={[setStyles.rowTitle, { color: colors.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[setStyles.rowSubtitle, { color: colors.textMuted }]}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={15} color={colors.textMuted} />
    </TouchableOpacity>
  );

  /** Toggle row */
  const ToggleRow = ({ icon, iconColor, title, subtitle, value, onValueChange, isLast = false }) => (
    <View
      style={[
        setStyles.row,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.borderLight },
      ]}
    >
      <View style={setStyles.rowLeft}>
        <IconBadge name={icon} bgColor={iconColor} />
        <View>
          <Text style={[setStyles.rowTitle, { color: colors.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[setStyles.rowSubtitle, { color: colors.textMuted }]}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.neuInset, true: 'rgba(99, 102, 241, 0.55)' }}
        thumbColor={value ? '#6366f1' : colors.textMuted}
        ios_backgroundColor={colors.neuInset}
      />
    </View>
  );

  const SectionLabel = ({ label }) => (
    <Text style={[setStyles.sectionLabel, { color: colors.textMuted }]}>{label}</Text>
  );

  const deviceStatus = deviceId ? "Paired" : "Not Paired";
  const deviceStatusColor = deviceId ? colors.success : colors.textMuted;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <NavigationHeader
          title="Settings"
          subtitle="Device configuration"
          showMenu={false}
        />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Device Identity Card ── */}
          <GlassCard style={setStyles.deviceCard}>
            <View style={setStyles.deviceCardInner}>
              <View style={[setStyles.deviceAvatar, { backgroundColor: colors.accentSoft }]}>
                <Ionicons name="phone-portrait-outline" size={28} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[setStyles.deviceName, { color: colors.text }]}>
                  {APP_NAME} Device
                </Text>
                <Text style={[setStyles.deviceId, { color: colors.textSecondary }]}>
                  ID: {deviceId ? `••••${deviceId.slice(-6)}` : "Not registered"}
                </Text>
                <View style={setStyles.statusPill}>
                  <View style={[setStyles.statusDot, { backgroundColor: deviceStatusColor }]} />
                  <Text style={[setStyles.statusText, { color: deviceStatusColor }]}>
                    {deviceStatus}
                  </Text>
                </View>
              </View>
              <View style={[setStyles.versionTag, { backgroundColor: colors.accentSoft }]}>
                <Text style={[setStyles.versionTagText, { color: colors.accent }]}>v1.1.2</Text>
              </View>
            </View>
          </GlassCard>

          {/* ── Appearance ── */}
          <SectionLabel label="APPEARANCE" />
          <GlassCard noPadding>
            <ToggleRow
              icon={isDark ? "moon" : "sunny"}
              iconColor={isDark ? '#6366f1' : '#f59e0b'}
              title="Dark Mode"
              subtitle={isDark ? "Using dark theme" : "Using light theme"}
              value={isDark}
              onValueChange={toggleTheme}
              isLast
            />
          </GlassCard>

          {/* ── Notifications ── */}
          <SectionLabel label="NOTIFICATIONS" />
          <GlassCard noPadding>
            <ToggleRow
              icon="notifications-outline"
              iconColor="#f97316"
              title="Push Notifications"
              subtitle="Alerts, SOS, and status updates"
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
            <ToggleRow
              icon="location-outline"
              iconColor="#0ea5e9"
              title="Location Alerts"
              subtitle="Geofence and movement events"
              value={locationAlerts}
              onValueChange={setLocationAlerts}
              isLast
            />
          </GlassCard>

          {/* ── Privacy & Security ── */}
          <SectionLabel label="PRIVACY & SECURITY" />
          <GlassCard noPadding>
            <NavRow
              icon="lock-closed-outline"
              iconColor="#ef4444"
              title="App Lock"
              subtitle="Require PIN or biometrics"
            />
            <NavRow
              icon="finger-print-outline"
              iconColor="#0ea5e9"
              title="Biometric Auth"
              subtitle="Use Face ID or fingerprint"
              isLast
            />
          </GlassCard>

          {/* ── Device ── */}
          <SectionLabel label="DEVICE" />
          <GlassCard noPadding>
            <InfoRow
              icon="barcode-outline"
              iconColor="#8b5cf6"
              title="Device ID"
              value={deviceId ? `••••${deviceId.slice(-8)}` : "Unknown"}
            />
            <InfoRow
              icon="git-branch-outline"
              iconColor="#10b981"
              title="App Version"
              value="1.1.2 (Build 2)"
            />
            <InfoRow
              icon="checkmark-circle-outline"
              iconColor="#16a34a"
              title="Status"
              value={deviceStatus}
              isLast
            />
          </GlassCard>

          {/* ── Support ── */}
          <SectionLabel label="SUPPORT" />
          <GlassCard noPadding>
            <NavRow
              icon="help-circle-outline"
              iconColor="#10b981"
              title="Help Center"
              subtitle="FAQs and troubleshooting"
            />
            <NavRow
              icon="shield-outline"
              iconColor="#6366f1"
              title="Privacy Policy"
              onPress={() => navigation.navigate("PrivacyPolicy")}
            />
            <NavRow
              icon="document-text-outline"
              iconColor="#64748b"
              title="Terms of Service"
              isLast
            />
          </GlassCard>

          {/* ── About ── */}
          <SectionLabel label="ABOUT" />
          <GlassCard noPadding>
            <NavRow
              icon="information-circle-outline"
              iconColor="#0ea5e9"
              title="About Sentinelr"
              subtitle="Version history & licenses"
            />
            <NavRow
              icon="star-outline"
              iconColor="#f59e0b"
              title="Rate the App"
              subtitle="Share your feedback"
              isLast
            />
          </GlassCard>

          {/* ── Danger Zone ── */}
          <SectionLabel label="DEVICE MANAGEMENT" />
          <GlassCard noPadding>
            <TouchableOpacity
              style={[
                setStyles.row,
                { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.borderLight },
              ]}
              onPress={handleUnpair}
              activeOpacity={0.65}
              disabled={isUnpairing || isRemoving}
            >
              <View style={setStyles.rowLeft}>
                <IconBadge name="unlink-outline" bgColor="#d97706" />
                <View>
                  <Text style={[setStyles.rowTitle, { color: '#d97706' }]}>
                    {isUnpairing ? "Unpairing…" : "Unpair Device"}
                  </Text>
                  <Text style={[setStyles.rowSubtitle, { color: colors.textMuted }]}>
                    Device stays on dashboard as Unpaired
                  </Text>
                </View>
              </View>
              {isUnpairing ? (
                <ActivityIndicator size="small" color="#d97706" />
              ) : (
                <Ionicons name="chevron-forward" size={15} color={colors.textMuted} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={setStyles.row}
              onPress={handleRemoveFromDashboard}
              activeOpacity={0.65}
              disabled={isUnpairing || isRemoving}
            >
              <View style={setStyles.rowLeft}>
                <IconBadge name="trash-outline" bgColor="#ef4444" />
                <View>
                  <Text style={[setStyles.rowTitle, { color: colors.danger }]}>
                    {isRemoving ? "Removing…" : "Remove from Dashboard"}
                  </Text>
                  <Text style={[setStyles.rowSubtitle, { color: colors.textMuted }]}>
                    Hides device from the web dashboard
                  </Text>
                </View>
              </View>
              {isRemoving ? (
                <ActivityIndicator size="small" color={colors.danger} />
              ) : (
                <Ionicons name="chevron-forward" size={15} color={colors.textMuted} />
              )}
            </TouchableOpacity>
          </GlassCard>

          {/* Footer */}
          <Text style={[setStyles.footer, { color: colors.textMuted }]}>
            {APP_NAME} · v1.1.2 · © 2026 TechHive
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const setStyles = StyleSheet.create({
  /* ── Device card ── */
  deviceCard: {
    marginTop: 16,
  },
  deviceCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  deviceAvatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  deviceId: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  versionTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  versionTagText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  /* ── Section label ── */
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginTop: 28,
    marginBottom: 8,
    paddingLeft: 4,
  },

  /* ── Icon badge ── */
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  /* ── Row ── */
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    minHeight: 56,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  rowSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 1,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '400',
    maxWidth: 140,
    textAlign: 'right',
  },

  /* ── Footer ── */
  footer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 32,
    letterSpacing: 0.3,
  },
});
