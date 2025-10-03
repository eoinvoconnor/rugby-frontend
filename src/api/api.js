// src/api/api.js

// Base URL: use Render variable in prod, fallback to localhost (with /api)
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

// Get token from localStorage
function getToken() {
  return localStorage.getItem("token");
}

// Save token to localStorage
export function setToken(token) {
  localStorage.setItem("token", token);
}

// Remove token from localStorage
export function clearToken() {
  localStorage.removeItem("token");
}

/**
 * Helper function to fetch from backend
 * Always prepends API_BASE_URL
 * Automatically attaches Authorization header if token exists
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const token = getToken();

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      console.error(`❌ API error ${response.status} on ${url}`);
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error("❌ API fetch failed:", err, "URL:", url, "Options:", options);
    throw err;
  }
}

// Export base URL too (useful for debugging or server status banners)
export { API_BASE_URL };