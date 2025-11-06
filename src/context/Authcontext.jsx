import { createContext, useContext, useState } from "react";


const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(false);

  
  const login = async (email, password) => {
    setLoading(true);
    try {
      
      const fakeUser = { email, name: "John Doe", token: "123abc" };
      setUser(fakeUser);
      localStorage.setItem("user", JSON.stringify(fakeUser));
    } finally {
      setLoading(false);
    }
  };


  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };


  const signup = async (email, password) => {
   
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


export const useAuth = () => useContext(AuthContext);