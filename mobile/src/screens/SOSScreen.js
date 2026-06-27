import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Animated,
  Pressable,
  Vibration,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme } from '../context/ThemeContext';
import { apiService } from '../services/api';
import { storageService } from '../services/storageService';
import NavigationHeader from '../components/NavigationHeader';
import GlassCard from '../components/GlassCard';
import { typography } from '../utils/typography';

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
  const [toast, setToast] = useState(null); // { message, type: 'success'|'error'|'warning' }

  const toastAnim = useRef(new Animated.Value(0)).current;
  const toastTimerRef = useRef(null);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const holdTimerRef = useRef(null);
  const countdownRef = useRef(null);
  const pulseRef = useRef(null);

  const halfRing = RING_SIZE / 2;

  const showToast = useCallback((message, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastAnim.setValue(0);
    Animated.spring(toastAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();
    toastTimerRef.current = setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToast(null));
    }, 4000);
  }, [toastAnim]);

  // ΓöÇΓöÇ Fetch current location on mount ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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

  // ΓöÇΓöÇ Pulse animation loop for hold state ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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

  // ΓöÇΓöÇ Press handlers ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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

  // ΓöÇΓöÇ SOS trigger ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const triggerSOS = async () => {
    clearInterval(countdownRef.current);
    stopPulse();

    setTriggered(true);
    setIsHolding(false);

    Vibration.vibrate(
      Platform.OS === 'android' ? [0, 200, 100, 200, 100, 200] : [200],
    );

    try {
      // Verify device is still paired and not deleted before sending
      const isActive = await storageService.checkDeviceActive();
      if (!isActive) {
        showToast('Device unpaired. Please re-pair to use SOS.', 'warning');
        setTriggered(false);
        scaleAnim.setValue(1);
        progressAnim.setValue(0);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const result = await apiService.triggerSOS({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        message: 'Emergency SOS triggered',
      });

      const toastMsg = result?.message || 'Alert sent to all family members.';
      showToast(toastMsg, 'success');
    } catch (err) {
      console.error('[SOS] trigger error:', err);
      setTriggered(false);
      scaleAnim.setValue(1);
      progressAnim.setValue(0);
      showToast('Failed to send alert.', 'error');
    }

    setTimeout(() => {
      setTriggered(false);
      scaleAnim.setValue(1);
      progressAnim.setValue(0);
    }, 5000);
  };

  // ΓöÇΓöÇ Circular progress interpolations ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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

  const toastBg =
    toast?.type === 'success' ? colors.success :
    toast?.type === 'error'   ? colors.danger :
    colors.warning;

  const toastIcon =
    toast?.type === 'success' ? 'checkmark-circle' :
    toast?.type === 'error'   ? 'close-circle' :
    'warning';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Toast Banner ── */}
      {toast && (
        <Animated.View
          style={[
            sosStyles.toast,
            { backgroundColor: toastBg },
            {
              opacity: toastAnim,
              transform: [{
                translateY: toastAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              }],
            },
          ]}
        >
          <Ionicons name={toastIcon} size={18} color="#fff" />
          <Text style={sosStyles.toastText}>{toast.message}</Text>
        </Animated.View>
      )}

      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <NavigationHeader
          title="Safety Center"
          subtitle="Emergency services"
          showMenu={false}
        />

        <View style={sosStyles.body}>
          {/* ΓöÇΓöÇ Emergency Help Text ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
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

          {/* ΓöÇΓöÇ SOS Button Area ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
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
                {/* ΓöÇΓöÇ Circular progress ring ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
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

                {/* ΓöÇΓöÇ Red SOS button ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
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

          {/* ΓöÇΓöÇ Current Location Card ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
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
    ...typography.headingBlack,
    fontSize: 28,
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
    ...typography.bodyBold,
    color: '#ffffff',
    fontSize: 56,
  },
  sosText: {
    ...typography.headingBlack,
    color: '#ffffff',
    fontSize: 42,
    letterSpacing: 6,
  },
  statusText: {
    ...typography.bodyBold,
    fontSize: 14,
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
    ...typography.bodyBold,
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '500',
  },
  toast: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  toastText: {
    ...typography.bodySemiBold,
    flex: 1,
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
});
