import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../../../utils/typography';

function MockHeader({ label, icon, colors, accent }) {
  return (
    <View style={[styles.mockHeader, { borderBottomColor: colors.border }]}>
      <View style={styles.windowDots}>
        <View style={[styles.windowDot, { backgroundColor: colors.danger }]} />
        <View style={[styles.windowDot, { backgroundColor: colors.warning }]} />
        <View style={[styles.windowDot, { backgroundColor: accent }]} />
      </View>
      <View style={styles.mockHeaderTitle}>
        <Ionicons name={icon} size={13} color={accent} />
        <Text style={[styles.mockHeaderText, { color: colors.textSecondary }]}>{label}</Text>
      </View>
    </View>
  );
}

function FamilyVisual({ colors, accent }) {
  const fields = ['Name', 'Email', 'Phone Number', 'Relationship'];

  return (
    <View style={styles.visualBody}>
      <View style={[styles.formIcon, { backgroundColor: `${accent}20` }]}>
        <Ionicons name="person-add" size={23} color={accent} />
      </View>
      <Text style={[styles.visualTitle, { color: colors.text }]}>Add New Family Member</Text>
      <View style={styles.formGrid}>
        {fields.map((field) => (
          <View key={field} style={[styles.formField, { backgroundColor: colors.neuInset }]}>
            <Text style={[styles.formFieldLabel, { color: colors.textMuted }]}>{field}</Text>
          </View>
        ))}
      </View>
      <View style={[styles.mockButton, { backgroundColor: accent }]}>
        <Text style={styles.mockButtonText}>Add Member</Text>
      </View>
    </View>
  );
}

function DeviceVisual({ colors, accent }) {
  return (
    <View style={styles.deviceFormBody}>
      <Text style={[styles.visualTitle, { color: colors.text }]}>Add New Device</Text>
      <View style={[styles.selectionCard, { borderColor: colors.border }]}>
        <Ionicons name="create-outline" size={17} color={accent} />
        <View style={styles.selectionCopy}>
          <Text style={[styles.selectionTitle, { color: colors.text }]}>Device Name</Text>
          <Text style={[styles.selectionSub, { color: colors.textMuted }]}>e.g., John&apos;s iPhone</Text>
        </View>
      </View>
      <View style={styles.osRow}>
        <View style={[styles.osOption, { backgroundColor: `${accent}18`, borderColor: accent }]}>
          <Ionicons name="logo-apple" size={14} color={accent} />
          <Text style={[styles.osText, { color: accent }]}>iOS</Text>
        </View>
        <View style={[styles.osOption, { borderColor: colors.border }]}>
          <Ionicons name="logo-android" size={14} color={colors.textMuted} />
          <Text style={[styles.osText, { color: colors.textMuted }]}>Android</Text>
        </View>
      </View>
      <View style={[styles.selectionCard, { borderColor: colors.border }]}>
        <Ionicons name="person-outline" size={17} color={accent} />
        <View style={styles.selectionCopy}>
          <Text style={[styles.selectionTitle, { color: colors.text }]}>Assign to Member</Text>
          <Text style={[styles.selectionSub, { color: colors.textMuted }]}>Select a member...</Text>
        </View>
        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
      </View>
      <View style={[styles.mockButton, styles.devicePairButton, { backgroundColor: accent }]}>
        <Text style={styles.mockButtonText}>+ Pair device</Text>
      </View>
    </View>
  );
}

function PairingVisual({ colors, accent }) {
  return (
    <View style={styles.visualBody}>
      <View style={[styles.keyIcon, { backgroundColor: `${accent}18` }]}>
        <Ionicons name="key" size={28} color={accent} />
      </View>
      <Text style={[styles.visualTitle, { color: colors.text }]}>Your Pairing Code</Text>
      <View style={[styles.codeCard, { backgroundColor: colors.neuInset, borderColor: colors.border }]}>
        <Text style={[styles.codeText, { color: colors.text }]}>UX5H</Text>
        <Text style={[styles.codeDash, { color: colors.textMuted }]}>—</Text>
        <Text style={[styles.codeText, { color: colors.text }]}>2RTM</Text>
      </View>
      <View style={styles.pairActions}>
        <View style={[styles.smallAction, { borderColor: colors.border }]}>
          <Ionicons name="copy-outline" size={16} color={accent} />
          <Text style={[styles.smallActionText, { color: colors.textSecondary }]}>Copy to clipboard</Text>
        </View>
        <View style={[styles.smallAction, { borderColor: colors.border }]}>
          <Ionicons name="qr-code-outline" size={16} color={accent} />
          <Text style={[styles.smallActionText, { color: colors.textSecondary }]}>Scan QR Code</Text>
        </View>
      </View>
    </View>
  );
}

function PermissionVisual({ colors, accent }) {
  const permissions = [
    ['location', 'Location Access'],
    ['navigate', 'Background Location'],
    ['notifications', 'Notifications'],
  ];

  return (
    <View style={styles.permissionBody}>
      {permissions.map(([icon, label]) => (
        <View key={label} style={[styles.permissionRow, { borderBottomColor: colors.border }]}>
          <View style={[styles.permissionIcon, { backgroundColor: `${accent}16` }]}>
            <Ionicons name={icon} size={18} color={accent} />
          </View>
          <Text style={[styles.permissionLabel, { color: colors.text }]}>{label}</Text>
          <View style={[styles.enableButton, { backgroundColor: `${accent}16` }]}>
            <Text style={[styles.enableButtonText, { color: accent }]}>Enable</Text>
          </View>
        </View>
      ))}
      <View style={[styles.permissionNote, { backgroundColor: `${accent}12` }]}>
        <Ionicons name="information-circle-outline" size={15} color={accent} />
        <Text style={[styles.permissionNoteText, { color: colors.textSecondary }]}>Settings → App Permissions</Text>
      </View>
    </View>
  );
}

