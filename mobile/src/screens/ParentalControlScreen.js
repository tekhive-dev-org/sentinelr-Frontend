import React, { useState, useEffect, useCallback } from 'react';
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
import { apiService } from '../services/api';

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
  const { deviceId } = useDevice();
  const [controls, setControls] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const data = await apiService.getParentalStatus();
      setControls(data.controls || null);
      setActivities(data.activities || []);
    } catch {
      // Controls unavailable — show empty state
      setControls(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

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
  const SectionLabel = ({ label, icon }) => (
    <View style={s.sectionLabelRow}>
      {icon && <Ionicons name={icon} size={14} color={colors.textMuted} style={{ marginRight: 4 }} />}
      <Text style={[s.sectionLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );

  // ── Status Pill ────────────────────────────────────────────────────────
  const StatusPill = ({ active, label }) => (
    <View style={[s.statusPill, { backgroundColor: active ? '#dcfce7' : '#fee2e2' }]}>
      <View style={[s.statusDot, { backgroundColor: active ? '#22c55e' : '#ef4444' }]} />
      <Text style={[s.statusPillText, { color: active ? '#15803d' : '#b91c1c' }]}>{label}</Text>
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
            <Ionicons name="shield-outline" size={56} color={colors.textMuted} />
            <Text style={[s.emptyTitle, { color: colors.text }]}>No Controls Active</Text>
            <Text style={[s.emptySubtitle, { color: colors.textSecondary }]}>
              Parental controls haven&apos;t been set up for this device yet.
            </Text>
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
              <Ionicons name="snow" size={20} color="#fff" />
              <Text style={s.frozenBannerText}>Device is currently frozen</Text>
            </View>
          )}

          {/* ── Monitoring Status ─────────────────────────────────────────── */}
          <SectionLabel label="STATUS" icon="shield-checkmark-outline" />
          <GlassCard>
            <View style={s.statusRow}>
              <Text style={[s.statusLabel, { color: colors.text }]}>Monitoring</Text>
              <StatusPill active={controls.isMonitoring} label={controls.isMonitoring ? 'Active' : 'Inactive'} />
            </View>
          </GlassCard>

          {/* ── Screen Time ───────────────────────────────────────────────── */}
          {st?.enabled && (
            <>
              <SectionLabel label="SCREEN TIME" icon="time-outline" />
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
                        backgroundColor: usedPercent > 90 ? '#ef4444' : usedPercent > 70 ? '#f59e0b' : '#3b82f6',
                      },
                    ]}
                  />
                </View>

                <Text style={[s.remainingText, { color: usedPercent > 90 ? '#ef4444' : '#f59e0b' }]}>
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
              <SectionLabel label="BEDTIME" icon="moon-outline" />
              <GlassCard>
                <View style={s.bedtimeRow}>
                  <View style={s.bedtimeItem}>
                    <Ionicons name="lock-closed" size={16} color="#6366f1" />
                    <Text style={[s.bedtimeLabel, { color: colors.textSecondary }]}>Start lock</Text>
                    <View style={[s.bedtimeBadge, { backgroundColor: colors.neuInset }]}>
                      <Text style={[s.bedtimeValue, { color: colors.text }]}>{bedtime.startTime}</Text>
                    </View>
                  </View>
                  <View style={s.bedtimeItem}>
                    <Ionicons name="lock-open" size={16} color="#22c55e" />
                    <Text style={[s.bedtimeLabel, { color: colors.textSecondary }]}>End lock</Text>
                    <View style={[s.bedtimeBadge, { backgroundColor: colors.neuInset }]}>
                      <Text style={[s.bedtimeValue, { color: colors.text }]}>{bedtime.endTime}</Text>
                    </View>
                  </View>
                </View>
              </GlassCard>
            </>
          )}

          {/* ── App Restrictions ──────────────────────────────────────────── */}
          {appBlocking?.enabled && (
            <>
              <SectionLabel label="APP RESTRICTIONS" icon="apps-outline" />
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
                      <View style={[s.categoryDot, { backgroundColor: cat.enabled ? '#ef4444' : '#22c55e' }]} />
                      <View>
                        <Text style={[s.categoryName, { color: colors.text }]}>{cat.category}</Text>
                        <Text style={[s.categoryMeta, { color: colors.textMuted }]}>
                          {cat.appsDetected} apps · {cat.enabled ? 'Blocked' : 'Allowed'}
                        </Text>
                      </View>
                    </View>
                    <View style={[s.categoryStatusBadge, { backgroundColor: cat.enabled ? '#fee2e2' : '#dcfce7' }]}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: cat.enabled ? '#dc2626' : '#16a34a' }}>
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
              <SectionLabel label="BLOCKED WEBSITES" icon="globe-outline" />
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
                    <Ionicons name="ban" size={16} color="#ef4444" />
                    <Text style={[s.blockedSiteText, { color: colors.text }]}>{site}</Text>
                  </View>
                ))}
              </GlassCard>
            </>
          )}

          {/* ── Recent Activity ───────────────────────────────────────────── */}
          {activities.length > 0 && (
            <>
              <SectionLabel label="RECENT ACTIVITY" icon="pulse-outline" />
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
    app_install: '#22c55e',
    web_blocked: '#ef4444',
    screen_time_limit: '#6366f1',
    app_blocked: '#f59e0b',
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
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Frozen banner
  frozenBanner: {
    backgroundColor: '#ef4444',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  frozenBannerText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  // Status
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Section label
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
    paddingLeft: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },

  // Screen time
  screenTimeHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 4,
  },
  bigValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  targetLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
  },
  remainingText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: 20,
  },
  breakdownItem: {},
  breakdownLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },

  // Bedtime
  bedtimeRow: {
    gap: 12,
  },
  bedtimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bedtimeLabel: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  bedtimeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bedtimeValue: {
    fontSize: 16,
    fontWeight: '700',
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
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryMeta: {
    fontSize: 11,
    marginTop: 1,
  },
  categoryStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
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
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  activityDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  activityText: {
    fontSize: 13,
    lineHeight: 18,
  },
  activityTime: {
    fontSize: 11,
    marginTop: 2,
  },
});
