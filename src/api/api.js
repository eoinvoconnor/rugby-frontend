// src/api/api.js

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001";

// 🔹 Helper for fetch requests
async function request(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ✅ important for cookies/sessions
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

// 🔹 API functions
export async function fetchCompetitions() {
  return request("/api/competitions");
}

export async function fetchMatches() {
  return request("/api/matches");
}

export async function fetchLeaderboard() {
  return request("/api/leaderboard");
}

export async function fetchPredictions(userId) {
  return request(`/api/predictions/${userId}`);
}

export async function submitPrediction(prediction) {
  return request("/api/predictions", {
    method: "POST",
    body: JSON.stringify(prediction),
  });
}

// 🔹 Default export (so pages can call apiFetch.fetchMatches etc.)
const apiFetch = {
  fetchCompetitions,
  fetchMatches,
  fetchLeaderboard,
  fetchPredictions,
  submitPrediction,
};

export default apiFetch;