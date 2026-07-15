import React from "react";
import { Platform } from "react-native";
import { APP_NAME, APP_VERSION } from "../utils/constants";
import InfoPageTemplate from "./InfoPageTemplate";

export default function AboutSentinelrScreen({ navigation }) {
  const isIos = Platform.OS === "ios";

  return (
    <InfoPageTemplate
      navigation={navigation}
      title={`About ${APP_NAME}`}
      subtitle={`Version ${APP_VERSION}`}
      badgeIcon="information-circle-outline"
      badgeColor="#3d09d0"
      intro={isIos
        ? `${APP_NAME} is a child-device safety companion for secure family pairing, location sharing, and emergency alerts.`
        : `${APP_NAME} is a family safety companion for pairing a device with the parent dashboard, keeping location visibility available, and making emergency alerts easier to send.`}
      sections={[
        {
          title: "What Sentinelr Does",
          bullets: [
            "Real-time tracking for paired family devices.",
            "Geofencing alerts when someone enters or leaves a saved zone.",
            "One-tap SOS with the device location when available.",
            isIos
              ? "Pairing controlled by a parent or family administrator."
              : "Dashboard-led setup for family members and device pairing.",
          ],
        },
        {
          title: "Setup Flow",
          body: isIos
            ? "Ask your parent or family administrator for this device's pairing code, then enter or scan it in the app."
            : "Create an account at sentinelr.app, add a family member, register a device, then pair this app using the generated pairing code.",
        },
        {
          title: "App Version",
          body: `${APP_NAME} mobile is currently running version ${APP_VERSION}.`,
        },
      ]}
      actions={isIos
        ? []
        : [
            {
              label: "Open sentinelr.app",
              icon: "globe-outline",
              url: "https://sentinelr.app",
              primary: true,
            },
          ]}
    />
  );
}
