import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Switch,
  AppState,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
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

// ── Relative time helper ───────────────────────────────────────────────────
const relativeTime = (date) => {
  if (!date) return "Never";
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 10) return "Just now";
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// ── Stat tile ─────────────────────────────────────────────────────────────
const StatTile = ({ icon, label, children, iconColor, iconBg }) => {
  const { colors } = useTheme();
  return (
    <GlassCard style={styles.tile}>
      <View style={[styles.tileIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={[styles.tileLabel, { color: colors.textMuted }]}>{label}</Text>
      {children}
    </GlassCard>
  );
};

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
  const { colors, isDark } = useTheme();

  const [isCharging, setIsCharging] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const [now, setNow] = useState(Date.now());

  // Pulse animation for the active orb ring
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef(null);

  useEffect(() => {
    if (isTracking) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.9, duration: 900, useNativeDriver: true }),
        ]),
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      pulseAnim.setValue(1);
    }
    return () => pulseLoop.current?.stop();
  }, [isTracking]);

  // Tick "last sync" every 15 seconds so relative time stays fresh
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    initializeTracking();
    loadBattery();

    const batteryLvlSub = Battery.addBatteryLevelListener(({ batteryLevel: lvl }) => {
      updateBattery(Math.round(lvl * 100));
    });
    const batteryStateSub = Battery.addBatteryStateListener(({ batteryState }) => {
      setIsCharging(batteryState === Battery.BatteryState.CHARGING);
    });
    const appStateSub = AppState.addEventListener("change", setAppState);

    return () => {
      batteryLvlSub.remove();
      batteryStateSub.remove();
      appStateSub.remove();
    };
  }, []);

  useEffect(() => {
    isTracking ? startTracking() : stopTracking();
  }, [isTracking]);

  useEffect(() => {
    if (!isTracking) return;
    return locationEvents.onPing((loc) => {
      updateLocation({ latitude: loc.latitude, longitude: loc.longitude, accuracy: loc.accuracy, timestamp: loc.timestamp });
    });
  }, [isTracking]);

  const loadBattery = async () => {
    const [lvl, state] = await Promise.all([
      Battery.getBatteryLevelAsync(),
      Battery.getBatteryStateAsync(),
    ]);
    updateBattery(Math.round(lvl * 100));
    setIsCharging(state === Battery.BatteryState.CHARGING);
  };

  const initializeTracking = async () => {
    try {
      const isRunning = await locationService.isRunning();
      if (isRunning && !isTracking) toggleTracking(true);
      else if (!isRunning && isTracking) toggleTracking(false);
      const loc = await locationService.getCurrentLocation();
      if (loc) updateLocation(loc);
    } catch {}
  };

  const startTracking = async () => {
    try {
      await locationService.start();
      // Pass updateBattery so displayed value === sent value
      heartbeatService.start(undefined, updateBattery);
      updateConnectionStatus("online");
    } catch {
      updateConnectionStatus("offline");
    }
  };

  const stopTracking = async () => {
    try {
      await locationService.stop();
      heartbeatService.stop();
      updateConnectionStatus("offline");
    } catch {}
  };

  // ── Derived values ─────────────────────────────────────────────────────
  const battery = batteryLevel ?? 0;
  const batteryColor =
    battery > 50 ? colors.success : battery > 20 ? colors.warning : colors.danger;
  const batteryBg =
    battery > 50 ? colors.successSoft : battery > 20 ? colors.warningSoft : colors.dangerSoft;

  const hasLocation = !!currentLocation;
  const coordText = hasLocation
    ? `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`
    : "Waiting…";

  const lastSync = relativeTime(lastPingTime);

  const shortId = deviceId ? `···${deviceId.slice(-6)}` : "—";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <NavigationHeader title={APP_NAME} subtitle="Security App" showMenu={false} />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Hero Status Card ─────────────────────────────────────────── */}
          <GlassCard style={styles.hero}>
            {/* Pulsing ring */}
            <View style={styles.orbStack}>
              <Animated.View
                style={[
                  styles.orbPulse,
                  {
                    borderColor: isTracking ? colors.success : "transparent",
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              />
              <View
                style={[
                  styles.orbCore,
                  {
                    backgroundColor: isTracking ? colors.successSoft : colors.neuInset,
                    borderColor: isTracking ? colors.success : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={isTracking ? "radio" : "radio-outline"}
                  size={30}
                  color={isTracking ? colors.success : colors.textMuted}
                />
              </View>
            </View>

            {/* Status label */}
            <View style={styles.heroTextWrap}>
              <View style={styles.statusRow}
              className="mt-3"
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isTracking ? colors.success : colors.textMuted },
                  ]}
                />
                <Text
                
                  style={[
                    styles.statusLabel,
                    { color: isTracking ? colors.success : colors.textMuted },
                  ]}
                >
                  {isTracking ? "ACTIVE" : "PAUSED"}
                </Text>
              </View>
              <Text style={[styles.heroTitle, { color: colors.text }]}>
                {isTracking ? "Location sharing on" : "Location sharing off"}
              </Text>
              <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
                {isTracking
                  ? `Last synced ${lastSync}`
                  : "Enable tracking to share your location"}
              </Text>
            </View>
          </GlassCard>

          {/* ── Stats Grid ───────────────────────────────────────────────── */}
          <View style={styles.grid}>
            {/* Battery */}
            <StatTile
              icon={isCharging ? "battery-charging" : "battery-half"}
              label="BATTERY"
              iconColor={batteryColor}
              iconBg={batteryBg}
            >
              <Text style={[styles.tileValue, { color: batteryLevel !== null ? colors.text : colors.textMuted }]}>
                {batteryLevel !== null ? `${batteryLevel}%` : "—"}
              </Text>
              <View style={[styles.batteryTrack, { backgroundColor: colors.neuInset }]}>
                <View
                  style={[
                    styles.batteryFill,
                    { width: `${battery}%`, backgroundColor: batteryColor },
                  ]}
                />
              </View>
            </StatTile>

            {/* Location */}
            <StatTile
              icon="location"
              label="LOCATION"
              iconColor={colors.accent}
              iconBg={colors.accentSoft}
            >
              <Text
                style={[
                  styles.tileValue,
                  { color: hasLocation ? colors.text : colors.textMuted, fontSize: 11.5 },
                ]}
                numberOfLines={2}
              >
                {coordText}
              </Text>
            </StatTile>

            {/* Last Sync */}
            <StatTile
              icon="time-outline"
              label="LAST SYNC"
              iconColor={colors.warning}
              iconBg={colors.warningSoft}
            >
              <Text style={[styles.tileValue, { color: colors.text }]}>{lastSync}</Text>
            </StatTile>

            {/* Device */}
            <StatTile
              icon="hardware-chip-outline"
              label="DEVICE ID"
              iconColor={colors.textSecondary}
              iconBg={colors.neuInset}
            >
              <Text style={[styles.tileValue, { color: colors.text, fontFamily: "monospace" }]}>
                {shortId}
              </Text>
            </StatTile>
          </View>

          {/* ── Tracking Toggle ──────────────────────────────────────────── */}
          <GlassCard>
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <View style={styles.toggleTitleRow}>
                  <View
                    style={[
                      styles.toggleDot,
                      { backgroundColor: isTracking ? colors.success : colors.textMuted },
                    ]}
                  />
                  <Text style={[styles.toggleTitle, { color: colors.text }]}>
                    Location Sharing
                  </Text>
                </View>
                <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>
                  {isTracking
                    ? "Your family can see your location"
                    : "Tap to start sharing your location"}
                </Text>
              </View>
              <Switch
                value={isTracking}
                onValueChange={() => toggleTracking(!isTracking)}
                trackColor={{ false: colors.neuInset, true: "rgba(34,197,94,0.35)" }}
                thumbColor={isTracking ? colors.success : colors.textMuted}
                ios_backgroundColor={colors.neuInset}
              />
            </View>
          </GlassCard>

          {/* ── SOS Button ───────────────────────────────────────────────── */}
          <TouchableOpacity
            onPress={() => navigation.navigate("SOS")}
            style={[styles.sosBtn, { backgroundColor: colors.dangerSoft, borderColor: colors.danger }]}
            activeOpacity={0.75}
          >
            <Ionicons name="alert-circle" size={20} color={colors.danger} />
            <Text style={[styles.sosBtnText, { color: colors.danger }]}>Emergency Alert</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.danger} style={{ marginLeft: "auto" }} />
          </TouchableOpacity>

          {/* ── Background Notice ────────────────────────────────────────── */}
          {appState !== "active" && isTracking && (
            <View style={[styles.bgBanner, { backgroundColor: colors.warningSoft, borderColor: colors.warning }]}>
              <Ionicons name="phone-portrait-outline" size={14} color={colors.warning} />
              <Text style={[styles.bgBannerText, { color: colors.warning }]}>
                Tracking continues in the background
              </Text>
            </View>
          )}

          {/* ── Footer ───────────────────────────────────────────────────── */}
          <View style={styles.footer}>
            <View style={[styles.footerDot, { backgroundColor: isTracking ? colors.success : colors.textMuted }]} />
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              {APP_NAME} · Secured by TechHive
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 12,
  },

  // Hero
  hero: {
    alignItems: "center",
    paddingTop: 10,
    // paddingBottom: 28,
    gap: 16,
  },
  orbStack: {
    width: 96,
    height: 96,
    alignSelf: "center",
  },
  orbPulse: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 48,
    borderWidth: 2,
  },
  orbCore: {
    position: "absolute",
      top: 12,
      left: 12,
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTextWrap: {
    alignItems: "center",
    gap: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 3,
  },
  heroTitle: {
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  heroSub: {
    fontSize: 13,
    marginTop: 2,
  },

  // Stats grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tile: {
    width: "47.5%",
    gap: 6,
    minHeight: 100,
  },
  tileIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  tileLabel: {
    fontSize: 9.5,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  tileValue: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  batteryTrack: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 4,
  },
  batteryFill: {
    height: "100%",
    borderRadius: 2,
  },

  // Toggle
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  toggleLeft: {
    flex: 1,
    gap: 4,
  },
  toggleTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toggleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  toggleSub: {
    fontSize: 12.5,
    lineHeight: 17,
  },

  // SOS
  sosBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
  },
  sosBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },

  // Background banner
  bgBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  bgBannerText: {
    fontSize: 12.5,
    fontWeight: "500",
  },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 8,
  },
  footerDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  footerText: {
    fontSize: 11.5,
  },
});

