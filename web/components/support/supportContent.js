export const SUPPORT_SECTIONS = [
  {
    title: "Getting Started",
    items: [
      {
        q: "How do I create a Sentinelr account?",
        a: "Download the Sentinelr mobile app from the App Store or Google Play, or visit our web dashboard at app.sentinelr.app. Click 'Sign Up' and follow the prompts to create your account using your email address or Google account.",
      },
      {
        q: "How do I add family members to my account?",
        a: "From your dashboard, navigate to the 'Users & Family Management' section. Click 'Add Member' and enter their email address. They will receive an invitation to join your Sentinelr family circle.",
      },
      {
        q: "What devices are supported?",
        a: "Sentinelr supports iOS and Android devices. The web dashboard is accessible from any modern browser including Chrome, Safari, Firefox, and Edge.",
      },
    ],
  },
  {
    title: "Parental Controls",
    items: [
      {
        q: "How do I set up screen time limits?",
        a: "Go to the 'Parental Controls' section in your dashboard, select the family member you want to manage, and configure daily screen time limits, bed time schedules, and app-specific restrictions.",
      },
      {
        q: "Can I block specific apps or websites?",
        a: "Yes. In the Parental Controls settings for each family member, you can block specific apps and websites. You can also set content filters by age rating and category.",
      },
      {
        q: "How do content filters work?",
        a: "Content filters automatically block age-inappropriate content based on the age rating you set for each family member. You can customize the filter sensitivity and add specific sites to allow or block lists.",
      },
    ],
  },
  {
    title: "Location & Geofencing",
    items: [
      {
        q: "How accurate is the location tracking?",
        a: "Sentinelr uses GPS, Wi-Fi, and cellular data to provide accurate location tracking. Accuracy can vary based on device settings, signal strength, and environmental factors, but is typically within 10-50 meters.",
      },
      {
        q: "How do I create a geofence?",
        a: "From the Geofencing section of your dashboard, click 'Create Geofence' and draw a boundary on the map. You can set it as a safe zone or restricted zone, and configure alerts for when family members enter or leave the area.",
      },
      {
        q: "Do geofence alerts work in real time?",
        a: "Yes. Geofence alerts are triggered in real time when a family member crosses a boundary. You'll receive a notification on your device and see the alert in your dashboard.",
      },
    ],
  },
  {
    title: "SOS & Emergency Alerts",
    items: [
      {
        q: "How does the SOS button work?",
        a: "When a family member presses the SOS button in the mobile app, an immediate alert is sent to all guardians in the family circle. The alert includes the user's current location and continues to update until the alert is resolved.",
      },
      {
        q: "Can I customize who receives SOS alerts?",
        a: "Yes. In the SOS Alert settings, you can configure which guardians receive alerts and whether alerts are sent via push notification, email, or both.",
      },
      {
        q: "What happens if the phone is offline?",
        a: "If a device loses connectivity, the last known location is saved. Once the device reconnects, any queued alerts will be delivered. We recommend setting up emergency contacts as a backup.",
      },
    ],
  },
  {
    title: "Account & Billing",
    items: [
      {
        q: "How do I change my subscription plan?",
        a: "Go to the Subscription section in your dashboard to view available plans and upgrade or downgrade. Changes take effect at the start of your next billing cycle.",
      },
      {
        q: "How do I reset my password?",
        a: "Click 'Forgot Password' on the login screen. Enter your email address and we'll send you a password reset link. For security, the link expires after 1 hour.",
      },
      {
        q: "Can I delete my account?",
        a: "Yes. Contact our support team at support@sentinelr.app to request account deletion. Please note that all associated data will be permanently removed within 30 days of your request.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards (Visa, Mastercard, American Express) as well as Apple Pay and Google Pay for mobile subscriptions.",
      },
    ],
  },
  {
    title: "Troubleshooting",
    items: [
      {
        q: "The app is not showing my family member's location.",
        a: "Make sure location services are enabled on their device and that the Sentinelr app has location permissions set to 'Always'. Also check that the device has an active internet connection.",
      },
      {
        q: "I'm not receiving notifications.",
        a: "Check that notifications are enabled for Sentinelr in your device settings. Also verify that notification settings within the app are configured correctly for each alert type.",
      },
      {
        q: "The web dashboard is loading slowly.",
        a: "Try clearing your browser cache and cookies, or using a different browser. Ensure you have a stable internet connection. If issues persist, contact our support team.",
      },
    ],
  },
];
