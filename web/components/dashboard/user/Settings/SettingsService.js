// ============================================
// SETTINGS SERVICE - API Ready Structure
// ============================================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://sentinelr-backend.onrender.com/api";

const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
};

const SettingsService = {
  // Account Settings
  async updateProfile(profileData) {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Missing auth token");
    }

    const response = await fetch(`${API_BASE_URL}/user/update-profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "x-access-token": token,
      },
      body: JSON.stringify(profileData),
    });

    const data = await parseResponse(response);
    if (!response.ok) {
      throw new Error(data?.message || data || "Failed to update profile");
    }

    return data;
  },

  async uploadProfilePicture(file) {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Missing auth token");
    }

    const formData = new FormData();
    formData.append("profilePicture", file);

    const response = await fetch(`${API_BASE_URL}/user/update-profile-picture`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-access-token": token,
      },
      body: formData,
    });

    const data = await parseResponse(response);
    if (!response.ok) {
      throw new Error(data?.message || data || "Failed to upload profile picture");
    }

    return data;
  },

  // Password
  async changePassword(oldPassword, newPassword) {
    // TODO: Replace with actual API call
    // return await fetch('/api/user/password', {
    //   method: 'PUT',
    //   body: JSON.stringify({ oldPassword, newPassword })
    // }).then(res => res.json());
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate validation
        if (oldPassword === 'Chidiebere2025') {
          resolve({ success: true, message: 'Password changed successfully' });
        } else {
          reject(new Error('Provided old password is not correct'));
        }
      }, 1000);
    });
  },

  // 2FA
  async toggle2FA(enabled) {
    // TODO: Replace with actual 2FA API
    // return await fetch('/api/user/2fa', {
    //   method: 'POST',
    //   body: JSON.stringify({ enabled })
    // }).then(res => res.json());
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          success: true, 
          message: enabled ? 'Two-Factor Authentication enabled' : 'Two-Factor Authentication disabled'
        });
      }, 500);
    });
  },

  // Notifications
  async updateNotificationPreferences(preferences) {
    // TODO: Replace with actual API call
    // return await fetch('/api/user/notifications', {
    //   method: 'PUT',
    //   body: JSON.stringify(preferences)
    // }).then(res => res.json());
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Notification preferences updated' });
      }, 500);
    });
  },

  // Delete Account
  async deleteAccount(password) {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Missing auth token");
    }

    const response = await fetch(`${API_BASE_URL}/user/soft-delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "x-access-token": token,
      },
      body: JSON.stringify({ password }),
    });

    const data = await parseResponse(response);
    if (!response.ok) {
      throw new Error(data?.message || data || "Failed to delete account");
    }

    return data;
  }
};

export default SettingsService;
