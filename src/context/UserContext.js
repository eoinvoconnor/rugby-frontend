// src/context/UserContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../api/api";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load user from storage on startup
  useEffect(() => {
    const storedUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user"));
    const storedToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser({ ...storedUser, token: storedToken });
    }
    setLoading(false);
  }, []);

  // ✅ Login or register user
  const loginUser = async (email, _password, rememberMe, firstname, surname) => {
    try {
      const data = await apiFetch("/users/login", {
        method: "POST",
        body: JSON.stringify({ email, firstname, surname }),
      });

      if (data.token && data.user) {
        const fullUser = {
          id: data.user.id,
          email: data.user.email,
          firstname: data.user.firstname,
          surname: data.user.surname,
          isAdmin: data.user.isAdmin || false,
          token: data.token,
        };

        setUser(fullUser);

        if (rememberMe) {
          localStorage.setItem("user", JSON.stringify(fullUser));
          localStorage.setItem("token", data.token);
        } else {
          sessionStorage.setItem("user", JSON.stringify(fullUser));
          sessionStorage.setItem("token", data.token);
        }

        return fullUser;
      } else {
        throw new Error("Invalid login response");
      }
    } catch (err) {
      console.error("❌ Login failed in context:", err);
      throw err;
    }
  };

  // ✅ Logout user
  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
  };

  return (
    <UserContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}