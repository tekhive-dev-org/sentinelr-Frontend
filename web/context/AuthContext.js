import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import logger from "../utils/logger";

const AuthContext = createContext();

const API_URL = "https://sentinelr-backend.onrender.com/api/auth";

// Helper function for API calls with proper error handling
const apiRequest = async (endpoint, method, body = null, token = null) => {
  const url = `${API_URL}/${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  logger.api.request(method, url, body);

  const response = await fetch(url, options);
  const contentType = response.headers.get("content-type");
  let data;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  logger.api.response(response.status, response.statusText, data);

  if (!response.ok) {
    const errorMessage = data?.message || data || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for stored user/token on mount
    const initAuth = async () => {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        
        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      logger.auth.debug(`Login attempt for: ${email}`);
      
      const data = await apiRequest("login", "POST", { email, password });
      
      logger.auth.info("Login successful");
      
      const userData = data.user || data;
      const token = data.token;

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      if (token) {
        localStorage.setItem("token", token);
      }
      
      return { success: true, data };
    } catch (error) {
      logger.auth.error("Login failed", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userName, email, password, confirmPassword, role = "Parent") => {
    setLoading(true);
    try {
      logger.auth.debug(`Signup attempt for: ${email}`);
      
      const data = await apiRequest("register", "POST", {
        userName,
        email,
        password,
        confirmPassword,
        role
      });
      
      logger.auth.info("Signup successful, OTP sent");
      
      // Store pending user details and token for verification step
      const pendingUser = { userName, email, role };
      localStorage.setItem("pending_user", JSON.stringify(pendingUser));
      
      // Store registration token if provided (needed for verification)
      // API returns token as 'regToken' not 'token'
      const regToken = data.regToken || data.token;
      if (regToken) {
        localStorage.setItem("pending_token", regToken);
        logger.auth.debug("Stored pending token for verification");
      }

      return { success: true, data };
    } catch (error) {
      logger.auth.error("Signup failed", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (email, otp) => {
    setLoading(true);
    try {
      logger.auth.debug(`Verifying OTP for: ${email}`);
      
      // Get the pending token from registration
      const pendingToken = localStorage.getItem("pending_token");
      
      if (!pendingToken) {
        logger.auth.warn("No pending token found, verification may fail");
      }
      
      // Call verify endpoint with auth token
      const url = `${API_URL}/verify/otp`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${pendingToken}`,
        },
        body: JSON.stringify({ email, otp }),
      });
      
      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      logger.api.response(response.status, response.statusText, data);
      
      if (!response.ok) {
        throw new Error(data?.message || data || `Verification failed with status ${response.status}`);
      }
      
      logger.auth.info("Verification successful");
      
      // Get pending user data or use response data
      let userData = data.user || data;
      
      if (typeof window !== "undefined") {
        const pendingStr = localStorage.getItem("pending_user");
        if (pendingStr) {
          const pending = JSON.parse(pendingStr);
          if (pending.email === email) {
            userData = { ...userData, ...pending };
          }
        }
      }

      // Use new token from verification response, or keep pending token
      const token = data.token || pendingToken;

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      if (token) {
        localStorage.setItem("token", token);
      }
      
      // Cleanup pending data
      localStorage.removeItem("pending_user");
      localStorage.removeItem("pending_token");

      return { success: true, data };
    } catch (error) {
      logger.auth.error("Verification failed", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    try {
      logger.auth.debug(`Forgot password request for: ${email}`);
      
      const data = await apiRequest("reset-password", "POST", { email });
      
      logger.auth.info("Password reset email sent");
      
      return { success: true, message: data.message || "Password reset link sent" };
    } catch (error) {
      logger.auth.error("Forgot password failed", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    setLoading(true);
    try {
      logger.auth.debug("Resetting password with token");
      
      const data = await apiRequest("reset-password", "POST", { 
        token, 
        newPassword 
      });
      
      logger.auth.info("Password reset successful");
      
      return { success: true, message: data.message || "Password reset successful" };
    } catch (error) {
      logger.auth.error("Reset password failed", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logger.auth.info("Logging out user");
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("pending_user");
      localStorage.removeItem("pending_token");
    }
    router.push("/login");
  };

  const updateProfilePicture = async (formData) => {
    setLoading(true);
    try {
      logger.auth.debug("Updating profile picture");
      
      const token = localStorage.getItem("token");
      
      // For file uploads, we need to use FormData without JSON content-type
      const response = await fetch(`${API_URL}/update-profile-picture`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData, // FormData for file upload
      });

      const data = await response.json();
      
      logger.api.response(response.status, response.statusText, data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile picture");
      }
      
      logger.auth.info("Profile picture updated");
      
      const updatedUser = { ...user, ...data.user };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      return { success: true, data };
    } catch (error) {
      logger.auth.error("Update profile picture failed", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend OTP verification code
   * TODO: Update endpoint when backend implements dedicated resend-otp endpoint
   */
  const resendOTP = async (email) => {
    setLoading(true);
    try {
      logger.auth.debug(`Resending OTP for: ${email}`);
      
      // Get cached user data from localStorage
      const pendingUserStr = localStorage.getItem("pending_user");
      if (!pendingUserStr) {
        throw new Error("No pending registration found. Please sign up again.");
      }
      
      const pendingUser = JSON.parse(pendingUserStr);
      if (pendingUser.email !== email) {
        throw new Error("Email mismatch. Please sign up again.");
      }

      // TODO: Replace with dedicated resend-otp endpoint when available
      // For now, this is a placeholder that indicates the feature needs backend support
      // const data = await apiRequest("resend-otp", "POST", { email });
      
      logger.auth.warn("Resend OTP endpoint not yet implemented - backend pending");
      
      return { 
        success: false, 
        error: "Resend OTP feature coming soon. Please wait a moment and try verification again." 
      };
    } catch (error) {
      logger.auth.error("Resend OTP failed", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        loading, 
        login, 
        signup, 
        logout, 
        verifyEmail,
        forgotPassword,
        resetPassword,
        updateProfilePicture,
        resendOTP
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
