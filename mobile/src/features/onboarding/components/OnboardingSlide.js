import React from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../../../utils/typography';
import OnboardingIllustration from './OnboardingIllustration';

const DASHBOARD_URL = 'https://sentinelr.app/dashboard/devices';

export default function OnboardingSlide({ slide, width, colors, accent, isLastSlide, onSkip }) {
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
      <View style={styles.headerSection}>
        <View style={styles.titleRow}>
          <Text style={[styles.guideHeading, { color: colors.text }]}>Setup Guide</Text>
          {!isLastSlide && onSkip ? (
            <TouchableOpacity
              style={[styles.skipButton, { backgroundColor: colors.neuInset, borderColor: colors.border }]}
              onPress={onSkip}
              activeOpacity={0.72}
              accessibilityRole="button"
              accessibilityLabel="Skip setup guide"
            >
              <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>Skip</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={[styles.stepSubtitle, { color: colors.text }]}>
          Step {slide.step}: {slide.title}
        </Text>
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
                <Ionicons name="chevron-forward" size={11} color={colors.textMuted} />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>

      <View style={styles.checklist}>
        {slide.checklist.map((item) => (
          <View key={item} style={styles.checkRow}>
            <View style={[styles.checkIcon, { backgroundColor: `${accent}16` }]}>
              <Ionicons name="checkmark" size={12} color={accent} />
            </View>
            <Text style={[styles.checkText, { color: colors.textSecondary }]}>{item}</Text>
          </View>
        ))}
      </View>

      {slide.canOpenDashboard && (
        <TouchableOpacity
          style={[styles.dashboardLink, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleOpenDashboard}
          activeOpacity={0.75}
          accessibilityRole="link"
          accessibilityLabel="Open the Sentinelr web dashboard"
        >
          <View style={[styles.dashboardIconCircle, { backgroundColor: `${accent}18` }]}>
            <Ionicons name="globe-outline" size={20} color={accent} />
          </View>
          <View style={styles.dashboardLinkCopy}>
            <Text style={[styles.dashboardLinkTitle, { color: colors.text }]}>Open Web Dashboard</Text>
            <Text style={[styles.dashboardLinkSub, { color: colors.textMuted }]}>sentinelr.app/dashboard</Text>
          </View>
          <Ionicons name="open-outline" size={18} color={accent} />
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 6, paddingBottom: 6 },
  headerSection: { marginBottom: 14, paddingTop: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  guideHeading: { ...typography.headingBlack, fontSize: 26, lineHeight: 32, letterSpacing: -0.5 },
  skipButton: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 34, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1 },
  skipButtonText: { ...typography.bodyBold, fontSize: 13 },
  stepSubtitle: { ...typography.bodyBold, fontSize: 14.5, lineHeight: 20, marginTop: 2, marginBottom: 4 },
  description: { fontSize: 12.5, lineHeight: 18 },
  routeSection: { marginTop: 14 },
  sectionLabel: { ...typography.bodyBold, fontSize: 8.5, letterSpacing: 1.3, marginBottom: 6 },
  breadcrumbRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  breadcrumbPill: { borderRadius: 7, paddingHorizontal: 7, paddingVertical: 5 },
  breadcrumbText: { ...typography.bodySemiBold, fontSize: 8.5 },
  checklist: { marginTop: 10, gap: 7 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  checkIcon: { width: 20, height: 20, borderRadius: 6, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  checkText: { flex: 1, fontSize: 11, lineHeight: 16, paddingTop: 1 },
  dashboardLink: { marginTop: 'auto', marginBottom: 4, borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', gap: 12 },
  dashboardIconCircle: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dashboardLinkCopy: { flex: 1 },
  dashboardLinkTitle: { ...typography.bodyBold, fontSize: 15, lineHeight: 20 },
  dashboardLinkSub: { fontSize: 11.5, marginTop: 2 },
});
