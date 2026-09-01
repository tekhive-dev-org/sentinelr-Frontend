import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../../../utils/typography';

function WebBrowserHeader({ url, colors }) {
  return (
    <View style={[styles.browserHeader, { backgroundColor: '#1e293b', borderBottomColor: '#334155' }]}>
      <View style={styles.windowDots}>
        <View style={[styles.windowDot, { backgroundColor: '#ef4444' }]} />
        <View style={[styles.windowDot, { backgroundColor: '#f59e0b' }]} />
        <View style={[styles.windowDot, { backgroundColor: '#10b981' }]} />
      </View>
      <View style={styles.addressBar}>
        <Ionicons name="lock-closed" size={10} color="#94a3b8" />
        <Text style={styles.addressText} numberOfLines={1}>
          {url || 'https://sentinelr.app/dashboard/devices'}
        </Text>
      </View>
      <View style={styles.webTag}>
        <Text style={styles.webTagText}>WEB</Text>
      </View>
    </View>
  );
}

function MobileScreenHeader({ title }) {
  return (
    <View style={styles.mobileHeader}>
      <View style={styles.statusBar}>
        <Text style={styles.statusTime}>9:41</Text>
        <View style={styles.statusIcons}>
          <Ionicons name="cellular" size={11} color="#64748b" />
          <Ionicons name="wifi" size={11} color="#64748b" />
          <Ionicons name="battery-full" size={12} color="#64748b" />
        </View>
      </View>
      <View style={styles.mobileNavRow}>
        <Text style={styles.mobileNavTitle}>{title}</Text>
        <View style={styles.mobileTag}>
          <Text style={styles.mobileTagText}>APP</Text>
        </View>
      </View>
    </View>
  );
}

