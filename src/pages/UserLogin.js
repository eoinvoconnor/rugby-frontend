import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Paper,
  Typography,
  Stack,
  FormControlLabel,
  Checkbox,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import apiFetch from "../api/api"; // ✅ fixed import

function UserLogin() {
  const navigate = useNavigate();
  const { loginUser } = useUser();
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [surname, setSurname] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !firstname || !surname) {
      setError("⚠️ Please fill all fields.");
      return;
    }
    setError("");

    try {
      const user = await loginUser(email, firstname, surname, rememberMe);
      if (user) {
        navigate("/matches");
      } else {
        setError("❌ Login failed.");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setError("❌ An error occurred. Please try again.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2}>
          <TextField
            label="First Name"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            fullWidth
          />
          <TextField
            label="Surname"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            fullWidth
          />
          <TextField
            label="Email"
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
            }
            label="Remember Me"
          />
          <Button variant="contained" onClick={handleLogin}>
            Login
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

export default UserLogin;