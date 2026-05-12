/**
 * Parental Control API Service
 * Handles all parental control CRUD and action API calls.
 *
 * While the backend endpoints are still under development (404),
 * the service returns realistic mock data so the UI can be previewed.
 */

import { familyService } from './familyService';
import { devicesService } from './devicesService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && {
        Authorization: `Bearer ${token}`,
        'x-access-token': token,
      }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// ── Mock Data (used while backend endpoints return 404) ────────────────────
const MOCK_MEMBERS = {
  success: true,
  members: [
    {
      userId: 2,
      name: 'Leo',
      avatar: null,
      devices: [
        { deviceId: 'dev_001', name: "Leo's iPhone 15", type: 'IOS', status: 'online', batteryLevel: 85 },
      ],
    },
    {
      userId: 3,
      name: 'Jane',
      avatar: null,
      devices: [
        { deviceId: 'dev_002', name: "Jane's Android", type: 'ANDROID', status: 'offline', batteryLevel: 42 },
      ],
    },
  ],
};

const MOCK_CONTROLS = {
  success: true,
  controls: {
    userId: 2,
    deviceId: 'dev_001',
    deviceName: "Leo's iPhone 15",
    isMonitoring: true,
    screenTimeLimit: {
      enabled: true,
      dailyLimit: 360,
      usedToday: 270,
      remaining: 90,
      breakdown: { socialMedia: 130, entertainment: 105, gaming: 20, education: 15 },
      schedule: { weekdays: 300, weekends: 420 },
    },
    appBlocking: {
      enabled: true,
      blockedApps: [],
      categoryBlocked: [
        { category: 'Gaming', enabled: true, appsDetected: 47 },
        { category: 'Social Media', enabled: false, appsDetected: 4 },
        { category: 'Entertainment', enabled: false, appsDetected: 12 },
      ],
      appOverrides: [
        { packageName: 'com.zhiliaoapp.musically', name: 'TikTok', isBlocked: false, note: 'Requires Root' },
        { packageName: 'com.facebook.katana', name: 'Facebook', isBlocked: false, note: 'Frequently Used' },
        { packageName: 'com.whatsapp', name: 'WhatsApp', isBlocked: true, note: 'Frequently Used' },
      ],
    },
    webFiltering: {
      enabled: true,
      blockedSites: ['reddit.com', 'twitch.tv'],
      safeSearchEnabled: true,
      categoryBlocked: ['adult', 'violence'],
    },
    bedtime: { enabled: true, startTime: '21:30', endTime: '07:00' },
    quickPause: { isDeviceFrozen: false, frozenAt: null, frozenUntil: null },
  },
};

const MOCK_ACTIVITIES = {
  success: true,
  activities: [
    { id: 1, type: 'app_install', description: 'Leo installed Duolingo', app: 'Duolingo', timestamp: new Date(Date.now() - 5 * 60000).toISOString() },
    { id: 2, type: 'web_blocked', description: 'Attempted to visit unblocked-games.net', status: 'Blocked', url: 'unblocked-games.net', timestamp: new Date(Date.now() - 45 * 60000).toISOString() },
    { id: 3, type: 'screen_time_limit', description: 'Screen time limit reached for Instagram', app: 'Instagram', timestamp: new Date(Date.now() - 2 * 3600000).toISOString() },
    { id: 4, type: 'screen_time_limit', description: 'Screen time limit reached for TikTok', app: 'TikTok', timestamp: new Date(Date.now() - 2 * 3600000).toISOString() },
  ],
};

/** Try a real API call; on 404, 401, or 500 return mock data (backend not ready yet). */
async function apiRequestWithFallback(endpoint, options, mockData) {
  try {
    return await apiRequest(endpoint, options);
  } catch (err) {
    if (mockData && (/404/.test(err.message) || /401/.test(err.message) || /500/.test(err.message))) {
      console.info(`[ParentalControls] Endpoint not ready, using demo data: ${endpoint}`);
      return mockData;
    }
    throw err;
  }
}

