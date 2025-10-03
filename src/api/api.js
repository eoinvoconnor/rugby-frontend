// src/api/api.js

// Base URL: use Render variable in prod, fallback to localhost (with /api)
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

// ===== Token helpers =====

// Get token from localStorage
function getToken() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("⚠️ No token found in localStorage");
  }
  return token;
}

// Save token to localStorage
export function setToken(token) {
  if (token) {
    localStorage.setItem("token", token);
    console.log("✅ Token saved to localStorage");
  } else {
    console.warn("⚠️ Tried to save empty token");
  }
}

// Remove token from localStorage
export function clearToken() {
  localStorage.removeItem("token");
  console.log("🗑️ Token cleared from localStorage");
}

// ===== API fetch wrapper =====
/**
 * Helper function to fetch from backend
 * Always prepends API_BASE_URL
 * Automatically attaches Authorization header if token exists
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${
    endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  }`;
  const token = getToken();

  try {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (token && token.trim() !== "") {
      headers.Authorization = `Bearer ${token}`;
      console.log("🔐 Using token in request headers");
    } else {
      console.warn("⚠️ No valid token attached to request");
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      console.error(`❌ API error ${response.status} on ${url}`);
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error(
      "❌ API fetch failed:",
      err,
      "URL:",
      url,
      "Options:",
      options
    );
    throw err;
  }
}

// Export base URL too (useful for debugging or server status banners)
export { API_BASE_URL };