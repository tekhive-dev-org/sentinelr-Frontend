/**
 * Parental Control API Service
 * Handles all parental control CRUD and action API calls.
 */

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
    throw new Error(error.message || `API Error ${response.status} on ${options.method || 'GET'} ${endpoint}`);
  }

  return response.json();
}

function toNormalizedMembers(rawMembers = []) {
  return rawMembers
    .map((member) => {
      const user = member?.user || member || {};
      const userId = member?.userId ?? member?.id ?? user?.id;
      if (userId == null) return null;

      const rawDevices = member?.devices || user?.devices || [];
      return {
        ...member,
        userId,
        name: user?.userName || user?.name || member?.userName || member?.name || 'Unknown',
        avatar: user?.avatar || member?.avatar || null,
        devices: rawDevices
          .map((device) => {
            const deviceId = device?.deviceId ?? device?.id;
            if (deviceId == null) return null;
            return {
              ...device,
              deviceId: String(deviceId),
              name: device?.name || device?.deviceName || 'Unnamed Device',
            };
          })
          .filter(Boolean),
      };
    })
    .filter(Boolean);
}

function extractMembersFromResponse(response) {
  return (
    response?.members
    || response?.data?.members
    || response?.family?.members
    || response?.data?.family?.members
    || []
  );
}

