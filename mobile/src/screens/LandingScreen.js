import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { APP_NAME } from '../utils/constants';
import { typography } from '../utils/typography';

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
        {/* <View style={styles.features}>
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
        </View> */}

        {/* Setup steps */}
        <View
          style={[
            styles.stepsCard,
            {
              backgroundColor: colors.card,
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border,
              shadowColor: colors.neuDark,
            },
          ]}
        >
          <Text style={[styles.stepsHeading, { color: colors.text }]}>
            Get started in 3 steps
          </Text>

          {[
            {
              step: '1',
              icon: 'person-add',
              title: 'Create an account',
              description: 'Sign up at sentinelr.app to access the parent dashboard.',
            },
            {
              step: '2',
              icon: 'people',
              title: 'Add a family member',
              description: 'In the dashboard, create and add members.',
            },
            {
              step: '3',
              icon: 'phone-portrait',
              title: 'Add a device',
              description: 'Register a member\'s device to generate a pairing code, then pair it below.',
            },
          ].map((s) => (
            <View key={s.step} style={styles.stepRow}>
              <View
                style={[
                  styles.stepBadge,
                  { backgroundColor: colors.accentSoft },
                ]}
              >
                <Ionicons name={s.icon} size={18} color={colors.accent} />
              </View>
              <View style={styles.stepText}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>
                  {s.title}
                </Text>
                <Text style={[styles.stepDesc, { color: colors.textMuted }]}>
                  {s.description}
                </Text>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.dashboardBtn, { borderColor: colors.accent }]}
            onPress={() => Linking.openURL('https://sentinelr.app')}
            activeOpacity={0.75}
          >
            <Ionicons name="globe-outline" size={16} color={colors.accent} style={styles.btnIcon} />
            <Text style={[styles.dashboardBtnText, { color: colors.accent }]}>
              Open sentinelr.app
            </Text>
          </TouchableOpacity>
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
            Enter the pairing code generated from the dashboard after adding a device.
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
    ...typography.headingBlack,
    fontSize: 36,
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
    ...typography.bodyBold,
    fontSize: 14,
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

  /* ── Setup steps ──────────────────────────────── */
  stepsCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    marginBottom: 28,
    gap: 16,
    ...(Platform.OS === 'ios'
      ? { shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.9, shadowRadius: 8 }
      : { elevation: 4 }),
  },
  stepsHeading: {
    ...typography.heading,
    fontSize: 15,
    marginBottom: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepText: {
    flex: 1,
  },
  stepTitle: {
    ...typography.bodyBold,
    fontSize: 14,
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  dashboardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 11,
    marginTop: 4,
    gap: 6,
  },
  dashboardBtnText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
