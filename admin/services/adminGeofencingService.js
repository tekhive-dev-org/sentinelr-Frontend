// MOCK-POWERED — Replace with real API when available
import { mockGeofenceZones, mockGeofenceStats, mockGeofenceEvents, mockGeofenceDetail } from "../mocks/geofencing";

const delay = (ms) => new Promise(r => setTimeout(r, ms));

export const adminGeofencingService = {
  async getZones(params = {}) {
    await delay(400);
    let zones = [...mockGeofenceZones];
    if (params.search) { const q = params.search.toLowerCase(); zones = zones.filter(z => z.name.toLowerCase().includes(q) || z.familyName.toLowerCase().includes(q)); }
    if (params.type) zones = zones.filter(z => z.type === params.type);
    if (params.status !== undefined) zones = zones.filter(z => params.status === "active" ? z.isActive : !z.isActive);
    const page = params.page || 1; const limit = params.limit || 20;
    const total = zones.length; const start = (page - 1) * limit;
    return { zones: zones.slice(start, start + limit), total, totalPages: Math.ceil(total / limit) };
  },
  async getStats() { await delay(300); return mockGeofenceStats; },
  async getZoneDetail(id) { await delay(300); return mockGeofenceDetail; },
  async getEvents(params = {}) { await delay(300); return { events: mockGeofenceEvents.slice(0, params.limit || 20), total: mockGeofenceEvents.length }; },
};
