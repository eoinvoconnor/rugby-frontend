// src/context/UserContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [sessionVersion, setSessionVersion] = useState(null);

  // ✅ Restore user + session version on app load
  useEffect(() => {
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (err) {
        console.error("❌ Failed to parse stored user:", err);
      }
    }

    // Fetch current session version from backend
    fetch("http://localhost:5001/api/session-version")
      .then((res) => res.json())
      .then((data) => {
        if (data.sessionVersion) {
          setSessionVersion(data.sessionVersion);
        }
      })
      .catch((err) => console.error("❌ Failed to fetch session version:", err));
  }, []);

  // 🔹 Login user and sync session version
  const loginUser = async (email, firstname, surname, rememberMe = false) => {
    try {
      // 1. Get latest session version
      const versionRes = await fetch("http://localhost:5001/api/session-version");
      let currentVersion = null;
      if (versionRes.ok) {
        const { sessionVersion: serverVersion } = await versionRes.json();
        currentVersion = serverVersion;
        setSessionVersion(serverVersion);
      }

      // 2. Login request
      const res = await fetch("http://localhost:5001/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstname, surname }),
      });

      if (!res.ok) {
        throw new Error("Login failed");
      }

      const data = await res.json();

      // 3. Attach session version to user object
      const userWithSession = { ...data, sessionVersion: currentVersion };

      setUser(userWithSession);

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("user", JSON.stringify(userWithSession));

      return userWithSession;
    } catch (err) {
      console.error("Login error:", err);
      return null;
    }
  };

  // 🔹 Logout user (clears both storages)
  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
  };

  // 🔹 Check if session is still valid
  const isSessionValid = () => {
    if (!user) return false;
    return !sessionVersion || user.sessionVersion === sessionVersion;
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isAdmin: user?.isAdmin || false,
        loginUser,
        logoutUser,
        isSessionValid,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);