import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { API_BASE_URL } from "../config/api";
import { AUTH_SESSION_EXPIRED_EVENT } from "../utils/apiErrors";
import { ADMIN_PERMISSIONS } from "../constants/permissions";

const AuthContext = createContext();

const AUTH_API = `${API_BASE_URL}/auth`;
const SESSION_URL = `${AUTH_API}/logged-in-user`;

const IS_DEMO_MODE = !API_BASE_URL;

const ALL_PERMISSIONS = Object.freeze(Object.values(ADMIN_PERMISSIONS));

const DEMO_ADMIN = Object.freeze({
  id: "demo-admin-001",
  email: "admin@sentinelr.app",
  firstName: "Demo",
  lastName: "Admin",
  roles: ["admin"],
  permissions: ALL_PERMISSIONS,
  adminProfile: {
    id: "demo-profile-001",
    roles: ["admin"],
    permissions: ALL_PERMISSIONS,
  },
});

const DEMO_TOKEN = "demo-token-sentinelr-admin";

function parseErrorMessage(data, status, statusText) {
  if (data && typeof data === "object" && data.message) return data.message;
  if (typeof data === "string") {
    if (data.includes("<!DOCTYPE") || data.includes("<html")) {
      switch (status) {
        case 400: return "Invalid request.";
        case 401: return "Invalid credentials.";
        case 403: return "Access denied.";
        case 404: return "Service unavailable.";
        case 429: return "Too many attempts. Please wait.";
        case 500: case 502: case 503: case 504: return "Server error.";
        default: return `Request failed. (Error ${status})`;
      }
    }
    if (data.length < 200) return data;
  }
  return statusText || `Request failed with status ${status}`;
}

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionVerified, setIsSessionVerified] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const hasInitialized = useRef(false);

  const fetchDemoSession = useCallback(() => {
    localStorage.setItem("token", DEMO_TOKEN);
    localStorage.setItem("adminUser", JSON.stringify(DEMO_ADMIN));
    setAdminUser(DEMO_ADMIN);
    setIsSessionVerified(true);
    setSessionError("");
    return { success: true, user: DEMO_ADMIN };
  }, []);

  const fetchAdminSession = useCallback(async (token) => {
    if (IS_DEMO_MODE && token === DEMO_TOKEN) {
      return fetchDemoSession();
    }

    try {
      const response = await fetch(SESSION_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-access-token": token,
        },
      });

      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const status = response.status;
        const message = parseErrorMessage(data, status, response.statusText);
        if (status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("adminUser");
          setAdminUser(null);
          setIsSessionVerified(false);
          setSessionError("Your session has expired. Please sign in again.");
          router.replace("/login");
          return { success: false, error: message, status };
        }
        throw Object.assign(new Error(message), { status });
      }

      const responseUser = data.user || data;
      const verifiedUser = {
        ...responseUser,
        roles: data.roles || data.adminProfile?.roles || responseUser.roles,
        permissions: data.permissions || data.adminProfile?.permissions || responseUser.permissions,
        adminProfile: data.adminProfile || responseUser.adminProfile,
        session: data.session || responseUser.session,
      };

      localStorage.setItem("adminUser", JSON.stringify(verifiedUser));
      setAdminUser(verifiedUser);
      setIsSessionVerified(true);
      setSessionError("");
      return { success: true, user: verifiedUser };
    } catch (error) {
      setSessionError(error.message || "Unable to verify your admin session.");
      return { success: false, error: error.message, status: error.status };
    }
  }, [router, fetchDemoSession]);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const init = async () => {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("token");
      if (token) {
        const result = await fetchAdminSession(token);
        if (!result.success) {
          const storedUser = localStorage.getItem("adminUser");
          if (storedUser) {
            try {
              const parsed = JSON.parse(storedUser);
              setAdminUser(parsed);
              if (IS_DEMO_MODE && token === DEMO_TOKEN) {
                setIsSessionVerified(true);
                setSessionError("");
              }
            } catch {
              localStorage.removeItem("adminUser");
              setAdminUser(null);
            }
          }
        }
      }

      setIsLoading(false);
    };

    init();
  }, [fetchAdminSession]);

  useEffect(() => {
    const handleExpired = () => {
      setAdminUser(null);
      setIsSessionVerified(false);
      setSessionError("Your session expired. Please sign in again.");
      localStorage.removeItem("token");
      localStorage.removeItem("adminUser");
      router.replace("/login");
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleExpired);
  }, [router]);

  const login = async (email, password) => {
    setIsLoading(true);
    setIsSessionVerified(false);
    setSessionError("");

    if (IS_DEMO_MODE) {
      try {
        if (!email.trim() || !password.trim()) {
          return { success: false, error: "Please enter your email and password." };
        }

        const isDemoEmail = email.trim().toLowerCase() === DEMO_ADMIN.email;

        if (!isDemoEmail) {
          return { success: false, error: "Demo mode is active. Use admin@sentinelr.com to sign in." };
        }

        localStorage.setItem("token", DEMO_TOKEN);
        const sessionResult = fetchDemoSession();

        if (!sessionResult.success) {
          return { success: false, error: sessionResult.error };
        }

        return { success: true };
      } catch (error) {
        localStorage.removeItem("token");
        return { success: false, error: error.message };
      } finally {
        setIsLoading(false);
      }
    }

    try {
      const response = await fetch(`${AUTH_API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      const token = data.token;
      if (token) {
        localStorage.setItem("token", token);
      }

      const sessionResult = await fetchAdminSession(token);

      if (!sessionResult.success) {
        setAdminUser(data.user || data);
        setSessionError("Session verification failed after login.");
        return { success: false, error: sessionResult.error };
      }

      return { success: true };
    } catch (error) {
      localStorage.removeItem("token");
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAdminUser(null);
    setIsSessionVerified(false);
    setSessionError("");
    localStorage.removeItem("token");
    localStorage.removeItem("adminUser");
    router.replace("/login");
  };

  const refreshSession = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsSessionVerified(false);
      setSessionError("No active session.");
      return { success: false };
    }

    if (IS_DEMO_MODE && token === DEMO_TOKEN) {
      return fetchDemoSession();
    }

    return fetchAdminSession(token);
  };

  return (
    <AuthContext.Provider
      value={{
        adminUser,
        isLoading,
        isSessionVerified,
        sessionError,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AuthContext);
