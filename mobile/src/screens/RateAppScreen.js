import React from "react";
import InfoPageTemplate from "./InfoPageTemplate";

export default function RateAppScreen({ navigation }) {
  return (
    <InfoPageTemplate
      navigation={navigation}
      title="Rate the App"
      subtitle="Share your feedback"
      badgeIcon="star-outline"
      badgeColor="#e6ae12"
      intro="Your feedback helps improve Sentinelr for families who rely on location tracking, geofencing alerts, emergency SOS, and device management."
      sections={[
        {
          title: "Tell Us What Works",
          body: "If Sentinelr is helping your family stay connected, we would love to hear what feels reliable, clear, and useful.",
        },
        {
          title: "Report What Needs Work",
          body: "If something feels confusing or unreliable, send details about the device, platform, and what happened so it can be investigated.",
        },
        {
          title: "Store Reviews",
          body: "The public store listing is not wired in this build yet, so feedback currently opens through email.",
        },
      ]}
      actions={[
        {
          label: "Send Feedback",
          icon: "mail-outline",
          url: "mailto:support@sentinelr.app?subject=Sentinelr%20App%20Feedback",
          primary: true,
        },
      ]}
    />
  );
}
