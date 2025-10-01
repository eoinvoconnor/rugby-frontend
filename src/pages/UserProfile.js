// src/pages/UserProfile.js
import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { Box, Typography, Paper, Button, Stack } from "@mui/material";
import { apiFetch } from "../api/api"; // ✅ fixed import

function UserProfile() {
  const { user, logoutUser } = useUser();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function loadStats() {
      if (!user?.id) return;
      try {
        const data = await apiFetch(`/users/${user.id}/stats`);
        setStats(data);
      } catch (err) {
        console.error("❌ Failed to fetch user stats:", err);
      }
    }
    loadStats();
  }, [user]);

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <Typography variant="h6">You must log in to view your profile.</Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" mt={4}>
      <Paper elevation={3} sx={{ p: 4, width: 500 }}>
        <Typography variant="h5" gutterBottom>
          {user.firstname} {user.surname}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Email: {user.email}
        </Typography>

        {stats ? (
          <Box mt={2}>
            <Typography variant="subtitle1">Your Stats:</Typography>
            <Typography variant="body2">Predictions: {stats.totalPredictions}</Typography>
            <Typography variant="body2">Correct: {stats.correctPredictions}</Typography>
            <Typography variant="body2">Points: {stats.points}</Typography>
            <Typography variant="body2">Accuracy: {stats.accuracy}%</Typography>
          </Box>
        ) : (
          <Typography variant="body2" mt={2}>
            Loading stats...
          </Typography>
        )}

        <Stack direction="row" spacing={2} mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.href = "/matches"}
          >
            Back to Matches
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={logoutUser}
          >
            Logout
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default UserProfile;