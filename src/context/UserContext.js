// src/context/UserContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "../api/api";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // ✅ Restore user + token on app load
  useEffect(() => {
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    const storedToken = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (err) {
        console.error("❌ Failed to restore user:", err);
      }
    }
  }, []);

  // 🔹 Login user with JWT
  const loginUser = async (email, password, rememberMe = false) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Login failed");
      }

      const data = await res.json(); // { token, user }

      setUser(data.user);
      setToken(data.token);

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("user", JSON.stringify(data.user));
      storage.setItem("token", data.token);

      return data.user;
    } catch (err) {
      console.error("❌ Login error:", err);
      return null;
    }
  };

  // 🔹 Logout user
  const logoutUser = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
  };

  // 🔹 Utility to fetch with auth headers
  const authFetch = async (endpoint, options = {}) => {
    const headers = {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    };

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    return res.json();
  };

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        isAdmin: user?.isAdmin || false,
        loginUser,
        logoutUser,
        authFetch,
        isLoggedIn: !!user && !!token,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);