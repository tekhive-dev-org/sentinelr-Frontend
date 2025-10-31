import { createContext, useContext, useState } from "react";

// 1 Create the context
const AuthContext = createContext();

// 2 Create the provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // store user object or null
  const [loading, setLoading] = useState(false);

  // Example login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      // Normally you'd send a request to your backend here
      // For demo: simulate a successful login
      const fakeUser = { email, name: "John Doe", token: "123abc" };
      setUser(fakeUser);
      localStorage.setItem("user", JSON.stringify(fakeUser));
    } finally {
      setLoading(false);
    }
  };

  // Example logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // Example signup
  const signup = async (email, password) => {
    // Similar to login
    const fakeUser = { email, name: "New User", token: "xyz456" };
    setUser(fakeUser);
    localStorage.setItem("user", JSON.stringify(fakeUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3 Custom hook to use Auth context easily
export const useAuth = () => useContext(AuthContext);