/* 1. Exactly mirrors web/components/dashboard/user/devices/AddMemberModal.js */
function FamilyVisual() {
  return (
    <View style={styles.webModalContainer}>
      <View style={styles.webModalCard}>
        <View style={styles.webModalHeader}>
          <Text style={styles.webModalTitle}>Add New Family Member</Text>
          <View style={styles.webCloseBtn}>
            <Ionicons name="close" size={14} color="#64748b" />
          </View>
        </View>

        <View style={styles.webFormBody}>
          <View style={styles.webFormGroup}>
            <Text style={styles.webLabel}>Name</Text>
            <View style={styles.webInput}>
              <Text style={styles.webInputValue}>Jane Doe</Text>
            </View>
          </View>

          <View style={styles.webFormGroup}>
            <Text style={styles.webLabel}>Email</Text>
            <View style={styles.webInput}>
              <Text style={styles.webInputValue}>jane.doe@example.com</Text>
            </View>
          </View>

          <View style={styles.webFormRow}>
            <View style={{ flex: 1.2 }}>
              <Text style={styles.webLabel}>Phone Number</Text>
              <View style={styles.webPhoneGroup}>
                <View style={styles.webCountryCode}>
                  <Text style={styles.webCountryCodeText}>🇺🇸 +1</Text>
                </View>
                <View style={[styles.webInput, { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}>
                  <Text style={styles.webInputValue} numberOfLines={1}>555-0199</Text>
                </View>
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.webLabel}>Relationship</Text>
              <View style={[styles.webInput, styles.webSelect]}>
                <Text style={styles.webInputValue}>Child</Text>
                <Ionicons name="chevron-down" size={12} color="#64748b" />
              </View>
            </View>
          </View>

          <View style={styles.webModalFooter}>
            <View style={styles.webBtnSecondary}>
              <Text style={styles.webBtnSecondaryText}>Cancel</Text>
            </View>
            <View style={styles.webBtnPrimary}>
              <Text style={styles.webBtnPrimaryText}>Add Member</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

/* 2. Exactly mirrors web/components/dashboard/user/devices/components/PairingFormStep.js */
function DeviceVisual() {
  return (
    <View style={styles.webCardContainer}>
      <View style={styles.webCard}>
        <Text style={styles.webCardTitle}>Add New Device</Text>
        <Text style={styles.webCardSub}>Enter the device details to start pairing.</Text>

        <View style={styles.webFormGroup}>
          <Text style={styles.webLabel}>Device Name</Text>
          <View style={styles.webInput}>
            <Text style={styles.webInputValue}>Jane&apos;s iPhone</Text>
          </View>
        </View>

        <View style={styles.webFormGroup}>
          <Text style={styles.webLabel}>Device Type</Text>
          <View style={styles.deviceTypeGrid}>
            <View style={[styles.deviceTypeBtn, styles.deviceTypeBtnActive]}>
              <Ionicons name="phone-portrait-outline" size={13} color="#0f172a" />
              <Text style={[styles.deviceTypeBtnText, { color: '#0f172a', fontWeight: '700' }]}>Smartphone</Text>
            </View>
            <View style={[styles.deviceTypeBtn, { opacity: 0.5 }]}>
              <Ionicons name="laptop-outline" size={13} color="#94a3b8" />
              <Text style={[styles.deviceTypeBtnText, { color: '#94a3b8' }]}>Laptop</Text>
            </View>
          </View>
        </View>

        <View style={styles.osSelectionRow}>
          <View style={[styles.osOptionBtn, styles.osOptionBtnActive]}>
            <Ionicons name="logo-apple" size={12} color="#0f172a" />
            <Text style={styles.osOptionTextActive}>iOS (Selected)</Text>
          </View>
          <View style={[styles.osOptionBtn, { opacity: 0.5 }]}>
            <Ionicons name="logo-android" size={12} color="#94a3b8" />
            <Text style={styles.osOptionText}>Android</Text>
          </View>
        </View>

        <View style={styles.webFormGroup}>
          <Text style={styles.webLabel}>Assign to Member</Text>
          <View style={[styles.webInput, styles.webSelect]}>
            <Text style={styles.webInputValue}>Jane Doe (Child)</Text>
            <Ionicons name="chevron-down" size={12} color="#64748b" />
          </View>
        </View>

        <View style={styles.webModalFooter}>
          <View style={styles.webBtnSecondary}>
            <Text style={styles.webBtnSecondaryText}>Cancel</Text>
          </View>
          <View style={styles.webBtnPrimary}>
            <Text style={styles.webBtnPrimaryText}>+ Pair device</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/* 3. Exactly mirrors web/components/dashboard/user/devices/components/PairingCodeStep.js */
function PairingVisual() {
  const codeLetters = ['U', 'X', '5', 'H', '2', 'R', 'T', 'M'];

  return (
    <View style={styles.webCardContainer}>
      <View style={styles.webCard}>
        <Text style={styles.webCardTitle}>Your Pairing Code</Text>
        <Text style={styles.webCardSub}>Enter this code in the mobile app to securely pair.</Text>

        <View style={styles.webCodeRow}>
          {codeLetters.slice(0, 4).map((char, i) => (
            <View key={i} style={styles.webCodeBox}>
              <Text style={styles.webCodeChar}>{char}</Text>
            </View>
          ))}
          <Text style={styles.webCodeDash}>—</Text>
          {codeLetters.slice(4, 8).map((char, i) => (
            <View key={i + 4} style={styles.webCodeBox}>
              <Text style={styles.webCodeChar}>{char}</Text>
            </View>
          ))}
        </View>

        <View style={styles.codeMetaRow}>
          <Text style={styles.refreshLink}>Refresh code</Text>
          <Text style={styles.expiryText}>Code expires in <Text style={{ fontWeight: '700', color: '#0f172a' }}>14:59</Text></Text>
        </View>

        <View style={styles.webCopyBtn}>
          <Ionicons name="copy-outline" size={13} color="#fff" />
          <Text style={styles.webCopyBtnText}>Copy to clipboard</Text>
        </View>

        <View style={styles.webDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.webQrBtn}>
          <Ionicons name="qr-code-outline" size={13} color="#334155" />
          <Text style={styles.webQrBtnText}>Scan QR Code</Text>
        </View>
      </View>
    </View>
  );
}

/* 4. Exactly mirrors Sentinelr mobile app permissions screen */
function PermissionVisual() {
  const permissions = [
    { title: 'Location Access', desc: 'Always Allow', icon: 'location', status: 'Enabled' },
    { title: 'Background Location', desc: 'Track while in background', icon: 'navigate', status: 'Enabled' },
    { title: 'Notifications', desc: 'Instant family safety alerts', icon: 'notifications', status: 'Enabled' },
  ];

  return (
    <View style={styles.mobileCardBody}>
      {permissions.map((item) => (
        <View key={item.title} style={styles.permRow}>
          <View style={styles.permIconBox}>
            <Ionicons name={item.icon} size={15} color="#4f46e5" />
          </View>
          <View style={styles.permInfo}>
            <Text style={styles.permTitle}>{item.title}</Text>
            <Text style={styles.permDesc}>{item.desc}</Text>
          </View>
          <View style={styles.toggleActive}>
            <View style={styles.toggleThumb} />
          </View>
        </View>
      ))}

      <View style={styles.settingsHint}>
        <Ionicons name="information-circle-outline" size={13} color="#6366f1" />
        <Text style={styles.settingsHintText}>Settings → Privacy & Security → Sentinelr</Text>
      </View>
    </View>
  );
}

/* 5. Exactly mirrors Sentinelr mobile app live tracking card */
function TrackingVisual() {
  return (
    <View style={styles.mobileCardBody}>
      <View style={styles.trackingCard}>
        <View style={styles.trackingTopRow}>
          <View style={styles.trackingPulseRow}>
            <View style={styles.activePulseRing}>
              <View style={styles.activePulseDot} />
            </View>
            <Text style={styles.activeStatusText}>ACTIVE</Text>
          </View>
          <View style={styles.toggleActive}>
            <View style={styles.toggleThumb} />
          </View>
        </View>

        <Text style={styles.trackingHeading}>Location sharing is on</Text>
        <Text style={styles.trackingSub}>Real-time family monitoring is active</Text>

        <View style={styles.trackingMetricsRow}>
          <View style={styles.metricTile}>
            <Ionicons name="navigate-circle-outline" size={14} color="#10b981" />
            <Text style={styles.metricLabel}>Live GPS</Text>
            <Text style={styles.metricValue}>Accurate (5m)</Text>
          </View>
          <View style={styles.metricTile}>
            <Ionicons name="sync-outline" size={14} color="#10b981" />
            <Text style={styles.metricLabel}>Last Sync</Text>
            <Text style={styles.metricValue}>Just now</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function OnboardingIllustration({ slide, colors }) {
  const isWebStep = slide.visual === 'family' || slide.visual === 'device' || slide.visual === 'pairing';

  const urls = {
    family: 'https://sentinelr.app/dashboard/devices?tab=users',
    device: 'https://sentinelr.app/dashboard/devices?tab=devices&action=pair',
    pairing: 'https://sentinelr.app/dashboard/devices?step=code',
  };

  const content = {
    family: <FamilyVisual />,
    device: <DeviceVisual />,
    pairing: <PairingVisual />,
    permissions: <PermissionVisual />,
    tracking: <TrackingVisual />,
  }[slide.visual];

  return (
    <View
      style={[styles.frame, { borderColor: '#cbd5e1', backgroundColor: '#f8fafc' }]}
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      {isWebStep ? (
        <WebBrowserHeader url={urls[slide.visual]} colors={colors} />
      ) : (
        <MobileScreenHeader title={slide.visual === 'permissions' ? 'App Permissions' : 'Home'} />
      )}
      <View style={styles.body}>{content}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderWidth: 1.5,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  browserHeader: {
    height: 32,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  windowDots: { flexDirection: 'row', gap: 4, width: 36 },
  windowDot: { width: 6, height: 6, borderRadius: 3 },
  addressBar: {
    flex: 1,
    height: 20,
    marginHorizontal: 6,
    borderRadius: 5,
    backgroundColor: '#0f172a',
    paddingHorizontal: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: { color: '#cbd5e1', fontSize: 8.5, fontFamily: 'Courier', flex: 1 },
  webTag: { backgroundColor: '#3b82f6', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1.5 },
  webTagText: { color: '#fff', fontSize: 7, fontWeight: '800', letterSpacing: 0.5 },

  mobileHeader: { backgroundColor: '#0f172a', paddingHorizontal: 12, paddingTop: 5, paddingBottom: 6 },
  statusBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  statusTime: { color: '#94a3b8', fontSize: 8.5, fontWeight: '700' },
  statusIcons: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  mobileNavRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mobileNavTitle: { color: '#f8fafc', fontSize: 10, fontWeight: '700' },
  mobileTag: { backgroundColor: '#10b981', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1.5 },
  mobileTagText: { color: '#fff', fontSize: 7, fontWeight: '800', letterSpacing: 0.5 },

  body: { padding: 10, backgroundColor: '#f8fafc' },

  /* Web Modal Mirror */
  webModalContainer: { alignItems: 'center' },
  webModalCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 11,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  webModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  webModalTitle: { fontSize: 12, fontWeight: '700', color: '#0f172a' },
  webCloseBtn: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  webFormBody: { gap: 6 },
  webFormGroup: { gap: 2 },
  webFormRow: { flexDirection: 'row', gap: 6 },
  webLabel: { fontSize: 8.5, fontWeight: '600', color: '#475569' },
  webInput: {
    height: 25,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 7,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  webInputValue: { fontSize: 9.5, color: '#0f172a', fontWeight: '500' },
  webPhoneGroup: { flexDirection: 'row' },
  webCountryCode: {
    height: 25,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRightWidth: 0,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    paddingHorizontal: 5,
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  webCountryCodeText: { fontSize: 8.5, color: '#334155', fontWeight: '600' },
  webSelect: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  webModalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 6, marginTop: 4 },
  webBtnSecondary: { height: 24, paddingHorizontal: 9, borderRadius: 6, borderWidth: 1, borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  webBtnSecondaryText: { fontSize: 9, fontWeight: '600', color: '#475569' },
  webBtnPrimary: { height: 24, paddingHorizontal: 11, borderRadius: 6, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  webBtnPrimaryText: { fontSize: 9, fontWeight: '600', color: '#ffffff' },

  /* Web Card Mirror */
  webCardContainer: { alignItems: 'center' },
  webCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 11,
  },
  webCardTitle: { fontSize: 12.5, fontWeight: '700', color: '#0f172a' },
  webCardSub: { fontSize: 8.5, color: '#64748b', marginBottom: 6 },
  deviceTypeGrid: { flexDirection: 'row', gap: 6 },
  deviceTypeBtn: {
    flex: 1,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
  },
  deviceTypeBtnActive: { borderColor: '#0f172a', borderWidth: 1.5, backgroundColor: '#f8fafc' },
  deviceTypeBtnText: { fontSize: 8.5 },
  osSelectionRow: { flexDirection: 'row', gap: 6, marginVertical: 3 },
  osOptionBtn: {
    flex: 1,
    height: 23,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  osOptionBtnActive: { borderColor: '#0f172a', borderWidth: 1.5, backgroundColor: '#f1f5f9' },
  osOptionText: { fontSize: 8.5, color: '#64748b', fontWeight: '500' },
  osOptionTextActive: { fontSize: 8.5, color: '#0f172a', fontWeight: '700' },

  /* Pairing Code Mirror */
  webCodeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginVertical: 6 },
  webCodeBox: {
    width: 26,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webCodeChar: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
  webCodeDash: { fontSize: 13, color: '#94a3b8', marginHorizontal: 2 },
  codeMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  refreshLink: { fontSize: 8.5, color: '#64748b', textDecorationLine: 'underline' },
  expiryText: { fontSize: 8.5, color: '#64748b' },
  webCopyBtn: {
    height: 26,
    backgroundColor: '#1e293b',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  webCopyBtnText: { color: '#fff', fontSize: 9.5, fontWeight: '600' },
  webDivider: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  dividerText: { fontSize: 7.5, color: '#94a3b8', paddingHorizontal: 6, fontWeight: '700' },
  webQrBtn: {
    height: 25,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  webQrBtnText: { color: '#334155', fontSize: 9.5, fontWeight: '600' },

  /* Mobile App Mirror */
  mobileCardBody: { gap: 6 },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  permIconBox: { width: 26, height: 26, borderRadius: 7, backgroundColor: '#ede9fe', alignItems: 'center', justifyContent: 'center' },
  permInfo: { flex: 1 },
  permTitle: { fontSize: 9.5, fontWeight: '700', color: '#0f172a' },
  permDesc: { fontSize: 8, color: '#64748b' },
  toggleActive: { width: 30, height: 17, borderRadius: 9, backgroundColor: '#10b981', padding: 2, justifyContent: 'center', alignItems: 'flex-end' },
  toggleThumb: { width: 13, height: 13, borderRadius: 6.5, backgroundColor: '#ffffff' },
  settingsHint: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 4 },
  settingsHintText: { fontSize: 8, color: '#6366f1', fontWeight: '500' },

  trackingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 9,
  },
  trackingTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  trackingPulseRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  activePulseRing: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#d1fae5', alignItems: 'center', justifyContent: 'center' },
  activePulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' },
  activeStatusText: { fontSize: 9, fontWeight: '800', color: '#10b981', letterSpacing: 1 },
  trackingHeading: { fontSize: 11.5, fontWeight: '700', color: '#0f172a' },
  trackingSub: { fontSize: 8, color: '#64748b', marginBottom: 6 },
  trackingMetricsRow: { flexDirection: 'row', gap: 6 },
  metricTile: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 6,
    alignItems: 'center',
  },
  metricLabel: { fontSize: 7.5, color: '#64748b', fontWeight: '600', marginTop: 1 },
  metricValue: { fontSize: 8.5, fontWeight: '700', color: '#0f172a', marginTop: 1 },
});
