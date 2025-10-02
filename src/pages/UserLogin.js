// src/pages/UserLogin.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { apiFetch } from "../api/api"; // ✅ fixed import

function UserLogin() {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [surname, setSurname] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!email || !firstname || !surname) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const res = await apiFetch("/users/login", {
        method: "POST",
        body: JSON.stringify({ email, firstname, surname }),
      });

      if (!res || !res.id) {
        throw new Error("Login failed");
      }

      setUser(res);

      if (rememberMe) {
        localStorage.setItem("user", JSON.stringify(res));
      } else {
        sessionStorage.setItem("user", JSON.stringify(res));
      }

      // ✅ Redirect to Matches page after login/register
      navigate("/");
    } catch (err) {
      console.error("❌ Login error:", err);
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