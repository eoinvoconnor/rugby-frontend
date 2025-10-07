// src/context/UserContext.js
import React, { createContext, useState, useEffect, useContext } from "react";

// ✅ Create the context once
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // 🔹 Load user + token from localStorage on first mount
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

  // 🔹 Login: save both to state + localStorage
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwtToken);
    console.log("✅ Logged in:", userData);
  };

  // 🔹 Logout: clear state + localStorage
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

// ✅ Hook export for easy use in components
export const useUser = () => useContext(UserContext);