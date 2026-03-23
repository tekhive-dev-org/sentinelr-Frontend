import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * Neumorphic card component.
 * Creates a raised soft-shadow surface that appears to extrude from the background.
 *
 * Props:
 *  - style        additional container styles
 *  - children     inner content
 *  - noPadding    skip default 16px padding
 *  - inset        render as a pressed-in / concave surface
 */
export default function GlassCard({ style, children, noPadding, inset }) {
  const { colors } = useTheme();

  if (inset) {
    return (
      <View
        style={[
          styles.insetWrapper,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
          style,
        ]}
      >
        <View style={[styles.insetInner, { backgroundColor: colors.neuInset }]}>
          <View style={noPadding ? undefined : styles.content}>{children}</View>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: colors.background,
          shadowColor: colors.neuDark,
          ...(Platform.OS === 'ios'
            ? {
                shadowOffset: { width: 6, height: 6 },
                shadowOpacity: 1,
                shadowRadius: 10,
              }
            : { elevation: 8 }),
        },
        style,
      ]}
    >
      {/* Light shadow highlight layer (top-left) */}
      {Platform.OS === 'ios' && (
        <View
          style={[
            StyleSheet.absoluteFill,
            styles.wrapper,
            {
              backgroundColor: 'transparent',
              shadowColor: colors.neuLight,
              shadowOffset: { width: -4, height: -4 },
              shadowOpacity: 0.7,
              shadowRadius: 8,
            },
          ]}
        />
      )}
      <View style={noPadding ? undefined : styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 18,
    overflow: 'visible',
  },
  insetWrapper: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
  },
  insetInner: {
    borderRadius: 17,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
});
