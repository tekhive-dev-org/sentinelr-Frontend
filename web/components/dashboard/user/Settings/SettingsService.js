// ============================================
// SETTINGS SERVICE - API Ready Structure
// ============================================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Error codes mapping for user-friendly messages
const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: "Unable to connect to the server. Please check your internet connection.",
  TIMEOUT_ERROR: "Request timed out. Please try again.",
  
  // Auth errors
  UNAUTHORIZED: "Your session has expired. Please log in again.",
  FORBIDDEN: "You don't have permission to perform this action.",
  MISSING_TOKEN: "Please log in to continue.",
  
  // Profile errors
  PROFILE_UPDATE_FAILED: "Failed to update profile. Please try again.",
  EMAIL_ALREADY_EXISTS: "This email is already in use.",
  INVALID_PHONE: "Please enter a valid phone number.",
  USERNAME_TAKEN: "This username is already taken.",
  
  // Password errors
  INCORRECT_PASSWORD: "The current password you entered is incorrect.",
  WEAK_PASSWORD: "Password must be at least 8 characters with numbers and letters.",
  PASSWORD_MISMATCH: "Passwords do not match.",
  
  // 2FA errors
  TWO_FA_FAILED: "Failed to update two-factor authentication. Please try again.",
  INVALID_2FA_CODE: "Invalid verification code. Please try again.",
  
  // Upload errors
  FILE_TOO_LARGE: "File size exceeds the maximum limit of 5MB.",
  INVALID_FILE_TYPE: "Please upload a valid image file (JPEG, PNG, or GIF).",
  UPLOAD_FAILED: "Failed to upload file. Please try again.",
  
  // Delete account errors
  DELETE_FAILED: "Failed to delete account. Please try again.",
  
  // Generic errors
  SERVER_ERROR: "Something went wrong on our end. Please try again later.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
  VALIDATION_ERROR: "Please check your input and try again.",
};

// Helper to get auth token
const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

// Helper to parse response
const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
};

// Custom error class for API errors
class SettingsError extends Error {
  constructor(message, code, statusCode, details = null) {
    super(message);
    this.name = "SettingsError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Helper to handle API errors with proper messages
const handleApiError = (response, data, defaultMessage) => {
  const statusCode = response.status;
  
  // Extract error details from response
  const serverMessage = data?.message || data?.error || (typeof data === 'string' ? data : null);
  const errorCode = data?.code || data?.errorCode;
  const errorDetails = data?.details || data?.errors;
  
  // Map status codes to user-friendly messages
  let userMessage;
  let code;
  
  switch (statusCode) {
    case 400:
      code = errorCode || "VALIDATION_ERROR";
      userMessage = serverMessage || ERROR_MESSAGES.VALIDATION_ERROR;
      break;
    case 401:
      code = "UNAUTHORIZED";
      userMessage = ERROR_MESSAGES.UNAUTHORIZED;
      break;
    case 403:
      code = "FORBIDDEN";
      userMessage = ERROR_MESSAGES.FORBIDDEN;
      break;
    case 404:
      code = "NOT_FOUND";
      userMessage = serverMessage || "The requested resource was not found.";
      break;
    case 409:
      code = errorCode || "CONFLICT";
      // Handle specific conflict errors
      if (serverMessage?.toLowerCase().includes("email")) {
        userMessage = ERROR_MESSAGES.EMAIL_ALREADY_EXISTS;
      } else if (serverMessage?.toLowerCase().includes("username")) {
        userMessage = ERROR_MESSAGES.USERNAME_TAKEN;
      } else {
        userMessage = serverMessage || "This action conflicts with existing data.";
      }
      break;
    case 413:
      code = "FILE_TOO_LARGE";
      userMessage = ERROR_MESSAGES.FILE_TOO_LARGE;
      break;
    case 422:
      code = "VALIDATION_ERROR";
      userMessage = serverMessage || ERROR_MESSAGES.VALIDATION_ERROR;
      break;
    case 429:
      code = "RATE_LIMITED";
      userMessage = "Too many requests. Please wait a moment and try again.";
      break;
    case 500:
    case 502:
    case 503:
      code = "SERVER_ERROR";
      userMessage = ERROR_MESSAGES.SERVER_ERROR;
      break;
    default:
      code = "UNKNOWN_ERROR";
      userMessage = serverMessage || defaultMessage || ERROR_MESSAGES.UNKNOWN_ERROR;
  }
  
  throw new SettingsError(userMessage, code, statusCode, errorDetails);
};

// Helper to handle network/fetch errors
const handleNetworkError = (error) => {
  if (error instanceof SettingsError) {
    throw error;
  }
  
  if (error.name === "AbortError") {
    throw new SettingsError(ERROR_MESSAGES.TIMEOUT_ERROR, "TIMEOUT_ERROR", 0);
  }
  
  if (error.name === "TypeError" && error.message.includes("fetch")) {
    throw new SettingsError(ERROR_MESSAGES.NETWORK_ERROR, "NETWORK_ERROR", 0);
  }
  
  throw new SettingsError(
    error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
    "UNKNOWN_ERROR",
    0
  );
};

const SettingsService = {
  // Export error messages for components to use
  ERROR_MESSAGES,
  
  // Account Settings
  async updateProfile(profileData) {
    const token = getAuthToken();
    if (!token) {
      throw new SettingsError(ERROR_MESSAGES.MISSING_TOKEN, "MISSING_TOKEN", 401);
    }

    try {
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
        handleApiError(response, data, ERROR_MESSAGES.PROFILE_UPDATE_FAILED);
      }

      return data;
    } catch (error) {
      handleNetworkError(error);
    }
  },

  async uploadProfilePicture(file) {
    const token = getAuthToken();
    if (!token) {
      throw new SettingsError(ERROR_MESSAGES.MISSING_TOKEN, "MISSING_TOKEN", 401);
    }

    // Validate file before upload
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    
    if (file.size > maxSize) {
      throw new SettingsError(ERROR_MESSAGES.FILE_TOO_LARGE, "FILE_TOO_LARGE", 400);
    }
    
    if (!allowedTypes.includes(file.type)) {
      throw new SettingsError(ERROR_MESSAGES.INVALID_FILE_TYPE, "INVALID_FILE_TYPE", 400);
    }

    try {
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
        handleApiError(response, data, ERROR_MESSAGES.UPLOAD_FAILED);
      }

      return data;
    } catch (error) {
      handleNetworkError(error);
    }
  },

