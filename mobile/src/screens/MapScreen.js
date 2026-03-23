import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import NavigationHeader from '../components/NavigationHeader';

export default function MapScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['bottom']}
    >
      <NavigationHeader title="Map" subtitle="Live tracking map" showMenu={false} />

      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 40,
        }}
      >
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Ionicons name="map" size={36} color={colors.warning} />
        </View>
        <Text
          style={{
            color: colors.text,
            fontSize: 20,
            fontWeight: '700',
            marginBottom: 8,
          }}
        >
          Coming Soon
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 13,
            textAlign: 'center',
            lineHeight: 20,
          }}
        >
          The live tracking map will be available in a future update.
        </Text>
      </View>
    </SafeAreaView>
  );
}
