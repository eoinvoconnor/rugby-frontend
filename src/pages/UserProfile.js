// src/UserProfile.js
import React from "react";
import {
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  Chip,
  Snackbar,
  Alert
} from "@mui/material";
import { apiFetch } from "../api/api";
import { useUser } from "../context/UserContext"; // if used in that file
function UserProfile() {
  const { user, logoutUser } = useUser();
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "info",
  });

  if (!user) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6">⚠️ You must log in to view your profile.</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          My Profile
        </Typography>

        <Stack spacing={2} sx={{ mt: 2 }}>
          <Typography>
            <strong>Name:</strong> {user.firstname} {user.surname}
          </Typography>
          <Typography>
            <strong>Email:</strong> {user.email}
          </Typography>
          <Typography>
            <strong>Role:</strong>{" "}
            {user.isAdmin ? (
              <Chip label="Admin" color="secondary" size="small" />
            ) : (
              <Chip label="User" color="primary" size="small" />
            )}
          </Typography>
        </Stack>

        <Button
          variant="contained"
          color="error"
          sx={{ mt: 3 }}
          onClick={() => {
            logoutUser();
            setSnackbar({
              open: true,
              message: "👋 You have been logged out.",
              severity: "info",
            });
          }}
        >
          Logout
        </Button>
      </Paper>

      {/* 🚨 Snackbar for forced logout */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default UserProfile;