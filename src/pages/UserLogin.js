// src/pages/UserLogin.js
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { API_BASE_URL } from "../api/api";

export default function UserLogin() {
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [surname, setSurname] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");

    try {
      // ✅ Perform backend login/register request
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstname, surname }),
      });

      if (!response.ok) {
        throw new Error(`Login failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data && data.token && data.user) {
        // ✅ Store token and user in context + localStorage
        login(data.user, data.token);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log("✅ Logged in:", data.user);
        navigate("/"); // redirect to MatchesPage
      } else {
        console.error("❌ Invalid response format:", data);
        setError("Unexpected server response.");
      }
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