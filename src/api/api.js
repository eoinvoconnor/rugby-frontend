// src/api/api.js

// Base URL: use Render variable in prod, fallback to localhost (with /api)
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

/**
 * Helper function to fetch from backend
 * Always prepends API_BASE_URL
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  console.log("🌍 API base URL:", API_BASE_URL);
  
  const response = await fetch(url, {
    ...options,
    credentials: "include", // ✅ include cookies/session
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// Optional: export base URL (for debugging/logging)
export { API_BASE_URL };