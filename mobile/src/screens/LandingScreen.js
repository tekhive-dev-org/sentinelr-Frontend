import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { APP_NAME } from '../utils/constants';

const FEATURES = [
  {
    icon: 'location',
    title: 'Real-time tracking',
    description: "See your family's live location on a map at any time.",
  },
  {
    icon: 'shield-checkmark',
    title: 'Geofencing alerts',
    description: 'Get notified the moment someone enters or leaves a zone.',
  },
  {
    icon: 'alert-circle',
    title: 'One-tap SOS',
    description: 'Send an instant emergency alert with your exact location.',
  },
];

export default function LandingScreen({ navigation }) {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View
            style={[
              styles.iconRing,
              {
                backgroundColor: colors.card,
                shadowColor: colors.neuDark,
                borderColor: isDark
                  ? 'rgba(255,255,255,0.06)'
                  : 'rgba(37,99,235,0.12)',
              },
            ]}
          >
            <Image
              source={require('../../assets/icon.png')}
              style={styles.appIcon}
              resizeMode="contain"
            />
          </View>

          <Text style={[styles.appName, { color: colors.text }]}>
            {APP_NAME}
          </Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Family safety, always on.
          </Text>
        </View>

        {/* Feature list */}
        <View style={styles.features}>
          {FEATURES.map((item) => (
            <View
              key={item.icon}
              style={[
                styles.featureRow,
                {
                  backgroundColor: colors.card,
                  shadowColor: colors.neuDark,
                  borderColor: isDark
                    ? 'rgba(255,255,255,0.05)'
                    : colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: colors.accentSoft },
                ]}
              >
                <Ionicons name={item.icon} size={22} color={colors.accent} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.featureDescription,
                    { color: colors.textMuted },
                  ]}
                >
                  {item.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.cta}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
            onPress={() => navigation.navigate('Pairing')}
            activeOpacity={0.82}
          >
            <Ionicons
              name="link"
              size={18}
              color="#ffffff"
              style={styles.btnIcon}
            />
            <Text style={styles.primaryBtnText}>Pair device</Text>
          </TouchableOpacity>

          <Text style={[styles.hint, { color: colors.textMuted }]}>
            You'll need the pairing code shown on the parent dashboard.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 48,
    paddingBottom: 36,
    justifyContent: 'center',
  },

  /* ── Hero ─────────────────────────────────────── */
  hero: {
    alignItems: 'center',
    marginBottom: 44,
  },
  iconRing: {
    width: 100,
    height: 100,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    ...(Platform.OS === 'ios'
      ? { shadowOffset: { width: 6, height: 6 }, shadowOpacity: 1, shadowRadius: 12 }
      : { elevation: 10 }),
  },
  appIcon: {
    width: 100,
    height: 100,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.1,
  },

  /* ── Features ─────────────────────────────────── */
  features: {
    gap: 12,
    marginBottom: 44,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    ...(Platform.OS === 'ios'
      ? { shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.9, shadowRadius: 8 }
      : { elevation: 4 }),
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    lineHeight: 18,
  },

  /* ── CTA ──────────────────────────────────────── */
  cta: {
    alignItems: 'center',
    gap: 14,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  btnIcon: {
    marginRight: 2,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
});
