import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useDevice } from "../context/DeviceContext";
import { useTheme } from "../context/ThemeContext";
import NavigationHeader from "../components/NavigationHeader";
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
      className={`flex-row justify-between items-center py-4 px-[18px] ${!isLast ? "border-b" : ""}`}
      style={{ borderColor: colors.border }}
    >
      <Text style={{ color: colors.text }} className="text-[15px] font-medium">
        {title}
      </Text>
      <Text style={{ color: colors.textSecondary }} className="text-sm">
        {value}
      </Text>
    </View>
  );

  const LinkRow = ({ title, icon, isLast = false }) => (
    <TouchableOpacity
      className={`flex-row justify-between items-center py-4 px-[18px] ${!isLast ? "border-b" : ""}`}
      style={{ borderColor: colors.border }}
    >
      <View className="flex-row items-center">
        <Ionicons name={icon} size={18} color={colors.textSecondary} />
        <Text
          style={{ color: colors.text }}
          className="text-[15px] font-medium ml-3"
        >
          {title}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.warning} />
    </TouchableOpacity>
  );

  const SettingsSection = ({ title, children }) => (
    <View className="mt-6 mx-5">
      <Text
        style={{ color: colors.textSecondary }}
        className="text-xs font-bold px-1 mb-2.5 uppercase tracking-wider"
      >
        {title}
      </Text>
      <View
        className="rounded-2xl overflow-hidden border"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        {children}
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["bottom"]}
    >
      <NavigationHeader
        title="Settings"
        subtitle="Device configuration"
        showMenu={true}
        navigation={navigation}
        currentScreen="Settings"
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Appearance Section */}
        <SettingsSection title="Appearance">
          <View className="flex-row justify-between items-center py-4 px-[18px]">
            <View className="flex-row items-center">
              <Ionicons
                name={isDark ? "moon" : "sunny"}
                size={18}
                color={colors.warning}
              />
              <Text
                style={{ color: colors.text }}
                className="text-[15px] font-medium ml-3"
              >
                Dark Mode
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: "#e5e7eb", true: "rgba(219, 50, 63, 0.4)" }}
              thumbColor={isDark ? "#db323f" : "#9ca3af"}
              ios_backgroundColor="#e5e7eb"
            />
          </View>
        </SettingsSection>

        {/* Device Info Section */}
        <SettingsSection title="Device Information">
          <SettingsRow
            title="Device ID"
            value={deviceId ? `...${deviceId.slice(-8)}` : "Unknown"}
          />
          <SettingsRow title="App Version" value="1.0.0" />
          <SettingsRow title="Status" value="Paired" isLast />
        </SettingsSection>

        {/* About Section */}
        <SettingsSection title="About">
          <SettingsRow title="App Name" value={APP_NAME} />
          <SettingsRow title="Build" value="Phase 1" isLast />
        </SettingsSection>

        {/* Support Section */}
        <SettingsSection title="Support">
          <LinkRow title="Help Center" icon="help-circle-outline" />
          <LinkRow title="Privacy Policy" icon="shield-outline" />
          <LinkRow
            title="Terms of Service"
            icon="document-text-outline"
            isLast
          />
        </SettingsSection>

        {/* Danger Zone */}
        <View className="mt-10 mx-5">
          <Text
            style={{ color: colors.textSecondary }}
            className="text-xs font-bold px-1 mb-2.5 uppercase tracking-wider"
          >
            Danger Zone
          </Text>

          {/* Unpair Device */}
          <TouchableOpacity
            className="w-full py-[18px] rounded-[14px] items-center flex-row justify-center mb-3"
            style={{
              backgroundColor: "#92400e",
              opacity: isUnpairing ? 0.7 : 1,
            }}
            onPress={handleUnpair}
            activeOpacity={0.8}
            disabled={isUnpairing || isRemoving}
          >
            {isUnpairing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name="unlink" size={20} color="#ffffff" />
            )}
            <Text className="text-white text-base font-bold ml-2">
              {isUnpairing ? "Unpairing..." : "Unpair Device"}
            </Text>
          </TouchableOpacity>
          <Text
            style={{ color: colors.textMuted }}
            className="text-xs text-center mb-4"
          >
            Device stays on dashboard with "Unpaired" status
          </Text>

          {/* Remove from Dashboard */}
          <TouchableOpacity
            className="w-full py-[18px] rounded-[14px] items-center flex-row justify-center"
            style={{
              backgroundColor: colors.danger,
              opacity: isRemoving ? 0.7 : 1,
            }}
            onPress={handleRemoveFromDashboard}
            activeOpacity={0.8}
            disabled={isUnpairing || isRemoving}
          >
            {isRemoving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name="trash-outline" size={20} color="#ffffff" />
            )}
            <Text className="text-white text-base font-bold ml-2">
              {isRemoving ? "Removing..." : "Remove from Dashboard"}
            </Text>
          </TouchableOpacity>
          <Text
            style={{ color: colors.textMuted }}
            className="text-xs text-center mt-3"
          >
            Hides this device from the web dashboard view
          </Text>
        </View>

        {/* Footer spacing */}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