  // Password
  async changePassword(oldPassword, newPassword) {
    const token = getAuthToken();
    if (!token) {
      throw new SettingsError(ERROR_MESSAGES.MISSING_TOKEN, "MISSING_TOKEN", 401);
    }

    // Client-side validation
    if (!oldPassword) {
      throw new SettingsError("Please enter your current password.", "VALIDATION_ERROR", 400);
    }
    
    if (!newPassword || newPassword.length < 8) {
      throw new SettingsError(ERROR_MESSAGES.WEAK_PASSWORD, "WEAK_PASSWORD", 400);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-access-token": token,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await parseResponse(response);
      
      if (!response.ok) {
        // Special handling for incorrect password
        if (response.status === 400 || response.status === 401) {
          const msg = data?.message?.toLowerCase() || "";
          if (msg.includes("incorrect") || msg.includes("wrong") || msg.includes("invalid")) {
            throw new SettingsError(ERROR_MESSAGES.INCORRECT_PASSWORD, "INCORRECT_PASSWORD", 400);
          }
        }
        handleApiError(response, data, "Failed to change password. Please try again.");
      }

      return data;
    } catch (error) {
      handleNetworkError(error);
    }
  },

  // 2FA
  async toggle2FA(enabled) {
    const token = getAuthToken();
    if (!token) {
      throw new SettingsError(ERROR_MESSAGES.MISSING_TOKEN, "MISSING_TOKEN", 401);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/2fa/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-access-token": token,
        },
        body: JSON.stringify({ enabled }),
      });

      const data = await parseResponse(response);
      
      if (!response.ok) {
        handleApiError(response, data, ERROR_MESSAGES.TWO_FA_FAILED);
      }

      return {
        success: true,
        message: enabled ? "Two-Factor Authentication enabled" : "Two-Factor Authentication disabled",
        ...data,
      };
    } catch (error) {
      handleNetworkError(error);
    }
  },

  // Notifications
  async updateNotificationPreferences(preferences) {
    const token = getAuthToken();
    if (!token) {
      throw new SettingsError(ERROR_MESSAGES.MISSING_TOKEN, "MISSING_TOKEN", 401);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/notification-preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-access-token": token,
        },
        body: JSON.stringify(preferences),
      });

      const data = await parseResponse(response);
      
      if (!response.ok) {
        handleApiError(response, data, "Failed to update notification preferences.");
      }

      return { success: true, message: "Notification preferences updated", ...data };
    } catch (error) {
      handleNetworkError(error);
    }
  },

  // Delete Account
  async deleteAccount(password) {
    const token = getAuthToken();
    if (!token) {
      throw new SettingsError(ERROR_MESSAGES.MISSING_TOKEN, "MISSING_TOKEN", 401);
    }

    if (!password) {
      throw new SettingsError("Please enter your password to confirm account deletion.", "VALIDATION_ERROR", 400);
    }

    try {
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
        // Special handling for incorrect password
        if (response.status === 400 || response.status === 401) {
          const msg = data?.message?.toLowerCase() || "";
          if (msg.includes("incorrect") || msg.includes("wrong") || msg.includes("invalid") || msg.includes("password")) {
            throw new SettingsError(ERROR_MESSAGES.INCORRECT_PASSWORD, "INCORRECT_PASSWORD", 400);
          }
        }
        handleApiError(response, data, ERROR_MESSAGES.DELETE_FAILED);
      }

      return data;
    } catch (error) {
      handleNetworkError(error);
    }
  }
};

export default SettingsService;
export { SettingsError, ERROR_MESSAGES };
