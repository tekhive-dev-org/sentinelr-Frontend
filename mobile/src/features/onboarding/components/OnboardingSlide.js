import React from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../../../utils/typography';
import OnboardingIllustration from './OnboardingIllustration';

const DASHBOARD_URL = 'https://sentinelr.app/dashboard/devices';

export default function OnboardingSlide({ slide, width, colors, accent }) {
  const handleOpenDashboard = async () => {
    try {
      await Linking.openURL(DASHBOARD_URL);
    } catch {
      Alert.alert(
        'Unable to Open Dashboard',
        'Open sentinelr.app, sign in, and select Devices & Users to continue setup.',
      );
    }
  };

  return (
    <ScrollView
      style={[styles.page, { width }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      bounces={false}
      accessibilityLabel={`Step ${slide.step} of 5: ${slide.title}`}
    >
      <View style={styles.copyHeader}>
        <View style={[styles.channelBadge, { backgroundColor: `${accent}16` }]}>
          <Ionicons name={slide.icon} size={14} color={accent} />
          <Text style={[styles.channelText, { color: accent }]}>{slide.channel}</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{slide.title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {slide.description}
        </Text>
      </View>

      <OnboardingIllustration slide={slide} colors={colors} accent={accent} />

      <View style={styles.routeSection}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>WHERE TO GO</Text>
        <View style={styles.breadcrumbRow}>
          {slide.breadcrumb.map((item, index) => (
            <React.Fragment key={item}>
              <View style={[styles.breadcrumbPill, { backgroundColor: colors.neuInset }]}>
                <Text style={[styles.breadcrumbText, { color: colors.textSecondary }]}>{item}</Text>
              </View>
              {index < slide.breadcrumb.length - 1 && (
                <Ionicons name="chevron-forward" size={12} color={colors.textMuted} />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>

      <View style={styles.checklist}>
        {slide.checklist.map((item) => (
          <View key={item} style={styles.checkRow}>
            <View style={[styles.checkIcon, { backgroundColor: `${accent}16` }]}>
              <Ionicons name="checkmark" size={13} color={accent} />
            </View>
            <Text style={[styles.checkText, { color: colors.textSecondary }]}>{item}</Text>
          </View>
        ))}
      </View>

      {slide.canOpenDashboard && (
        <TouchableOpacity
          style={[styles.dashboardLink, { borderColor: colors.border }]}
          onPress={handleOpenDashboard}
          activeOpacity={0.72}
          accessibilityRole="link"
          accessibilityLabel="Open the Sentinelr web dashboard"
        >
          <Ionicons name="globe-outline" size={16} color={accent} />
          <Text style={[styles.dashboardLinkText, { color: accent }]}>Open web dashboard</Text>
          <Ionicons name="open-outline" size={14} color={accent} />
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 16 },
  copyHeader: { alignItems: 'center', marginBottom: 18 },
  channelBadge: { minHeight: 30, borderRadius: 999, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  channelText: { ...typography.bodyBold, fontSize: 9, letterSpacing: 1.3 },
  title: { ...typography.headingBlack, fontSize: 27, lineHeight: 33, textAlign: 'center', letterSpacing: -0.4, marginBottom: 8 },
  description: { fontSize: 13.5, lineHeight: 20, textAlign: 'center', maxWidth: 360 },
  routeSection: { marginTop: 17 },
  sectionLabel: { ...typography.bodyBold, fontSize: 9, letterSpacing: 1.4, marginBottom: 8 },
  breadcrumbRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 5 },
  breadcrumbPill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6 },
  breadcrumbText: { ...typography.bodySemiBold, fontSize: 9 },
  checklist: { marginTop: 13, gap: 8 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  checkIcon: { width: 22, height: 22, borderRadius: 7, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  checkText: { flex: 1, fontSize: 11.5, lineHeight: 17, paddingTop: 2 },
  dashboardLink: { alignSelf: 'flex-start', minHeight: 44, marginTop: 13, borderWidth: 1, borderRadius: 12, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 7 },
  dashboardLinkText: { ...typography.bodyBold, fontSize: 11 },
});
