import React from "react";
import { Platform } from "react-native";
import InfoPageTemplate from "./InfoPageTemplate";

export default function HelpCenterScreen({ navigation }) {
  const isIos = Platform.OS === "ios";

  return (
    <InfoPageTemplate
      navigation={navigation}
      title="Help Center"
      subtitle="Setup and support"
      badgeIcon="help-circle-outline"
      badgeColor="#e6ae12"
      intro={isIos
        ? "Sentinelr helps children stay connected to their family through secure device pairing, location sharing, geofencing alerts, and one-tap SOS."
        : "Sentinelr helps families stay connected through real-time tracking, geofencing alerts, one-tap SOS, and dashboard-based device management."}
      sections={[
        {
          title: "Getting Started",
          bullets: isIos
            ? [
                "Ask your parent or family administrator for a pairing code.",
                "Tap Pair device and enter or scan the code.",
                "Follow the prompts to enable the permissions needed for family safety features.",
              ]
            : [
                "Create an account at sentinelr.app.",
                "Add a family member from the parent dashboard.",
                "Register the member device and use the generated pairing code in this app.",
              ],
        },
        {
          title: "Location Tracking",
          body: isIos
            ? "For live location updates, keep location permission enabled as requested during setup."
            : "For live location updates, keep location permission enabled. On Android, background location should be set to allow all the time for continuous tracking.",
        },
        {
          title: "SOS Alerts",
          body: "Use the SOS screen when urgent help is needed. Sentinelr sends an emergency alert with the current device location when available.",
        },
        {
          title: "Device Management",
          body: isIos
            ? "You can unpair this child device from Settings. Family setup and controls are managed by the parent or family administrator."
            : "You can unpair this device from Settings. The web dashboard remains the main place for adding family members, registering devices, and managing controls.",
        },
      ]}
      actions={[
        ...(!isIos
          ? [
              {
                label: "Open Dashboard",
                icon: "globe-outline",
                url: "https://sentinelr.app",
                primary: true,
              },
            ]
          : []),
        {
          label: "Email Support",
          icon: "mail-outline",
          url: "mailto:support@sentinelr.app",
          primary: isIos,
        },
      ]}
    />
  );
}
