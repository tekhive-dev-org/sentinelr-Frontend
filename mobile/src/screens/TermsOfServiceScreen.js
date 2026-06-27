import React from "react";
import InfoPageTemplate from "./InfoPageTemplate";

const LAST_UPDATED = "April 11, 2026";

export default function TermsOfServiceScreen({ navigation }) {
  return (
    <InfoPageTemplate
      navigation={navigation}
      title="Terms of Service"
      subtitle="Use of Sentinelr"
      badgeIcon="document-text-outline"
      badgeColor="#64748b"
      updated={LAST_UPDATED}
      intro="These Terms describe the basic rules for using the Sentinelr mobile app and web dashboard. Sentinelr is built for family safety, device pairing, location monitoring, alerts, and parental control workflows."
      sections={[
        {
          title: "1. Account Responsibility",
          body: "You are responsible for keeping your account secure and for ensuring devices are paired only with permission from the appropriate family member or guardian.",
        },
        {
          title: "2. Intended Use",
          body: "Sentinelr should be used for lawful family safety, emergency, and device management purposes. Do not use the service to track someone without proper authority or consent.",
        },
        {
          title: "3. Location and Alerts",
          body: "Location updates, geofence events, and SOS alerts depend on device permissions, network availability, battery state, and operating system background limits.",
        },
        {
          title: "4. Dashboard Controls",
          body: "The web dashboard is used to add family members, register devices, and manage available controls. Some settings may require supported devices, operating system permissions, or backend availability.",
        },
        {
          title: "5. Support",
          body: "For service questions or account support, contact support@sentinelr.app.",
        },
      ]}
    />
  );
}
