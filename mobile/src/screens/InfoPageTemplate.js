import React from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import NavigationHeader from "../components/NavigationHeader";
import GlassCard from "../components/GlassCard";
import { useTheme } from "../context/ThemeContext";
import { typography } from "../utils/typography";

function Section({ title, body, bullets = [], colors }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {body ? (
        <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
          {body}
        </Text>
      ) : null}
      {bullets.map((item) => (
        <View key={item} style={styles.bulletRow}>
          <View style={[styles.bulletDot, { backgroundColor: colors.accent }]} />
          <Text style={[styles.bodyText, styles.bulletText, { color: colors.textSecondary }]}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function InfoPageTemplate({
  navigation,
  title,
  subtitle,
  badgeIcon,
  badgeColor = "#3d09d0",
  updated,
  intro,
  sections = [],
  actions = [],
}) {
  const { colors } = useTheme();

  const handleAction = async (action) => {
    if (action.onPress) {
      action.onPress();
      return;
    }

    if (!action.url) return;

    try {
      await Linking.openURL(action.url);
    } catch (error) {
      Alert.alert("Unavailable", "This link cannot be opened on this device.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <NavigationHeader
          title={title}
          subtitle={subtitle}
          onBack={() => navigation.goBack()}
          backLabel="Settings"
          showMenu={false}
        />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <GlassCard>
            <View style={[styles.badge, { backgroundColor: `${badgeColor}22` }]}>
              <Ionicons name={badgeIcon} size={26} color={badgeColor} />
            </View>

            {updated ? (
              <Text style={[styles.updatedText, { color: colors.textMuted }]}>
                Last updated: {updated}
              </Text>
            ) : null}

            <Text style={[styles.introText, { color: colors.textSecondary }]}>
              {intro}
            </Text>

            {sections.map((section) => (
              <Section key={section.title} {...section} colors={colors} />
            ))}

            {actions.length > 0 ? (
              <View style={styles.actions}>
                {actions.map((action) => (
                  <TouchableOpacity
                    key={action.label}
                    style={[
                      styles.actionButton,
                      {
                        backgroundColor: action.primary ? colors.accent : colors.card,
                        borderColor: action.primary ? colors.accent : colors.borderLight,
                      },
                    ]}
                    onPress={() => handleAction(action)}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name={action.icon}
                      size={16}
                      color={action.primary ? "#ffffff" : colors.accent}
                    />
                    <Text
                      style={[
                        styles.actionText,
                        { color: action.primary ? "#ffffff" : colors.accent },
                      ]}
                    >
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 10,
  },
  badge: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  updatedText: {
    ...typography.bodySemiBold,
    fontSize: 12,
    marginBottom: 12,
    letterSpacing: 0.4,
  },
  introText: {
    fontSize: 15,
    lineHeight: 23,
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    ...typography.heading,
    fontSize: 16,
    marginBottom: 7,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
  },
  actions: {
    gap: 10,
    marginTop: 22,
  },
  actionButton: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionText: {
    ...typography.bodyBold,
    fontSize: 14,
  },
});
