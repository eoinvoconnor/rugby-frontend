import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Alert,
} from "@mui/material";
import { useUser } from "../context/UserContext";
import apiFetch from "../api/api"; // ✅ fixed import

function UserProfile() {
  const { user, setUser } = useUser();
  const [firstname, setFirstname] = useState(user?.firstname || "");
  const [surname, setSurname] = useState(user?.surname || "");
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setFirstname(user.firstname || "");
      setSurname(user.surname || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      const updated = await apiFetch(`/api/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({ firstname, surname, email }),
      });

      if (updated && updated.id) {
        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));
        setMessage("✅ Profile updated successfully.");
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      console.error("❌ Profile update error:", err);
      setMessage("❌ Failed to update profile.");
    }
  };

  if (!user) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">⚠️ Please log in to view your profile.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          My Profile
        </Typography>

        {message && (
          <Alert
            severity={message.startsWith("✅") ? "success" : "error"}
            sx={{ mb: 2 }}
          >
            {message}
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
          <Button variant="contained" onClick={handleSave}>
            Save Changes
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

export default UserProfile;