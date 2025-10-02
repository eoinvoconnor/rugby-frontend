// src/pages/UserProfile.js
import React from "react";
import { useUser } from "../context/UserContext";
import { Box, Typography, Paper } from "@mui/material";

function UserProfile() {
  const { user } = useUser();

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
      </Paper>
    </Box>
  );
}

export default UserProfile;