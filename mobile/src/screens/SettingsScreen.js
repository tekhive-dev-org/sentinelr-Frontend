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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useDevice } from "../context/DeviceContext";
import { useTheme } from "../context/ThemeContext";
import NavigationHeader from "../components/NavigationHeader";
import GlassCard from "../components/GlassCard";
import { APP_NAME } from "../utils/constants";

export default function SettingsScreen({ navigation }) {
  const { deviceId, unpairDevice, removeDeviceFromDashboard } = useDevice();
  const { isDark, toggleTheme, colors } = useTheme();
  const [isUnpairing, setIsUnpairing] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Unpair: changes pairStatus to "Unpaired" on backend, device stays on web dashboard
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
              Alert.alert(
                "Error",
                "Failed to unpair device. Please try again.",
              );
            } finally {
              setIsUnpairing(false);
            }
          },
        },
      ],
    );
  };

  // Remove from Dashboard: hides device from web dashboard view (soft-delete)
  const handleRemoveFromDashboard = () => {
    Alert.alert(
      "Remove from Dashboard",
      "Are you sure you want to remove this device from the dashboard?\n\nThis will hide the device from the web dashboard view. This action cannot be easily undone.",
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
              Alert.alert(
                "Error",
                "Failed to remove device. Please try again.",
              );
            } finally {
              setIsRemoving(false);
            }
          },
        },
      ],
    );
  };

  const SettingsRow = ({ title, value, isLast = false }) => (
    <View
      style={[
        setStyles.row,
        !isLast && { borderBottomWidth: 1, borderColor: colors.borderLight },
      ]}
    >
      <Text style={[setStyles.rowTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[setStyles.rowValue, { color: colors.textSecondary }]}>
        {value}
      </Text>
    </View>
  );

  const LinkRow = ({ title, icon, isLast = false }) => (
    <TouchableOpacity
      style={[
        setStyles.row,
        !isLast && { borderBottomWidth: 1, borderColor: colors.borderLight },
      ]}
    >
      <View style={setStyles.linkInner}>
        <Ionicons name={icon} size={18} color={colors.textSecondary} />
        <Text
          style={[setStyles.rowTitle, { color: colors.text, marginLeft: 12 }]}
        >
          {title}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </TouchableOpacity>
  );

  const SectionLabel = ({ label }) => (
    <Text style={[setStyles.sectionLabel, { color: colors.textMuted }]}>
      {label}
    </Text>
  );

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
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Appearance */}
          <SectionLabel label="APPEARANCE" />
          <GlassCard noPadding>
            <View style={setStyles.row}>
              <View style={setStyles.linkInner}>
                <Ionicons
                  name={isDark ? "moon" : "sunny"}
                  size={18}
                  color={colors.warning}
                />
                <Text
                  style={[
                    setStyles.rowTitle,
                    { color: colors.text, marginLeft: 12 },
                  ]}
                >
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{
                  false: colors.neuInset,
                  true: "rgba(219, 50, 63, 0.35)",
                }}
                thumbColor={isDark ? colors.danger : colors.textMuted}
                ios_backgroundColor={colors.neuInset}
              />
            </View>
          </GlassCard>

          {/* Device Information */}
          <SectionLabel label="DEVICE INFORMATION" />
          <GlassCard noPadding>
            <SettingsRow
              title="Device ID"
              value={deviceId ? `...${deviceId.slice(-8)}` : "Unknown"}
            />
            <SettingsRow title="App Version" value="1.0.0" />
            <SettingsRow title="Status" value="Paired" isLast />
          </GlassCard>

          {/* About */}
          <SectionLabel label="ABOUT" />
          <GlassCard noPadding>
            <SettingsRow title="App Name" value={APP_NAME} />
            <SettingsRow title="Build" value="Phase 1" isLast />
          </GlassCard>

          {/* Support */}
          <SectionLabel label="SUPPORT" />
          <GlassCard noPadding>
            <LinkRow title="Help Center" icon="help-circle-outline" />
            <LinkRow title="Privacy Policy" icon="shield-outline" />
            <LinkRow
              title="Terms of Service"
              icon="document-text-outline"
              isLast
            />
          </GlassCard>

          {/* Danger Zone */}
          <SectionLabel label="DANGER ZONE" />

          <TouchableOpacity
            style={[
              setStyles.dangerBtn,
              {
                backgroundColor: 'rgba(146, 64, 14, 0.2)',
                borderColor: 'rgba(146, 64, 14, 0.4)',
                opacity: isUnpairing ? 0.7 : 1,
              },
            ]}
            onPress={handleUnpair}
            activeOpacity={0.8}
            disabled={isUnpairing || isRemoving}
          >
            {isUnpairing ? (
              <ActivityIndicator size="small" color="#92400e" />
            ) : (
              <Ionicons name="unlink" size={20} color="#d97706" />
            )}
            <Text style={[setStyles.dangerText, { color: '#d97706' }]}>
              {isUnpairing ? "Unpairing..." : "Unpair Device"}
            </Text>
          </TouchableOpacity>
          <Text style={[setStyles.dangerHint, { color: colors.textMuted }]}>
            Device stays on dashboard with "Unpaired" status
          </Text>

          <TouchableOpacity
            style={[
              setStyles.dangerBtn,
              {
                backgroundColor: colors.dangerSoft,
                borderColor: 'rgba(219, 50, 63, 0.3)',
                opacity: isRemoving ? 0.7 : 1,
                marginTop: 12,
              },
            ]}
            onPress={handleRemoveFromDashboard}
            activeOpacity={0.8}
            disabled={isUnpairing || isRemoving}
          >
            {isRemoving ? (
              <ActivityIndicator size="small" color={colors.danger} />
            ) : (
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            )}
            <Text style={[setStyles.dangerText, { color: colors.danger }]}>
              {isRemoving ? "Removing..." : "Remove from Dashboard"}
            </Text>
          </TouchableOpacity>
          <Text
            style={[
              setStyles.dangerHint,
              { color: colors.textMuted, marginBottom: 0 },
            ]}
          >
            Hides this device from the web dashboard view
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const setStyles = StyleSheet.create({
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 8,
    paddingLeft: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowValue: {
    fontSize: 14,
  },
  linkInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  dangerText: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  dangerHint: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
});
