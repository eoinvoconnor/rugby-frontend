// src/pages/UserLogin.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
} from "@mui/material";

export default function UserLogin() {
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [surname, setSurname] = useState("");
  const [error, setError] = useState("");
  const { login } = useUser(); // ✅ use context login
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    try {
      // ✅ Perform login/register
      const { user, token } = await login(email, firstname, surname);

      if (token) {
        // ✅ Explicitly store token in localStorage for API calls
        localStorage.setItem("token", token);
      }

      console.log("✅ Logged in:", user);
      navigate("/"); // redirect to MatchesPage
    } catch (err) {
      console.error("❌ Login error:", err);
      setError("Login failed. Please check your details.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Login / Register
        </Typography>
        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="First Name"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Surname"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          sx={{ mb: 2 }}
        />
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Box textAlign="center">
          <Button variant="contained" color="primary" onClick={handleLogin}>
            Login / Register
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}