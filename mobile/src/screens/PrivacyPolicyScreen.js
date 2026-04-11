import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NavigationHeader from "../components/NavigationHeader";
import GlassCard from "../components/GlassCard";
import { useTheme } from "../context/ThemeContext";

const LAST_UPDATED = "April 11, 2026";

function Section({ title, children, colors }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
}

export default function PrivacyPolicyScreen({ navigation }) {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <NavigationHeader
          title="Privacy Policy"
          subtitle="How your data is handled"
          onBack={() => navigation.goBack()}
          backLabel="Settings"
          showMenu={false}
        />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }}
          showsVerticalScrollIndicator={false}
        >
          <GlassCard>
            <Text style={[styles.updatedText, { color: colors.textMuted }]}>
              Last updated: {LAST_UPDATED}
            </Text>

            <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
              This Privacy Policy explains how Sentinelr collects, uses, stores,
              and protects information when you use the mobile app and web
              dashboard.
            </Text>

            <Section title="1. Information We Collect" colors={colors}>
              <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                We may collect account details, device identifiers, app diagnostics,
                and location or geofence data when tracking features are enabled.
              </Text>
            </Section>

            <Section title="2. How We Use Information" colors={colors}>
              <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                Data is used to provide safety monitoring, alerts, account
                security, product reliability, and support operations.
              </Text>
            </Section>

            <Section title="3. Sharing and Disclosure" colors={colors}>
              <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                We do not sell personal data. We may share information with trusted
                service providers and when required by law.
              </Text>
            </Section>

            <Section title="4. Data Retention" colors={colors}>
              <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                We retain data only as long as needed for legal, security, and
                service purposes.
              </Text>
            </Section>

            <Section title="5. Your Choices" colors={colors}>
              <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                You can manage permissions, unpair devices, remove devices from
                dashboard view, and request privacy support.
              </Text>
            </Section>

            <Section title="6. Contact" colors={colors}>
              <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                For privacy questions, contact: privacy@sentinelr.app
              </Text>
            </Section>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  updatedText: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 14,
    letterSpacing: 0.4,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
