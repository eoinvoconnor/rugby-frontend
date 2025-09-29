// src/api.js
// test
// Default to Render backend in production, localhost in dev
const backend =
  process.env.REACT_APP_BACKEND_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://rugby-backend.onrender.com"
    : "http://localhost:5001");

export async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(`${backend}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API error: ${res.status} - ${text}`);
    }

    return await res.json();
  } catch (err) {
    console.error("❌ API fetch failed:", err);
    throw err;
  }
}