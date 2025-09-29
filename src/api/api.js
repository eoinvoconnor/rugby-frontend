// src/api/api.js

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

/**
 * Wrapper for API fetch calls
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  try {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      ...options,
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.error("Fetch error:", err);
    throw err;
  }
}

/**
 * Utility to get backend status for the banner
 */
export function getBackendStatus() {
  return {
    url: API_BASE_URL,
    ok: !!API_BASE_URL,
  };
}