export const parentalControlService = {
  /**
   * Get family members with their paired devices.
   * Primary: GET /parental-controls/members
   * Fallback: safe empty response (no my-family dependency).
   */
  async getMembers() {
    try {
      const res = await apiRequest('/parental-controls/members', { method: 'GET' });
      // console.log('[ParentalControls] /parental-controls/members raw response:', res);
      const primaryMembers = toNormalizedMembers(extractMembersFromResponse(res));
      return { success: true, members: primaryMembers };
    } catch (err) {
      console.warn('[ParentalControls] /parental-controls/members failed:', err.message);
      throw err;
    }
  },

  /**
   * Get full device status (richer than getControls)
   * GET /parental-controls/{userId}/device-status/{deviceId}
   * @param {number} userId
   * @param {string|number} deviceId
   */
  async getDeviceStatus(userId, deviceId) {
    try {
      const response = await apiRequest(
        `/parental-controls/${encodeURIComponent(userId)}/device-status/${encodeURIComponent(deviceId)}`,
        { method: 'GET' },
      );
      // console.log("[parentalControlService] getDeviceStatus response:", response);
      return response;
    } catch (err) {
      console.error("[parentalControlService] getDeviceStatus error:", err);
      if (err.message.includes('404')) {
        return {
          success: true,
          controls: {
            userId: Number(userId),
            deviceId: Number(deviceId) || deviceId,
            isMonitoring: false,
            screenTimeLimit: {
              enabled: false,
              dailyLimit: 0,
              usedToday: 0,
              remaining: 0,
              breakdown: {},
              schedule: { weekdays: 0, weekends: 0 }
            },
            appBlocking: {
              enabled: false,
              blockedApps: [],
              categoryBlocked: [],
              appOverrides: []
            },
            webFiltering: {
              enabled: false,
              blockedSites: [],
              safeSearchEnabled: false,
              categoryBlocked: []
            },
            bedtime: {
              enabled: false,
              startTime: '21:30',
              endTime: '07:00'
            },
            quickPause: {
              isDeviceFrozen: false,
              frozenAt: null
            }
          }
        };
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
    try {
      return await apiRequest(
        `/parental-controls/${encodeURIComponent(userId)}${params}`,
        {},
      );
    } catch (err) {
      if (err.message.includes('404')) {
        return {
          success: true,
          controls: {
            userId: Number(userId),
            deviceId: Number(deviceId) || deviceId,
            isMonitoring: false,
            screenTimeLimit: {
              enabled: false,
              dailyLimit: 0,
              usedToday: 0,
              remaining: 0,
              breakdown: {},
              schedule: { weekdays: 0, weekends: 0 }
            },
            appBlocking: {
              enabled: false,
              blockedApps: [],
              categoryBlocked: [],
              appOverrides: []
            },
            webFiltering: {
              enabled: false,
              blockedSites: [],
              safeSearchEnabled: false,
              categoryBlocked: []
            },
            bedtime: {
              enabled: false,
              startTime: '21:30',
              endTime: '07:00'
            },
            quickPause: {
              isDeviceFrozen: false,
              frozenAt: null
            }
          }
        };
      }
      throw err;
    }
  },

  /**
   * Update screen time limit settings
   * @param {number} userId
   * @param {string|number} deviceId
   * @param {object} settings - { enabled, dailyLimit, schedule: { weekdays, weekends } }
   */
  async updateScreenTime(userId, deviceId, settings) {
    return apiRequest(`/parental-controls/${encodeURIComponent(userId)}/screentime/${encodeURIComponent(deviceId)}`, {
      method: 'PUT',
      body: JSON.stringify({ ...settings, ...(deviceId ? { deviceId } : {}) }),
    });
  },

  /**
   * Update app blocking settings
   * @param {number} userId
   * @param {string|number} deviceId
   * @param {object} settings - { enabled, blockedApps, categoryBlocked }
   */
  async updateAppBlocking(userId, deviceId, settings) {
    return apiRequest(`/parental-controls/${encodeURIComponent(userId)}/app-blocking`, {
      method: 'PUT',
      body: JSON.stringify({ ...settings, ...(deviceId ? { deviceId } : {}) }),
    });
  },

  /**
   * Toggle a category block on/off
   * @param {number} userId
   * @param {string|number} deviceId
   * @param {string} category
   * @param {boolean} enabled
   */
  async toggleCategoryBlock(userId, deviceId, category, enabled) {
    return apiRequest(`/parental-controls/${encodeURIComponent(userId)}/app-blocking/category/${encodeURIComponent(deviceId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ category, enabled, ...(deviceId ? { deviceId } : {}) }),
    });
  },

  /**
   * Toggle a specific app block on/off
   * @param {number} userId
   * @param {string|number} deviceId
   * @param {string} packageName
   * @param {boolean} isBlocked
   */
  async toggleAppBlock(userId, deviceId, packageName, isBlocked) {
    return apiRequest(`/parental-controls/${encodeURIComponent(userId)}/app-blocking/app/${encodeURIComponent(deviceId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ packageName, isBlocked, ...(deviceId ? { deviceId } : {}) }),
    });
  },

  /**
   * Update web filtering settings
   * @param {number} userId
   * @param {string|number} deviceId
   * @param {object} settings
   */
  async updateWebFiltering(userId, deviceId, settings) {
    return apiRequest(`/parental-controls/${encodeURIComponent(userId)}/web-filtering/${encodeURIComponent(deviceId)}`, {
      method: 'PUT',
      body: JSON.stringify({ ...settings, ...(deviceId ? { deviceId } : {}) }),
    });
  },

  /**
   * Add a website to the blocked list
   * @param {number} userId
   * @param {string|number} deviceId
   * @param {string} url
   */
  async addBlockedSite(userId, deviceId, url) {
    return apiRequest(`/parental-controls/${encodeURIComponent(userId)}/web-filtering/blocked-websites/${encodeURIComponent(deviceId)}`, {
      method: 'POST',
      body: JSON.stringify({ url, ...(deviceId ? { deviceId } : {}) }),
    });
  },

  /**
   * Remove a website from the blocked list
   * @param {number} userId
   * @param {string|number} deviceId
   * @param {string} url
   */
  async removeBlockedSite(userId, deviceId, url) {
    return apiRequest(`/parental-controls/${encodeURIComponent(userId)}/web-filtering/blocked-websites/${encodeURIComponent(deviceId)}`, {
      method: 'DELETE',
      body: JSON.stringify({ url, ...(deviceId ? { deviceId } : {}) }),
    });
  },

  /**
   * Update bedtime settings
   * PUT /parental-controls/{userId}/bedtime
   * @param {number} userId
   * @param {string|number} deviceId
   * @param {object} settings - { enabled, startTime, endTime }
   */
  async updateBedtime(userId, deviceId, settings) {
    return apiRequest(
      `/parental-controls/${encodeURIComponent(userId)}/bedtime/${encodeURIComponent(deviceId)}`,
      { method: 'PUT', body: JSON.stringify({ ...settings, ...(deviceId ? { deviceId } : {}) }) },
    );
  },

  /**
   * Freeze device (Quick Pause)
   * POST /parental-controls/{userId}/freeze
   * @param {number} userId
   * @param {string} deviceId
   */
  async freezeDevice(userId, deviceId) {
    return apiRequest(
      `/parental-controls/${encodeURIComponent(userId)}/freeze/${encodeURIComponent(deviceId)}`,
      { method: 'POST', body: JSON.stringify({ deviceId }) },
    );
  },

  /**
   * Unfreeze device
   * POST /parental-controls/{userId}/unfreeze
   * @param {number} userId
   * @param {string} deviceId
   */
  async unfreezeDevice(userId, deviceId) {
    return apiRequest(
      `/parental-controls/${encodeURIComponent(userId)}/unfreeze/${encodeURIComponent(deviceId)}`,
      { method: 'POST', body: JSON.stringify({ deviceId }) },
    );
  },

  /**
   * Grant bonus time
   * @param {number} userId
   * @param {string} deviceId
   * @param {number} minutes
   */
  async grantBonusTime(userId, deviceId, minutes = 60) {
    return apiRequest(`/parental-controls/${encodeURIComponent(userId)}/bonus-time`, {
      method: 'POST',
      body: JSON.stringify({ deviceId, minutes }),
    });
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
    try {
      return await apiRequest(
        `/parental-controls/${encodeURIComponent(userId)}/activity?${params}`,
        {},
      );
    } catch (err) {
      if (err.message.includes('404')) {
        return { success: true, activities: [] };
      }
      throw err;
    }
  },

  /**
   * Toggle active monitoring
   * @param {number} userId
   * @param {boolean} enabled
   * @param {string} deviceId
   */
  async toggleMonitoring(userId, enabled, deviceId) {
    return apiRequest(`/parental-controls/${encodeURIComponent(userId)}/monitoring`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled, deviceId }),
    });
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
    return apiRequest(
      `/devices/${encodeURIComponent(deviceId)}/installed-apps${qs ? `?${qs}` : ''}`,
      {},
    );
  },

  /**
   * Get parental control status using a device token (mobile API)
   * GET /parental-controls/device-status
   * @param {string} deviceToken
   */
  async getMobileDeviceStatus(deviceToken) {
    const response = await fetch(`${API_BASE_URL}/parental-controls/device-status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${deviceToken}`,
        'x-device-token': deviceToken,
      },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API Error ${response.status} on GET /parental-controls/device-status`);
    }
    return response.json();
  },

  /**
   * Get recent parental control activity using a device token (mobile API)
   * GET /parental-controls/device-status?limit=X
   * @param {string} deviceToken
   * @param {number} limit
   */
  async getMobileDeviceActivity(deviceToken, limit = 10) {
    const response = await fetch(`${API_BASE_URL}/parental-controls/device-status?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${deviceToken}`,
        'x-device-token': deviceToken,
      },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API Error ${response.status} on GET /parental-controls/device-status`);
    }
    return response.json();
  },

  /**
   * Send device heartbeat (mobile API)
   * POST /device/heartbeat
   * @param {string} deviceToken
   * @param {object} status - { battery_level, is_charging, network_type }
   */
  async sendMobileHeartbeat(deviceToken, status) {
    const response = await fetch(`${API_BASE_URL}/device/heartbeat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${deviceToken}`,
        'x-device-token': deviceToken,
      },
      body: JSON.stringify(status),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API Error ${response.status} on POST /device/heartbeat`);
    }
    return response.json();
  },

  /**
   * Send location ping (mobile API)
   * POST /location/update
   * @param {string} deviceToken
   * @param {object} location - { latitude, longitude, accuracy, timestamp }
   */
  async sendMobilePing(deviceToken, location) {
    const response = await fetch(`${API_BASE_URL}/location/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${deviceToken}`,
        'x-device-token': deviceToken,
      },
      body: JSON.stringify(location),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API Error ${response.status} on POST /location/update`);
    }
    return response.json();
  },
};
