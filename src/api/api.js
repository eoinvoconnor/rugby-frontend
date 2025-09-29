// src/api/api.js

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://rugby-backend.onrender.com/api"
    : "http://localhost:5000/api";

// Fetch competitions
export async function fetchCompetitions() {
  const res = await fetch(`${API_BASE}/competitions`);
  if (!res.ok) throw new Error("Failed to fetch competitions");
  return res.json();
}

// Fetch matches
export async function fetchMatches() {
  const res = await fetch(`${API_BASE}/matches`);
  if (!res.ok) throw new Error("Failed to fetch matches");
  return res.json();
}

// Fetch leaderboard
export async function fetchLeaderboard() {
  const res = await fetch(`${API_BASE}/leaderboard`);
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
}

// Fetch predictions for a user
export async function fetchPredictions(userId) {
  const res = await fetch(`${API_BASE}/predictions?userId=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch predictions");
  return res.json();
}

// Submit a prediction
export async function submitPrediction(prediction) {
  const res = await fetch(`${API_BASE}/predictions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prediction),
  });
  if (!res.ok) throw new Error("Failed to submit prediction");
  return res.json();
}