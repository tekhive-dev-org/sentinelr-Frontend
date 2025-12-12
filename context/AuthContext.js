import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";

const AuthContext = createContext();

const API_URL = "https://sentinelr-backend.onrender.com/api/auth";

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const isAdmin = email.toLowerCase().includes('admin');
      const role = isAdmin ? 'admin' : 'Parent';

      const mockUser = {
        _id: "mock-user-id",
        email: email,
        name: isAdmin ? "Admin User" : "Mock User",
        role: role, 
        avatar: "/assets/images/avatar-placeholder.png" 
      };
      const mockToken = "mock-jwt-token";

      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
      localStorage.setItem("token", mockToken);
      
      return { success: true };
    } catch (error) {
      console.error("Login Error:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userName, email, password, confirmPassword, role = "Parent") => {
    setLoading(true);
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Store pending user details for verification step to pick up
        const pendingUser = { userName, email, role };
        localStorage.setItem("mock_pending_user", JSON.stringify(pendingUser));

        // Mock success response
      return { success: true, data: { message: "Signup successful" } };
    } catch (error) {
      console.error("Signup Error:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (email, otp) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // checks for pending user data from signup
      let role = "Parent";
      let name = "Mock User";
      
      if (typeof window !== "undefined") {
          const pendingStr = localStorage.getItem("mock_pending_user");
          if (pendingStr) {
              const pending = JSON.parse(pendingStr);
              // Simple check if it matches the email being verified
              if (pending.email === email) {
                  role = pending.role;
                  name = pending.userName;
              }
          }
      }

      // Auto-login on verification for smoother mock flow
      const mockUser = {
        _id: "mock-user-id",
        email: email,
        name: name,
        role: role, 
        avatar: "/assets/images/avatar-placeholder.png" 
      };
      const mockToken = "mock-jwt-token";

      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
      localStorage.setItem("token", mockToken);
      
      // Cleanup pending
      localStorage.removeItem("mock_pending_user");

      return { success: true, data: { message: "Email verified" } };
    } catch (error) {
       console.error("Verification Error:", error);
       return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
      setLoading(true);
      try {
          await new Promise(resolve => setTimeout(resolve, 1000));
           return { success: true, message: "Password reset link sent (mock)" };
      } catch (error) {
          console.error("Forgot Password Error:", error);
          return { success: false, error: error.message };
      } finally {
          setLoading(false);
      }
  };

  const resetPassword = async (token, newPassword) => {
      setLoading(true);
      try {
           await new Promise(resolve => setTimeout(resolve, 1000));
           return { success: true, message: "Password reset successful" };
      } catch (error) {
          return { success: false, error: error.message };
      } finally {
          setLoading(false);
      }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
    router.push("/login");
  };

  const updateProfilePicture = async (formData) => {
    setLoading(true);
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
         // Update local user state with a fake new image URL if possible, or just keep same
         // Ideally we'd read the file from formData but that's complex to mock purely frontend without URL.createObjectURL
         // Let's just pretend we updated it.
         
         const updatedUser = { ...user, avatar: "/assets/images/avatar-placeholder.png" }; // Or keep existing
         setUser(updatedUser);
         localStorage.setItem("user", JSON.stringify(updatedUser));
         
         return { success: true, data: { user: updatedUser } };

    } catch (error) {
        return { success: false, error: error.message };
    } finally {
        setLoading(false);
    }
  }

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
        updateProfilePicture
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
