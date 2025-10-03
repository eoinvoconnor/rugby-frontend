// src/context/UserContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../api/api";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("authToken") || null);

  // Load user from token on mount
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({
          id: payload.id,
          email: payload.email,
          isAdmin: payload.isAdmin,
        });
      } catch (err) {
        console.error("❌ Invalid stored token", err);
        logout();
      }
    }
  }, [token]);

  // Save/remove token in localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }, [token]);

  // Login (or register auto-create)
  const login = async (email, firstname = "", surname = "") => {
    const res = await apiFetch("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, firstname, surname }),
    });

    if (res.token) {
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error("Login failed");
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
  };

  // Attach token to API requests automatically
  const authFetch = (endpoint, options = {}) => {
    if (!token) throw new Error("Not authenticated");
    return apiFetch(endpoint, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  };

  return (
    <UserContext.Provider value={{ user, token, login, logout, authFetch }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}