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

  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include", // ✅ ensure cookies/session are sent
      headers: {
        "Content-Type": "application/json",
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