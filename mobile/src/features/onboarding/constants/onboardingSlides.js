export function getOnboardingSlides(platform) {
  const permissionChecklist =
    platform === 'ios'
      ? 'Enable Location Access, Background Location, and Notifications'
      : 'Enable Location Access, Background Location, Notifications, and Parental Control Access';

  return [
    {
      id: 'family-member',
      step: 1,
      channel: 'WEB DASHBOARD',
      icon: 'person-add-outline',
      tone: 'accent',
      title: 'Add a family member',
      description:
        'Sign in to the web dashboard and open Devices & Users. Select the Users/Members tab before adding the person who will use this phone.',
      breadcrumb: ['Devices & Users', 'Users/Members', 'Add Member'],
      checklist: [
        'Select Add Member when the list is empty, or + Add Family Member above the list',
        'Complete Name, Email, Phone Number, and Relationship',
        'Select Add Member to save the profile',
      ],
      visual: 'family',
    },
    {
      id: 'assign-device',
      step: 2,
      channel: 'WEB DASHBOARD',
      icon: 'phone-portrait-outline',
      tone: 'primary',
      title: 'Add and assign the device',
      description:
        'Stay in Devices & Users and select the Devices tab. Start with Pair Device when the list is empty, or + Add Devices when devices already exist.',
      breadcrumb: ['Devices & Users', 'Devices', 'Pair Device'],
      checklist: [
        'In Add New Device, enter the Device Name',
        'Select Smartphone, then choose iOS or Android',
        'Use Assign to Member, then select + Pair device',
      ],
      visual: 'device',
    },
    {
      id: 'pairing-code',
      step: 3,
      channel: 'WEB + MOBILE APP',
      icon: 'key-outline',
      tone: 'warning',
      title: 'Use Your Pairing Code',
      description:
        'After + Pair device, the web dashboard opens Your Pairing Code. Enter that code in this app, paste it, or display the dashboard QR code and scan it here.',
      breadcrumb: ['+ Pair device', 'Your Pairing Code', 'Pair Device'],
      checklist: [
        'On the web, select Copy to clipboard to copy the code',
        'Or select Scan QR Code on the web to display its QR code',
        'In this app, use Pair Device or Scan QR Code',
      ],
      visual: 'pairing',
    },
    {
      id: 'permissions',
      step: 4,
      channel: 'MOBILE APP',
      icon: 'shield-checkmark-outline',
      tone: 'secondary',
      title: 'Enable App Permissions',
      description:
        'Once this phone is paired, open Settings and select App Permissions under Privacy & Security. Enable each access item from that screen.',
      breadcrumb: ['Settings', 'App Permissions', 'Enable'],
      checklist: [
        permissionChecklist,
        'Location Access must be enabled before Background Location',
        'Each permission can be reviewed or changed from device settings',
      ],
      visual: 'permissions',
    },
    {
      id: 'live-tracking',
      step: 5,
      channel: 'MOBILE APP',
      icon: 'navigate-outline',
      tone: 'success',
      title: 'Turn on Location Sharing',
      description:
        'Open Home and turn on the Location Sharing switch. The status changes from PAUSED to ACTIVE and the heading changes to Location sharing on.',
      breadcrumb: ['Home', 'Location Sharing', 'Turn On'],
      checklist: [
        'Confirm that the status reads ACTIVE',
        'Check the Location and Last Sync tiles for updates',
        'Use the same Location Sharing switch to pause sharing',
      ],
      visual: 'tracking',
      canOpenDashboard: true,
    },
  ];
}
