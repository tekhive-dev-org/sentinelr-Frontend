import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../utils/typography';

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
      <Text style={[styles.heading, { color: colors.text }]}>Pair this child device</Text>

      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: colors.accentSoft }]}>
          <Ionicons name="link" size={19} color={colors.accent} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>Get a pairing code</Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>
            Ask your parent or family administrator for the pairing code assigned to this device.
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: colors.accentSoft }]}>
          <Ionicons name="phone-portrait" size={19} color={colors.accent} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>Pair securely</Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>
            Tap Pair device below, then enter or scan the code to connect this child device.
          </Text>
        </View>
      </View>
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
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
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
});
