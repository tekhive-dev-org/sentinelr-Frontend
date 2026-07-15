import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../utils/typography';

const SETUP_STEPS = [
  {
    icon: 'person-add',
    title: 'Create an account',
    description: 'Sign up at sentinelr.app to access the parent dashboard.',
  },
  {
    icon: 'people',
    title: 'Add a family member',
    description: 'In the dashboard, create and add members.',
  },
  {
    icon: 'phone-portrait',
    title: 'Add a device',
    description:
      "Register a member's device to generate a pairing code, then pair it below.",
  },
];

export default function SetupInstructions() {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border,
          shadowColor: colors.neuDark,
        },
      ]}
    >
      <Text style={[styles.heading, { color: colors.text }]}>Get started in 3 steps</Text>

      {SETUP_STEPS.map((step) => (
        <View key={step.title} style={styles.row}>
          <View style={[styles.icon, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name={step.icon} size={18} color={colors.accent} />
          </View>
          <View style={styles.copy}>
            <Text style={[styles.title, { color: colors.text }]}>{step.title}</Text>
            <Text style={[styles.description, { color: colors.textMuted }]}>
              {step.description}
            </Text>
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={[styles.dashboardButton, { borderColor: colors.accent }]}
        onPress={() => Linking.openURL('https://sentinelr.app')}
        activeOpacity={0.75}
        accessibilityRole="link"
        accessibilityLabel="Open sentinelr.app"
      >
        <Ionicons name="globe-outline" size={16} color={colors.accent} />
        <Text style={[styles.dashboardButtonText, { color: colors.accent }]}>
          Open sentinelr.app
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    marginBottom: 28,
    gap: 16,
    elevation: 4,
  },
  heading: {
    ...typography.heading,
    fontSize: 15,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  copy: {
    flex: 1,
  },
  title: {
    ...typography.bodyBold,
    fontSize: 14,
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    lineHeight: 17,
  },
  dashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 11,
    marginTop: 4,
    gap: 6,
  },
  dashboardButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
