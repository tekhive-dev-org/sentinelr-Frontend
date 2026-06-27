import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useDevice } from '../context/DeviceContext';
import NavigationHeader from '../components/NavigationHeader';
import GlassCard from '../components/GlassCard';
import { typography } from '../utils/typography';

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatMinutes(mins) {
  if (!mins && mins !== 0) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function timeAgo(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ParentalControlScreen() {
  const { colors } = useTheme();
  const { parentalControls: controls, parentalActivities: activities, parentalSyncError, syncParentalControls, isPaired } = useDevice();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await syncParentalControls().catch(() => {});
    setRefreshing(false);
  };

  const loading = isPaired && controls === null && parentalSyncError === null;

  const st = controls?.screenTimeLimit;
  const bedtime = controls?.bedtime;
  const quickPause = controls?.quickPause;
  const appBlocking = controls?.appBlocking;
  const webFilter = controls?.webFiltering;
  const isFrozen = quickPause?.isDeviceFrozen;

  const usedPercent = st?.dailyLimit
    ? Math.min(100, Math.round(((st.usedToday || 0) / st.dailyLimit) * 100))
    : 0;

  // ── Section Label ──────────────────────────────────────────────────────
  const SectionLabel = ({ label }) => (
    <View style={s.sectionLabelRow}>
      <View style={s.sectionLabelBar} />
      <Text style={s.sectionLabel}>{label}</Text>
    </View>
  );

  // ── Status Pill ────────────────────────────────────────────────────────
  const StatusPill = ({ active, label }) => (
    <View style={[
      s.statusPill,
      active
        ? { backgroundColor: '#fff8e8', borderColor: '#f3d476' }
        : { backgroundColor: '#fff0f1', borderColor: '#f4a6ad' },
    ]}>
      <View style={[s.statusDot, { backgroundColor: active ? '#e6ae12' : '#dc323f' }]} />
      <Text style={[s.statusPillText, { color: active ? '#b98b0e' : '#a92731' }]}>{label}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
          <NavigationHeader title="Parental Controls" subtitle="Protection status" showMenu={false} />
          <View style={s.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[s.loadingText, { color: colors.textMuted }]}>Loading controls…</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!controls) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
          <NavigationHeader title="Parental Controls" subtitle="Protection status" showMenu={false} />
          <View style={s.centered}>
            {parentalSyncError === 'auth' ? (
              <>
                <Ionicons name="key-outline" size={56} color="#e6ae12" />
                <Text style={[s.emptyTitle, { color: colors.text }]}>Session Expired</Text>
                <Text style={[s.emptySubtitle, { color: colors.textSecondary }]}>
                  Your device session has expired. Ask a parent to unpair and re-pair this device to restore parental control visibility.
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="shield-outline" size={56} color={colors.textMuted} />
                <Text style={[s.emptyTitle, { color: colors.text }]}>No Controls Active</Text>
                <Text style={[s.emptySubtitle, { color: colors.textSecondary }]}>
                  Parental controls haven&apos;t been set up for this device yet.
                </Text>
              </>
            )}
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <NavigationHeader title="Parental Controls" subtitle="Protection status" showMenu={false} />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          {/* ── Device Frozen Banner ──────────────────────────────────────── */}
          {isFrozen && (
            <View style={s.frozenBanner}>
              <View style={s.frozenBannerIcon}>
                <Ionicons name="snow" size={18} color="#fff" />
              </View>
              <Text style={s.frozenBannerText}>Device is currently frozen</Text>
            </View>
          )}

          {/* ── Monitoring Status ─────────────────────────────────────────── */}
          <SectionLabel label="STATUS" />
          <GlassCard>
            <View style={s.statusRow}>
              <Text style={[s.statusLabel, { color: colors.text }]}>Monitoring</Text>
              <StatusPill active={controls.isMonitoring} label={controls.isMonitoring ? 'Active' : 'Inactive'} />
            </View>
          </GlassCard>

          {/* ── Screen Time ───────────────────────────────────────────────── */}
          {st?.enabled && (
            <>
              <SectionLabel label="SCREEN TIME" />
              <GlassCard>
                <View style={s.screenTimeHeader}>
                  <Text style={[s.bigValue, { color: colors.text }]}>{formatMinutes(st.usedToday)}</Text>
                  <Text style={[s.targetLabel, { color: colors.textSecondary }]}>
                    of {formatMinutes(st.dailyLimit)}
                  </Text>
                </View>

                {/* Progress bar */}
                <View style={[s.progressTrack, { backgroundColor: colors.neuInset }]}>
                  <View
                    style={[
                      s.progressFill,
                      {
                        width: `${usedPercent}%`,
                        backgroundColor:
                          usedPercent > 90 ? '#dc323f'
                          : usedPercent > 70 ? '#e6ae12'
                          : '#e06f29',
                      },
                    ]}
                  />
                </View>

                <Text style={[s.remainingText, { color: usedPercent > 90 ? '#dc323f' : '#e6ae12' }]}>
                  {formatMinutes(st.remaining)} remaining
                </Text>

                {/* Breakdown */}
                {st.breakdown && (
                  <View style={s.breakdownRow}>
                    {Object.entries(st.breakdown).slice(0, 3).map(([key, val]) => (
                      <View key={key} style={s.breakdownItem}>
                        <Text style={[s.breakdownLabel, { color: colors.textMuted }]}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Text>
                        <Text style={[s.breakdownValue, { color: colors.text }]}>{formatMinutes(val)}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </GlassCard>
            </>
          )}

          {/* ── Bedtime ───────────────────────────────────────────────────── */}
          {bedtime?.enabled && (
            <>
              <SectionLabel label="BEDTIME" />
              <GlassCard>
                <View style={s.bedtimeRow}>
                  <View style={s.bedtimeItem}>
                    <View style={[s.bedtimeIconBadge, { backgroundColor: 'rgba(99,102,241,0.1)' }]}>
                      <Ionicons name="lock-closed" size={14} color="#3d09d0" />
                    </View>
                    <Text style={[s.bedtimeLabel, { color: colors.textSecondary }]}>Start lock</Text>
                    <View style={s.bedtimeBadge}>
                      <Text style={s.bedtimeValue}>{bedtime.startTime}</Text>
                    </View>
                  </View>
                  <View style={s.bedtimeItem}>
                    <View style={[s.bedtimeIconBadge, { backgroundColor: 'rgba(22,163,74,0.1)' }]}>
                      <Ionicons name="lock-open" size={14} color="#e6ae12" />
                    </View>
                    <Text style={[s.bedtimeLabel, { color: colors.textSecondary }]}>End lock</Text>
                    <View style={s.bedtimeBadge}>
                      <Text style={s.bedtimeValue}>{bedtime.endTime}</Text>
                    </View>
                  </View>
                </View>
              </GlassCard>
            </>
          )}

          {/* ── App Restrictions ──────────────────────────────────────────── */}
          {appBlocking?.enabled && (
            <>
              <SectionLabel label="APP RESTRICTIONS" />
              <GlassCard noPadding>
                {(appBlocking.categoryBlocked || []).map((cat, idx) => (
                  <View
                    key={cat.category}
                    style={[
                      s.appCategoryRow,
                      idx < (appBlocking.categoryBlocked.length - 1) && {
                        borderBottomWidth: 1,
                        borderColor: colors.borderLight,
                      },
                    ]}
                  >
                    <View style={s.appCategoryLeft}>
                      <View style={[s.categoryDot, { backgroundColor: cat.enabled ? '#dc323f' : '#e6ae12' }]} />
                      <View>
                        <Text style={[s.categoryName, { color: colors.text }]}>{cat.category}</Text>
                        <Text style={[s.categoryMeta, { color: colors.textMuted }]}>
                          {cat.appsDetected} apps · {cat.enabled ? 'Blocked' : 'Allowed'}
                        </Text>
                      </View>
                    </View>
                    <View style={[s.categoryStatusBadge, { backgroundColor: cat.enabled ? '#fff0f1' : '#fff8e8' }]}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: cat.enabled ? '#dc323f' : '#e6ae12', letterSpacing: 0.3 }}>
                        {cat.enabled ? 'BLOCKED' : 'OK'}
                      </Text>
                    </View>
                  </View>
                ))}
              </GlassCard>
            </>
          )}

          {/* ── Web Filtering ─────────────────────────────────────────────── */}
          {webFilter?.enabled && webFilter.blockedSites?.length > 0 && (
            <>
              <SectionLabel label="BLOCKED WEBSITES" />
              <GlassCard noPadding>
                {webFilter.blockedSites.map((site, idx) => (
                  <View
                    key={site}
                    style={[
                      s.blockedSiteRow,
                      idx < webFilter.blockedSites.length - 1 && {
                        borderBottomWidth: 1,
                        borderColor: colors.borderLight,
                      },
                    ]}
                  >
                    <Ionicons name="ban" size={16} color="#dc323f" />
                    <Text style={[s.blockedSiteText, { color: colors.text }]}>{site}</Text>
                  </View>
                ))}
              </GlassCard>
            </>
          )}

          {/* ── Recent Activity ───────────────────────────────────────────── */}
          {activities.length > 0 && (
            <>
              <SectionLabel label="RECENT ACTIVITY" />
              <GlassCard noPadding>
                {activities.map((act, idx) => (
                  <View
                    key={act.id || idx}
                    style={[
                      s.activityRow,
                      idx < activities.length - 1 && {
                        borderBottomWidth: 1,
                        borderColor: colors.borderLight,
                      },
                    ]}
                  >
                    <View style={[s.activityDot, { backgroundColor: getActivityColor(act.type) }]}>
                      <Ionicons name={getActivityIcon(act.type)} size={12} color="#fff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.activityText, { color: colors.text }]} numberOfLines={2}>
                        {act.description}
                      </Text>
                      <Text style={[s.activityTime, { color: colors.textMuted }]}>
                        {timeAgo(act.timestamp)}
                      </Text>
                    </View>
                  </View>
                ))}
              </GlassCard>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Activity icon/color helpers ──────────────────────────────────────────────
function getActivityIcon(type) {
  const map = {
    app_install: 'download-outline',
    web_blocked: 'ban',
    screen_time_limit: 'time-outline',
    app_blocked: 'lock-closed-outline',
  };
  return map[type] || 'information-circle-outline';
}

function getActivityColor(type) {
  const map = {
    app_install: '#e6ae12',
    web_blocked: '#dc323f',
    screen_time_limit: '#e06f29',
    app_blocked: '#e6ae12',
  };
  return map[type] || '#6b7280';
}

// ── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  loadingText: {
    ...typography.bodyMedium,
    fontSize: 13,
    marginTop: 8,
  },
  emptyTitle: {
    ...typography.heading,
    fontSize: 18,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Frozen banner
  frozenBanner: {
    backgroundColor: '#dc323f',
    borderRadius: 14,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
    shadowColor: '#dc323f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  frozenBannerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frozenBannerText: {
    ...typography.bodyBold,
    color: '#fff',
    fontSize: 15,
    letterSpacing: 0.2,
  },

  // Status
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    ...typography.bodyBold,
    fontSize: 15,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusPillText: {
    ...typography.bodyBold,
    fontSize: 12,
  },

  // Section label
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 26,
    marginBottom: 10,
    paddingLeft: 2,
    gap: 7,
  },
  sectionLabelBar: {
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: '#e06f29',
  },
  sectionLabel: {
    ...typography.bodyBold,
    fontSize: 11,
    letterSpacing: 1.3,
    color: '#e06f29',
  },

  // Screen time
  screenTimeHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 4,
  },
  bigValue: {
    ...typography.headingBlack,
    fontSize: 34,
    letterSpacing: -1,
  },
  targetLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  progressTrack: {
    width: '100%',
    height: 9,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
  },
  remainingText: {
    ...typography.bodyBold,
    fontSize: 12,
    marginTop: 6,
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0ece9',
    marginTop: 4,
  },
  breakdownItem: {},
  breakdownLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  breakdownValue: {
    ...typography.bodyBold,
    fontSize: 14,
    marginTop: 2,
  },

  // Bedtime
  bedtimeRow: {
    gap: 10,
  },
  bedtimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f6f3f2',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#f0ece9',
  },
  bedtimeIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bedtimeLabel: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  bedtimeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#e06f29',
  },
  bedtimeValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },

  // App restrictions
  appCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  appCategoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
  },
  categoryMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  categoryStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
  },

  // Blocked sites
  blockedSiteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  blockedSiteText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Recent activity
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  activityDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  activityText: {
    fontSize: 13,
    lineHeight: 19,
  },
  activityTime: {
    fontSize: 11,
    marginTop: 3,
    fontWeight: '500',
  },
});
