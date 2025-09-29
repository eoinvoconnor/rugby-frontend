// src/UserLogin.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/api";
import { useUser } from "../context/UserContext"; // if used in that fileimport 
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  FormControlLabel,
  Checkbox
} from "@mui/material";

function UserLogin() {
  const navigate = useNavigate();
  const { user, loginUser } = useUser();

  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [surname, setSurname] = useState("");
  const [rememberMe, setRememberMe] = useState(true); // ✅ default ON
  const [error, setError] = useState("");

  // 🔹 If already logged in, skip login page
  useEffect(() => {
    if (user) {
      navigate("/matches");
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    setError("");

    if (!email || !firstname || !surname) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      // ✅ Use context login function
      const loggedInUser = await loginUser(email, firstname, surname, rememberMe);

      if (!loggedInUser) {
        throw new Error("Login failed");
      }

      navigate("/matches");
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
    >
      <Paper elevation={3} sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" gutterBottom>
          Login / Register
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          label="First Name"
          fullWidth
          margin="normal"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
        />

        <TextField
          label="Surname"
          fullWidth
          margin="normal"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
        />

        {/* ✅ Remember Me option */}
        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              color="primary"
            />
          }
          label="Remember me on this device"
          sx={{ mt: 1 }}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleLogin}
        >
          Submit
        </Button>
      </Paper>
    </Box>
  );
}

export default UserLogin;