export const parentalControlService = {
  /**
   * Get family members with their paired devices using the family + devices APIs.
   */
  async getMembers() {
    try {
      const res = await familyService.getFamilyMembers();
      const family = res?.family;
      const rawMembers = family?.members || res?.members || [];

      // Fetch paired family devices once, then group them by assigned user.
      let allDevices = [];
      try {
        const devRes = await devicesService.getFamilyDevices({
          pairStatus: 'Paired',
          limit: 100,
        });
        allDevices = (devRes?.devices || []).filter(
          (device) => device.pairStatus === 'Paired' || device.pairStatus === 'paired',
        );
      } catch {
        // devices unavailable — members will have empty device lists
      }

      const members = rawMembers.map((m) => {
        const user = m.user || m;
        const userId = user.id || m.userId || m.memberUserId || m.id;
        const memberDevices = allDevices
          .filter((d) => {
            const deviceUserId =
              d.assignedUser?.id ||
              d.assignedUserId ||
              d.userId ||
              d.memberUserId;
            return String(deviceUserId) === String(userId);
          })
          .map((d) => ({
            deviceId: String(d.id || d.deviceId),
            name: d.deviceName || d.name || 'Unknown Device',
            type: d.deviceType || d.type || 'ANDROID',
            status: d.status || 'offline',
            batteryLevel: d.batteryLevel ?? null,
          }));
        return {
          userId,
          name: user.userName || user.name || m.userName || m.name || 'Unknown',
          avatar: user.avatar || m.avatar || null,
          devices: memberDevices,
        };
      });

      return { success: true, members };
    } catch (err) {
      if (/404|401/.test(err.message)) {
        console.info('[ParentalControls] Family endpoint not ready, using demo data');
        return MOCK_MEMBERS;
      }
      throw err;
    }
  },

  /**
   * Get parental controls for a specific user
   * @param {number} userId
   * @param {string|number} deviceId
   */
  async getControls(userId, deviceId) {
    if (!deviceId) {
      throw new Error('A paired device must be selected before loading parental controls.');
    }

    const params = `?deviceId=${encodeURIComponent(deviceId)}`;
    return apiRequestWithFallback(
      `/parental-controls/${encodeURIComponent(userId)}${params}`,
      {},
      MOCK_CONTROLS,
    );
  },

  /**
   * Update screen time limit settings
   * @param {number} userId
   * @param {string|number} deviceId
   * @param {object} settings - { enabled, dailyLimit, schedule: { weekdays, weekends } }
   */
  async updateScreenTime(userId, deviceId, settings) {
    return apiRequestWithFallback(`/parental-controls/${encodeURIComponent(userId)}/screentime/${encodeURIComponent(deviceId)}`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    }, { success: true, message: 'Screen time settings updated (demo)' });
  },

  /**
   * Update app blocking settings
   * @param {number} userId
   * @param {string|number} deviceId
   * @param {object} settings - { enabled, blockedApps, categoryBlocked }
   */
  async updateAppBlocking(userId, deviceId, settings) {
    return apiRequestWithFallback(`/parental-controls/${encodeURIComponent(userId)}/app-blocking/${encodeURIComponent(deviceId)}`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    }, { success: true, message: 'App blocking settings updated (demo)' });
  },

  /**
   * Toggle a category block on/off
   * @param {number} userId
   * @param {string|number} deviceId
   * @param {string} category
   * @param {boolean} enabled
   */
  async toggleCategoryBlock(userId, deviceId, category, enabled) {
    return apiRequestWithFallback(`/parental-controls/${encodeURIComponent(userId)}/app-blocking/category/${encodeURIComponent(deviceId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ category, enabled }),
    }, { success: true, message: 'Category blocking updated (demo)', category, enabled });
  },

  /**
   * Toggle a specific app block on/off
   * @param {number} userId
   * @param {string|number} deviceId
   * @param {string} packageName
   * @param {boolean} isBlocked
   */
  async toggleAppBlock(userId, deviceId, packageName, isBlocked) {
    return apiRequestWithFallback(`/parental-controls/${encodeURIComponent(userId)}/app-blocking/app/${encodeURIComponent(deviceId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ packageName, isBlocked }),
    }, { success: true, message: 'App block status updated (demo)' });
  },

  /**
   * Update web filtering settings
   * @param {number} userId
   * @param {string|number} deviceId
   * @param {object} settings
   */
  async updateWebFiltering(userId, deviceId, settings) {
    return apiRequestWithFallback(`/parental-controls/${encodeURIComponent(userId)}/web-filtering/${encodeURIComponent(deviceId)}`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    }, { success: true, message: 'Web filtering settings updated (demo)' });
  },

  /**
   * Add a website to the blocked list
   * @param {number} userId
   * @param {string|number} deviceId
   * @param {string} url
   */
  async addBlockedSite(userId, deviceId, url) {
    return apiRequestWithFallback(`/parental-controls/${encodeURIComponent(userId)}/web-filtering/blocked-websites/${encodeURIComponent(deviceId)}`, {
      method: 'POST',
      body: JSON.stringify({ url }),
    }, { success: true, message: 'Website added (demo)' });
  },

  /**
   * Remove a website from the blocked list
   * @param {number} userId
   * @param {string|number} deviceId
   * @param {string} url
   */
  async removeBlockedSite(userId, deviceId, url) {
    return apiRequestWithFallback(`/parental-controls/${encodeURIComponent(userId)}/web-filtering/blocked-websites/${encodeURIComponent(deviceId)}`, {
      method: 'DELETE',
      body: JSON.stringify({ url }),
    }, { success: true, message: 'Website removed (demo)' });
  },

  /**
   * Update bedtime settings
   * @param {number} userId
   * @param {object} settings - { enabled, startTime, endTime }
   */
  async updateBedtime(userId, settings) {
    return apiRequestWithFallback(`/parental-controls/${encodeURIComponent(userId)}/bedtime`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    }, { success: true, message: 'Bedtime settings updated (demo)' });
  },

  /**
   * Freeze device (Quick Pause)
   * @param {number} userId
   * @param {string} deviceId
   */
  async freezeDevice(userId, deviceId) {
    return apiRequestWithFallback(`/parental-controls/${encodeURIComponent(userId)}/freeze`, {
      method: 'POST',
      body: JSON.stringify({ deviceId }),
    }, { success: true, message: 'Device frozen (demo)', frozenAt: new Date().toISOString() });
  },

  /**
   * Unfreeze device
   * @param {number} userId
   * @param {string} deviceId
   */
  async unfreezeDevice(userId, deviceId) {
    return apiRequestWithFallback(`/parental-controls/${encodeURIComponent(userId)}/unfreeze`, {
      method: 'POST',
      body: JSON.stringify({ deviceId }),
    }, { success: true, message: 'Device unfrozen (demo)' });
  },

  /**
   * Grant bonus time
   * @param {number} userId
   * @param {string} deviceId
   * @param {number} minutes
   */
  async grantBonusTime(userId, deviceId, minutes = 60) {
    return apiRequestWithFallback(`/parental-controls/${encodeURIComponent(userId)}/bonus-time`, {
      method: 'POST',
      body: JSON.stringify({ deviceId, minutes }),
    }, { success: true, message: 'Bonus time granted (demo)', newRemaining: 150 });
  },

  /**
   * Get recent parental control activity
   * @param {number} userId
   * @param {string} [deviceId]
   * @param {number} [limit]
   */
  async getActivity(userId, deviceId, limit = 10) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (deviceId) params.set('deviceId', deviceId);
    return apiRequestWithFallback(
      `/parental-controls/${encodeURIComponent(userId)}/activity?${params}`,
      {},
      MOCK_ACTIVITIES,
    );
  },

  /**
   * Toggle active monitoring
   * @param {number} userId
   * @param {boolean} enabled
   * @param {string} deviceId
   */
  async toggleMonitoring(userId, enabled, deviceId) {
    return apiRequestWithFallback(`/parental-controls/${encodeURIComponent(userId)}/monitoring`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled, deviceId }),
    }, { success: true, message: 'Monitoring status updated (demo)', isMonitoring: enabled });
  },

  /**
   * Get installed apps on a device
   * @param {string} deviceId
   * @param {object} [filters] - { category, search }
   */
  async getInstalledApps(deviceId, filters = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.search) params.set('search', filters.search);
    const qs = params.toString();
    return apiRequestWithFallback(
      `/devices/${encodeURIComponent(deviceId)}/installed-apps${qs ? `?${qs}` : ''}`,
      {},
      { success: true, apps: [], total: 0 },
    );
  },
};
