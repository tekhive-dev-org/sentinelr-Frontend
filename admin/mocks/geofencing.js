/**
 * Geofencing mock data for admin oversight.
 * All data is development-only. Replace with real API when available.
 */

const families = [
  { id: "fam_1", name: "Adeyemi Family", members: 4, activeZones: 3 },
  { id: "fam_2", name: "Okonkwo Household", members: 5, activeZones: 2 },
  { id: "fam_3", name: "Mensah Family", members: 3, activeZones: 4 },
  { id: "fam_4", name: "Bello Family", members: 6, activeZones: 1 },
];

export const mockGeofenceZones = [
  { id: "geo_1", name: "Home", type: "safe_zone", familyId: "fam_1", familyName: "Adeyemi Family", address: "12 Marina Road, Lagos", center: { lat: 6.45, lng: 3.39 }, radius: 250, isActive: true, entryEvents: 45, exitEvents: 38, createdAt: "2026-01-15T08:00:00Z" },
  { id: "geo_2", name: "School", type: "safe_zone", familyId: "fam_1", familyName: "Adeyemi Family", address: "45 Education Ave, Ikeja", center: { lat: 6.60, lng: 3.34 }, radius: 500, isActive: true, entryEvents: 120, exitEvents: 115, createdAt: "2026-01-15T08:00:00Z" },
  { id: "geo_3", name: "Market District", type: "danger_zone", familyId: "fam_1", familyName: "Adeyemi Family", address: "Balogun Market, Lagos Island", center: { lat: 6.45, lng: 3.39 }, radius: 1000, isActive: true, entryEvents: 3, exitEvents: 3, createdAt: "2026-02-01T10:00:00Z" },
  { id: "geo_4", name: "Home", type: "safe_zone", familyId: "fam_2", familyName: "Okonkwo Household", address: "8 Independence Layout, Enugu", center: { lat: 6.45, lng: 7.50 }, radius: 200, isActive: true, entryEvents: 90, exitEvents: 85, createdAt: "2025-11-20T14:00:00Z" },
  { id: "geo_5", name: "Grandparents", type: "safe_zone", familyId: "fam_2", familyName: "Okonkwo Household", address: "22 Village Road, Nsukka", center: { lat: 6.86, lng: 7.39 }, radius: 350, isActive: false, entryEvents: 12, exitEvents: 10, createdAt: "2026-03-01T09:00:00Z" },
  { id: "geo_6", name: "Office Park", type: "safe_zone", familyId: "fam_3", familyName: "Mensah Family", address: "5 Ring Road, Accra", center: { lat: 5.56, lng: -0.20 }, radius: 300, isActive: true, entryEvents: 200, exitEvents: 195, createdAt: "2025-06-10T07:00:00Z" },
];

export const mockGeofenceStats = {
  total: 6,
  active: 5,
  inactive: 1,
  safeZones: 5,
  dangerZones: 1,
  eventsToday: 28,
  familiesWithZones: families,
};

export const mockGeofenceEvents = [
  { id: "evt_1", zoneId: "geo_1", zoneName: "Home", familyName: "Adeyemi Family", event: "entry", userName: "Chidi Adeyemi", timestamp: "2026-07-31T10:15:00Z" },
  { id: "evt_2", zoneId: "geo_2", zoneName: "School", familyName: "Adeyemi Family", event: "entry", userName: "Amara Adeyemi", timestamp: "2026-07-31T09:30:00Z" },
  { id: "evt_3", zoneId: "geo_1", zoneName: "Home", familyName: "Adeyemi Family", event: "exit", userName: "Chidi Adeyemi", timestamp: "2026-07-31T08:00:00Z" },
  { id: "evt_4", zoneId: "geo_3", zoneName: "Market District", familyName: "Adeyemi Family", event: "entry", userName: "Ngozi Adeyemi", timestamp: "2026-07-30T15:45:00Z" },
  { id: "evt_5", zoneId: "geo_4", zoneName: "Home", familyName: "Okonkwo Household", event: "exit", userName: "Emeka Okonkwo", timestamp: "2026-07-31T11:00:00Z" },
];

export const mockGeofenceDetail = {
  ...mockGeofenceZones[0],
  assignedUsers: [
    { id: "usr_1", name: "Chidi Adeyemi", relationship: "Child", deviceName: "Samsung Galaxy A54" },
    { id: "usr_2", name: "Amara Adeyemi", relationship: "Child", deviceName: "iPhone 13" },
    { id: "usr_3", name: "Ngozi Adeyemi", relationship: "Parent", deviceName: "Google Pixel 7" },
  ],
  schedule: { enabled: true, days: ["mon", "tue", "wed", "thu", "fri"], startTime: "08:00", endTime: "15:00" },
  events: mockGeofenceEvents.filter(e => e.zoneId === "geo_1"),
  createdAt: "2026-01-15T08:00:00Z",
  updatedAt: "2026-07-28T14:30:00Z",
};
