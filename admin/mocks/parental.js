/**
 * Parental controls mock data for admin oversight.
 * All data is development-only. Replace with real API when available.
 */

export const mockParentalStats = {
  totalFamilies: 340,
  monitoringActive: 285,
  screenTimeEnforced: 260,
  appBlockingActive: 210,
  webFilteringActive: 195,
  bedtimeEnforced: 230,
  devicesFrozen: 4,
};

export const mockParentalFamilies = [
  { id: "fam_1", familyName: "Adeyemi Family", members: 4, monitoringActive: true, screenTimeLimit: { daily: 120, weekdaySchedule: "08:00-21:00", weekendSchedule: "09:00-22:00" }, appBlocking: { enabled: true, blockedCount: 8, categoriesBlocked: ["social_media", "gaming"] }, webFiltering: { enabled: true, blockedSitesCount: 25, safeSearch: true }, bedtime: { enabled: true, start: "21:30", end: "07:00" }, frozenDevices: 0 },
  { id: "fam_2", familyName: "Okonkwo Household", members: 5, monitoringActive: true, screenTimeLimit: { daily: 90, weekdaySchedule: "07:00-20:00", weekendSchedule: "08:00-21:00" }, appBlocking: { enabled: true, blockedCount: 5, categoriesBlocked: ["gaming"] }, webFiltering: { enabled: false, blockedSitesCount: 0, safeSearch: false }, bedtime: { enabled: true, start: "21:00", end: "06:30" }, frozenDevices: 1 },
  { id: "fam_3", familyName: "Mensah Family", members: 3, monitoringActive: false, screenTimeLimit: { daily: 0 }, appBlocking: { enabled: false, blockedCount: 0 }, webFiltering: { enabled: false, blockedSitesCount: 0 }, bedtime: { enabled: false }, frozenDevices: 0 },
  { id: "fam_4", familyName: "Bello Family", members: 6, monitoringActive: true, screenTimeLimit: { daily: 150, weekdaySchedule: "09:00-22:00", weekendSchedule: "10:00-23:00" }, appBlocking: { enabled: true, blockedCount: 12, categoriesBlocked: ["social_media", "gaming", "streaming"] }, webFiltering: { enabled: true, blockedSitesCount: 40, safeSearch: true }, bedtime: { enabled: true, start: "22:00", end: "06:00" }, frozenDevices: 2 },
];

export const mockParentalActivity = [
  { id: "act_1", familyId: "fam_1", familyName: "Adeyemi Family", userName: "Amara Adeyemi", action: "screen_time_exceeded", detail: "Daily limit of 120m reached", timestamp: "2026-07-31T11:30:00Z" },
  { id: "act_2", familyId: "fam_2", familyName: "Okonkwo Household", userName: "Emeka Okonkwo", action: "frozen", detail: "Device frozen by parent", timestamp: "2026-07-31T10:15:00Z" },
  { id: "act_3", familyId: "fam_4", familyName: "Bello Family", userName: "Fatima Bello", action: "app_blocked", detail: "Attempted to open TikTok", timestamp: "2026-07-31T09:45:00Z" },
  { id: "act_4", familyId: "fam_1", familyName: "Adeyemi Family", userName: "Chidi Adeyemi", action: "bedtime_started", detail: "Bedtime mode activated at 21:30", timestamp: "2026-07-30T21:30:00Z" },
  { id: "act_5", familyId: "fam_4", familyName: "Bello Family", userName: "Ibrahim Bello", action: "web_blocked", detail: "Blocked site access attempt", timestamp: "2026-07-30T16:20:00Z" },
];
