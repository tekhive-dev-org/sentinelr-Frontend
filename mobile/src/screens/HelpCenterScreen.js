import React from "react";
import InfoPageTemplate from "./InfoPageTemplate";

export default function HelpCenterScreen({ navigation }) {
  return (
    <InfoPageTemplate
      navigation={navigation}
      title="Help Center"
      subtitle="Setup and support"
      badgeIcon="help-circle-outline"
      badgeColor="#e6ae12"
      intro="Sentinelr helps families stay connected through real-time tracking, geofencing alerts, one-tap SOS, and dashboard-based device management."
      sections={[
        {
          title: "Getting Started",
          bullets: [
            "Create an account at sentinelr.app.",
            "Add a family member from the parent dashboard.",
            "Register the member device and use the generated pairing code in this app.",
          ],
        },
        {
          title: "Location Tracking",
          body: "For live location updates, keep location permission enabled. On Android, background location should be set to allow all the time for continuous tracking.",
        },
        {
          title: "SOS Alerts",
          body: "Use the SOS screen when urgent help is needed. Sentinelr sends an emergency alert with the current device location when available.",
        },
        {
          title: "Device Management",
          body: "You can unpair this device from Settings. The web dashboard remains the main place for adding family members, registering devices, and managing controls.",
        },
      ]}
      actions={[
        {
          label: "Open Dashboard",
          icon: "globe-outline",
          url: "https://sentinelr.app",
          primary: true,
        },
        {
          label: "Email Support",
          icon: "mail-outline",
          url: "mailto:support@sentinelr.app",
        },
      ]}
    />
  );
}