function TrackingVisual({ colors, accent }) {
  return (
    <View style={styles.trackingBody}>
      <View style={[styles.liveRingOuter, { borderColor: `${accent}38` }]}>
        <View style={[styles.liveRingInner, { backgroundColor: `${accent}1f`, borderColor: accent }]}>
          <Ionicons name="radio" size={28} color={accent} />
        </View>
      </View>
      <View style={styles.liveLabelRow}>
        <View style={[styles.liveDot, { backgroundColor: accent }]} />
        <Text style={[styles.liveLabel, { color: accent }]}>ACTIVE</Text>
      </View>
      <Text style={[styles.trackingTitle, { color: colors.text }]}>Location sharing is on</Text>
      <View style={[styles.trackingInfo, { backgroundColor: colors.neuInset }]}>
        <Ionicons name="location" size={17} color={accent} />
        <Text style={[styles.coordinates, { color: colors.textSecondary }]}>Location</Text>
        <Text style={[styles.syncText, { color: colors.textMuted }]}>Last Sync</Text>
      </View>
    </View>
  );
}

export default function OnboardingIllustration({ slide, colors, accent }) {
  const content = {
    family: <FamilyVisual colors={colors} accent={accent} />,
    device: <DeviceVisual colors={colors} accent={accent} />,
    pairing: <PairingVisual colors={colors} accent={accent} />,
    permissions: <PermissionVisual colors={colors} accent={accent} />,
    tracking: <TrackingVisual colors={colors} accent={accent} />,
  }[slide.visual];

  return (
    <View
      style={[styles.frame, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.neuDark }]}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <MockHeader label={slide.channel} icon={slide.icon} colors={colors} accent={accent} />
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { borderWidth: 1, borderRadius: 24, minHeight: 246, overflow: 'hidden', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 6 },
  mockHeader: { height: 42, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1 },
  windowDots: { flexDirection: 'row', gap: 5 },
  windowDot: { width: 6, height: 6, borderRadius: 3 },
  mockHeaderTitle: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  mockHeaderText: { ...typography.bodyBold, fontSize: 9, letterSpacing: 1 },
  visualBody: { flex: 1, padding: 18, alignItems: 'center', justifyContent: 'center' },
  formIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginBottom: 7 },
  visualTitle: { ...typography.heading, fontSize: 16, marginBottom: 12 },
  formGrid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 10 },
  formField: { width: '48.5%', borderRadius: 9, paddingHorizontal: 10, paddingVertical: 8 },
  formFieldLabel: { ...typography.bodySemiBold, fontSize: 9 },
  mockButton: { minWidth: 130, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7 },
  mockButtonText: { ...typography.bodyBold, color: '#fff', fontSize: 11 },
  deviceFormBody: { flex: 1, padding: 15, alignItems: 'center', justifyContent: 'center' },
  selectionCard: { width: '100%', borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 9 },
  selectionCopy: { flex: 1 },
  selectionTitle: { ...typography.bodyBold, fontSize: 11 },
  selectionSub: { fontSize: 9, marginTop: 1 },
  osRow: { width: '100%', flexDirection: 'row', gap: 7, marginVertical: 7 },
  osOption: { flex: 1, minHeight: 31, borderWidth: 1, borderRadius: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  osText: { ...typography.bodyBold, fontSize: 9 },
  devicePairButton: { marginTop: 8, paddingVertical: 8 },
  keyIcon: { width: 52, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  codeCard: { width: '100%', borderRadius: 13, borderWidth: 1, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  codeText: { ...typography.bodyBold, fontSize: 19, letterSpacing: 3 },
  codeDash: { fontSize: 17 },
  pairActions: { flexDirection: 'row', gap: 8, marginTop: 9 },
  smallAction: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 5 },
  smallActionText: { ...typography.bodySemiBold, fontSize: 9 },
  permissionBody: { flex: 1, paddingHorizontal: 17, paddingVertical: 10, justifyContent: 'center' },
  permissionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderBottomWidth: 1 },
  permissionIcon: { width: 33, height: 33, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  permissionLabel: { ...typography.bodySemiBold, fontSize: 11, flex: 1 },
  enableButton: { minWidth: 50, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 6, alignItems: 'center' },
  enableButtonText: { ...typography.bodyBold, fontSize: 8.5 },
  permissionNote: { marginTop: 10, borderRadius: 9, padding: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  permissionNoteText: { fontSize: 8.5, flex: 1 },
  trackingBody: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 15 },
  liveRingOuter: { width: 76, height: 76, borderRadius: 38, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  liveRingInner: { width: 58, height: 58, borderRadius: 29, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  liveLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 9 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveLabel: { ...typography.bodyBold, fontSize: 10, letterSpacing: 2 },
  trackingTitle: { ...typography.heading, fontSize: 15, marginTop: 4, marginBottom: 10 },
  trackingInfo: { width: '100%', borderRadius: 11, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 7 },
  coordinates: { ...typography.bodySemiBold, fontSize: 10, flex: 1 },
  syncText: { fontSize: 8.5 },
});
