import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Switch, AppState, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Battery from "expo-battery";
import { useDevice } from "../context/DeviceContext";
import { useTheme } from "../context/ThemeContext";
import { locationService } from "../services/locationService";
import { locationEvents } from "../services/locationService";
import { heartbeatService } from "../services/heartbeatService";
import NavigationHeader from "../components/NavigationHeader";
import GlassCard from "../components/GlassCard";
import { APP_NAME } from "../utils/constants";

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
    updateConnectionStatus,
  } = useDevice();
  const { colors } = useTheme();

  const [isOnline, setIsOnline] = useState(true);
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    initializeTracking();
    getBatteryLevel();

    const batterySubscription = Battery.addBatteryLevelListener(
      ({ batteryLevel }) => {
        updateBattery(Math.round(batteryLevel * 100));
      },
    );

    const appStateSubscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

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

  // Real-time location updates from background task
  useEffect(() => {
    if (!isTracking) return;

    const unsubscribe = locationEvents.onPing((location) => {
      updateLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        timestamp: location.timestamp,
      });
    });

    return unsubscribe;
  }, [isTracking]);

  const handleAppStateChange = (nextAppState) => {
    setAppState(nextAppState);
  };

  const initializeTracking = async () => {
    try {
      const isRunning = await locationService.isRunning();
      if (isRunning && !isTracking) {
        toggleTracking(true);
      } else if (!isRunning && isTracking) {
        toggleTracking(false);
      }

      const location = await locationService.getCurrentLocation();
      updateLocation(location);
    } catch (error) {
      // Silent
    }
  };

  const getBatteryLevel = async () => {
    const level = await Battery.getBatteryLevelAsync();
    updateBattery(Math.round(level * 100));
  };

  const startTracking = async () => {
    try {
      await locationService.start();

      // Start heartbeat — auth failures are handled globally by DeviceContext
      heartbeatService.start();

      updateConnectionStatus("online");
      setIsOnline(true);
    } catch (error) {
      setIsOnline(false);
    }
  };

  const stopTracking = async () => {
    try {
      await locationService.stop();
      heartbeatService.stop();
      updateConnectionStatus("offline");
    } catch (error) {
      // Silent
    }
  };

  const handleToggleTracking = () => {
    toggleTracking(!isTracking);
  };

  const formatTime = (date) => {
    if (!date) return "Never";
    return date.toLocaleTimeString();
  };

  const formatCoords = (location) => {
    if (!location) return "Waiting...";
    return `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
  };

  const StatusCard = ({ icon, title, value, valueColor, softColor, iconColor }) => (
    <View style={{ width: '48%', marginBottom: 12 }}>
      <GlassCard>
        <View style={{ alignItems: 'center', minHeight: 88 }}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: softColor || colors.warningSoft },
            ]}
          >
            <Ionicons name={icon} size={20} color={iconColor || colors.warning} />
          </View>
          <Text style={[styles.cardLabel, { color: colors.textMuted }]}>
            {title}
          </Text>
          <Text
            style={[styles.cardValue, { color: valueColor || colors.text }]}
            numberOfLines={1}
          >
            {value}
          </Text>
        </View>
      </GlassCard>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <NavigationHeader
          title={APP_NAME}
          subtitle="Security App"
          showMenu={false}
        />

        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          {/* ── Live Status Orb ──────────────────────────────────────────────── */}
          <View style={styles.orbContainer}>
            <View
              style={[
                styles.orbOuter,
                {
                  borderColor: isTracking
                    ? colors.success
                    : colors.border,
                  shadowColor: isTracking ? colors.success : 'transparent',
                },
              ]}
            >
              <View
                style={[
                  styles.orbInner,
                  {
                    backgroundColor: isTracking
                      ? colors.successSoft
                      : colors.neuInset,
                  },
                ]}
              >
                <Ionicons
                  name={isTracking ? "radio" : "radio-outline"}
                  size={28}
                  color={isTracking ? colors.success : colors.textMuted}
                />
              </View>
            </View>
            <Text
              style={[
                styles.orbLabel,
                { color: isTracking ? colors.success : colors.textMuted },
              ]}
            >
              {isTracking ? "LIVE" : "OFFLINE"}
            </Text>
            <Text style={[styles.orbSub, { color: colors.textSecondary }]}>
              {isTracking
                ? "Location is being shared"
                : "Tracking is paused"}
            </Text>
          </View>

          {/* ── Status Cards Grid ───────────────────────────────────────────── */}
          <View style={styles.grid}>
            <StatusCard
              icon="location"
              title="LOCATION"
              value={formatCoords(currentLocation)}
              valueColor={currentLocation ? colors.text : colors.textMuted}
              softColor={colors.accentSoft}
              iconColor={colors.accent}
            />
            <StatusCard
              icon="battery-half"
              title="BATTERY"
              value={batteryLevel !== null ? `${batteryLevel}%` : "--"}
              valueColor={batteryLevel > 20 ? colors.success : colors.danger}
              softColor={
                batteryLevel > 20 ? colors.successSoft : colors.dangerSoft
              }
              iconColor={batteryLevel > 20 ? colors.success : colors.danger}
            />
            <StatusCard
              icon="time"
              title="LAST UPDATE"
              value={formatTime(lastPingTime)}
              valueColor={colors.warning}
              softColor={colors.warningSoft}
              iconColor={colors.warning}
            />
            <StatusCard
              icon="finger-print"
              title="DEVICE"
              value={deviceId ? `...${deviceId.slice(-6)}` : "Unknown"}
              valueColor={colors.warning}
              softColor={colors.warningSoft}
              iconColor={colors.warning}
            />
          </View>

          {/* ── Tracking Toggle ──────────────────────────────────────────────── */}
          <GlassCard>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1, marginRight: 16 }}>
                <View style={styles.toggleLabel}>
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: isTracking
                          ? colors.success
                          : colors.textMuted,
                      },
                    ]}
                  />
                  <Text
                    style={[styles.toggleTitle, { color: colors.text }]}
                  >
                    {isTracking ? "Active" : "Paused"}
                  </Text>
                </View>
                <Text
                  style={[styles.toggleSub, { color: colors.textSecondary }]}
                >
                  {isTracking
                    ? "Location is being shared with your family"
                    : "Tap to enable location sharing"}
                </Text>
              </View>
              <Switch
                value={isTracking}
                onValueChange={handleToggleTracking}
                trackColor={{
                  false: colors.neuInset,
                  true: "rgba(34, 197, 94, 0.35)",
                }}
                thumbColor={isTracking ? colors.success : colors.textMuted}
                ios_backgroundColor={colors.neuInset}
              />
            </View>
          </GlassCard>

          {/* ── Background Mode ─────────────────────────────────────────────── */}
          {appState !== "active" && isTracking && (
            <View style={{ marginTop: 12 }}>
              <GlassCard>
                <View style={styles.bgRow}>
                  <Ionicons
                    name="phone-portrait-outline"
                    size={16}
                    color={colors.warning}
                  />
                  <Text
                    style={[styles.bgText, { color: colors.warning }]}
                  >
                    Tracking continues in background
                  </Text>
                </View>
              </GlassCard>
            </View>
          )}

          {/* ── Footer ──────────────────────────────────────────────────────── */}
          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <View
                style={[
                  styles.footerDot,
                  {
                    backgroundColor: isTracking
                      ? colors.success
                      : colors.textMuted,
                  },
                ]}
              />
              <Text style={[styles.footerText, { color: colors.textMuted }]}>
                {isTracking
                  ? "Background tracking enabled"
                  : "Enable tracking to share your location"}
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  orbContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  orbOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  orbInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 4,
    marginTop: 12,
  },
  orbSub: {
    fontSize: 13,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  toggleTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  toggleSub: {
    fontSize: 13,
    lineHeight: 18,
  },
  bgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  footerText: {
    fontSize: 12,
  },
});
