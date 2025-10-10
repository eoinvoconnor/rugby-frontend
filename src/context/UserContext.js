// src/context/UserContext.js
import React, { createContext, useState, useEffect, useContext } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // 🔹 Restore user + token from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
        console.log("✅ Restored session from localStorage");
      } catch (err) {
        console.error("❌ Failed to parse stored user:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  // 🔹 Login helper — store both user + token
  const login = (userData, jwtToken) => {
    setUser(userData);

    // Support both explicit token and fallback (if backend sets it)
    const finalToken = jwtToken || userData?.token || token;
    if (finalToken) {
      setToken(finalToken);
      localStorage.setItem("token", finalToken);
      console.log("🔐 Token saved during login");
    } else {
      console.warn("⚠️ Login called without token");
    }

    localStorage.setItem("user", JSON.stringify(userData));
    console.log("✅ Logged in:", userData);
  };

  // 🔹 Logout helper — clear everything
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    console.log("✅ Logged out, session cleared");
  };

  return (
    <UserContext.Provider value={{ user, token, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// ✅ Hook for child components
export const useUser = () => useContext(UserContext);