import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount (client-side only)
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Simulate API call - replace with real authentication
      const role = email.toLowerCase().includes('admin') ? 'admin' : 'user';
      const fakeUser = {
        email,
        name: role === 'admin' ? 'Chidi British' : 'John Doe',
        token: "123abc",
        role: role,
      };
      setUser(fakeUser);
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(fakeUser));
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }
  };

  const signup = async (email, password) => {
    setLoading(true);
    try {
      // Simulate API call - replace with real authentication
      const fakeUser = {
        email,
        name: "New User",
        token: "xyz456",
        role: "admin",
      };
      setUser(fakeUser);
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(fakeUser));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
