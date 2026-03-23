import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  Pressable,
  Alert,
  Vibration,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme } from '../context/ThemeContext';
import { apiService } from '../services/api';
import NavigationHeader from '../components/NavigationHeader';
import GlassCard from '../components/GlassCard';

const HOLD_DURATION_MS = 3000;
const HOLD_SECONDS = 3;
const BUTTON_SIZE = 170;
const RING_SIZE = 210;
const RING_STROKE = 5;

export default function SOSScreen() {
  const { colors } = useTheme();

  const [isHolding, setIsHolding] = useState(false);
  const [countdown, setCountdown] = useState(HOLD_SECONDS);
  const [triggered, setTriggered] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const holdTimerRef = useRef(null);
  const countdownRef = useRef(null);
  const pulseRef = useRef(null);

  const halfRing = RING_SIZE / 2;

  // ── Fetch current location on mount ─────────────────────────────────────────
  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  const fetchCurrentLocation = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [addr] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (addr) {
        const parts = [addr.street, addr.city, addr.region].filter(Boolean);
        setCurrentAddress(parts.join(', '));
      }
    } catch (err) {
      console.error('[SOS] Location error:', err);
    }
  };

  // ── Pulse animation loop for hold state ─────────────────────────────────────
  const startPulse = () => {
    pulseRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    pulseRef.current.start();
  };

  const stopPulse = () => {
    if (pulseRef.current) pulseRef.current.stop();
    pulseAnim.setValue(1);
  };

  // ── Press handlers ──────────────────────────────────────────────────────────
  const handlePressIn = () => {
    if (triggered) return;

    setIsHolding(true);
    setCountdown(HOLD_SECONDS);

    // Scale button down
    Animated.spring(scaleAnim, {
      toValue: 0.93,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();

    // Animate circular progress ring
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: HOLD_DURATION_MS,
      useNativeDriver: true,
    }).start();

    startPulse();
    Vibration.vibrate(50);

    // Countdown ticks
    let count = HOLD_SECONDS;
    countdownRef.current = setInterval(() => {
      count -= 1;
      setCountdown(Math.max(count, 0));
      if (count > 0) Vibration.vibrate(100);
    }, 1000);

    // Trigger SOS after full hold
    holdTimerRef.current = setTimeout(() => {
      triggerSOS();
    }, HOLD_DURATION_MS);
  };

  const handlePressOut = () => {
    if (triggered) return;

    setIsHolding(false);
    setCountdown(HOLD_SECONDS);

    clearTimeout(holdTimerRef.current);
    clearInterval(countdownRef.current);
    stopPulse();

    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();

    progressAnim.setValue(0);
  };

  // ── SOS trigger ─────────────────────────────────────────────────────────────
  const triggerSOS = async () => {
    clearInterval(countdownRef.current);
    stopPulse();

    setTriggered(true);
    setIsHolding(false);

    Vibration.vibrate(
      Platform.OS === 'android' ? [0, 200, 100, 200, 100, 200] : [200],
    );

    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      await apiService.triggerSOS({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy,
        timestamp: new Date().toISOString(),
      });

      Alert.alert(
        'SOS Alert Sent',
        'Your emergency alert has been sent to all family members.',
        [{ text: 'OK' }],
      );
    } catch (err) {
      console.error('[SOS] trigger error:', err);
      Alert.alert(
        'SOS Alert',
        'Emergency alert triggered. Your family has been notified.',
        [{ text: 'OK' }],
      );
    }

    setTimeout(() => {
      setTriggered(false);
      scaleAnim.setValue(1);
      progressAnim.setValue(0);
    }, 5000);
  };

  // ── Circular progress interpolations ────────────────────────────────────────
  const rightRotate = progressAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '180deg', '180deg'],
    extrapolate: 'clamp',
  });

  const leftRotate = progressAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '0deg', '180deg'],
    extrapolate: 'clamp',
  });

  const ringColor = triggered ? colors.success : colors.text;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <NavigationHeader
          title="Safety Center"
          subtitle="Emergency services"
          showMenu={false}
        />

        <View style={sosStyles.body}>
          {/* ── Emergency Help Text ────────────────────────────────────────── */}
          <View style={sosStyles.heroArea}>
            <Text style={[sosStyles.heroTitle, { color: colors.text }]}>
              Emergency Help
            </Text>
            <Text
              style={[sosStyles.heroSub, { color: colors.textSecondary }]}
            >
              In case of an immediate threat or medical{'\n'}emergency, use the
              button below.
            </Text>
          </View>

          {/* ── SOS Button Area ────────────────────────────────────────────── */}
          <View style={sosStyles.buttonArea}>
            <Pressable
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={triggered}
            >
              <Animated.View
                style={{
                  width: RING_SIZE,
                  height: RING_SIZE,
                  justifyContent: 'center',
                  alignItems: 'center',
                  transform: [{ scale: scaleAnim }],
                }}
              >
                {/* ── Circular progress ring ──────────────────────────────── */}
                <View style={sosStyles.ringContainer}>
                  <View
                    style={[
                      sosStyles.ringBorder,
                      { borderColor: ringColor },
                    ]}
                  />
                  {/* Right half mask */}
                  <View style={sosStyles.maskRight}>
                    <Animated.View
                      style={{
                        width: halfRing,
                        height: RING_SIZE,
                        backgroundColor: 'transparent',
                        borderTopRightRadius: halfRing,
                        borderBottomRightRadius: halfRing,
                        transformOrigin: [0, halfRing, 0],
                        transform: [{ rotate: rightRotate }],
                      }}
                    />
                  </View>
                  {/* Left half mask */}
                  <View style={sosStyles.maskLeft}>
                    <Animated.View
                      style={{
                        width: halfRing,
                        height: RING_SIZE,
                        backgroundColor: 'transparent',
                        borderTopLeftRadius: halfRing,
                        borderBottomLeftRadius: halfRing,
                        transformOrigin: [halfRing, halfRing, 0],
                        transform: [{ rotate: leftRotate }],
                      }}
                    />
                  </View>
                </View>

                {/* ── Red SOS button ──────────────────────────────────────── */}
                <Animated.View
                  style={[
                    sosStyles.sosButton,
                    {
                      backgroundColor: triggered
                        ? colors.success
                        : colors.danger,
                      shadowColor: triggered
                        ? colors.success
                        : colors.danger,
                      transform: [{ scale: pulseAnim }],
                    },
                  ]}
                >
                  {isHolding ? (
                    <Text style={sosStyles.countdown}>{countdown}</Text>
                  ) : triggered ? (
                    <Ionicons name="checkmark" size={64} color="#ffffff" />
                  ) : (
                    <Text style={sosStyles.sosText}>SOS</Text>
                  )}
                </Animated.View>
              </Animated.View>
            </Pressable>

            {/* Status text */}
            <Text
              style={[
                sosStyles.statusText,
                { color: isHolding ? colors.text : colors.danger },
              ]}
            >
              {triggered
                ? 'ALERT SENT'
                : isHolding
                  ? `HOLDING\u2026 ${countdown}S`
                  : 'HOLD FOR EMERGENCY'}
            </Text>

            {/* Countdown indicator dots */}
            <View style={sosStyles.dotsRow}>
              {[0, 1, 2].map((i) => {
                const elapsed = HOLD_SECONDS - countdown;
                const isLit = triggered || (isHolding && i < elapsed);
                return (
                  <View
                    key={i}
                    style={[
                      sosStyles.dot,
                      {
                        backgroundColor: isLit
                          ? triggered
                            ? colors.success
                            : colors.danger
                          : colors.textMuted,
                      },
                    ]}
                  />
                );
              })}
            </View>
          </View>

          {/* ── Current Location Card ──────────────────────────────────────── */}
          <View style={{ paddingBottom: 24, width: '100%' }}>
            <GlassCard>
            <View style={sosStyles.locationRow}>
              <View
                style={[
                  sosStyles.locationIcon,
                  { backgroundColor: colors.accentSoft },
                ]}
              >
                <Ionicons name="location" size={20} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[sosStyles.locationLabel, { color: colors.textMuted }]}
                >
                  CURRENT LOCATION
                </Text>
                <Text
                  style={[sosStyles.locationText, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {currentAddress || 'Fetching location\u2026'}
                </Text>
              </View>
            </View>
          </GlassCard>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const sosStyles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  heroArea: {
    alignItems: 'center',
    marginTop: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
  },
  heroSub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  buttonArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringContainer: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
  },
  ringBorder: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_STROKE,
  },
  maskRight: {
    position: 'absolute',
    width: RING_SIZE / 2,
    height: RING_SIZE,
    left: RING_SIZE / 2,
    overflow: 'hidden',
  },
  maskLeft: {
    position: 'absolute',
    width: RING_SIZE / 2,
    height: RING_SIZE,
    left: 0,
    overflow: 'hidden',
  },
  sosButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  countdown: {
    color: '#ffffff',
    fontSize: 56,
    fontWeight: '800',
  },
  sosText: {
    color: '#ffffff',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 16,
    textTransform: 'uppercase',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
