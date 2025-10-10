// src/pages/AdminPage.js
import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  IconButton,
  Tooltip,
  Checkbox,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ReplayIcon from "@mui/icons-material/Replay";
import SearchIcon from "@mui/icons-material/Search";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";

import { apiFetch } from "../api/api";
import { UserContext } from "../context/UserContext";

function AdminPage() {
  const { user, logout } = useContext(UserContext);

  // === State ===
  const [competitions, setCompetitions] = useState([]);
  const [newCompetition, setNewCompetition] = useState({
    name: "",
    url: "",
    color: "#1976d2",
  });
  const [matches, setMatches] = useState([]);
  const [matchSearch, setMatchSearch] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    firstname: "",
    surname: "",
    email: "",
    isAdmin: false,
  });
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    loadCompetitions();
    loadMatches();
    loadUsers();
  }, []);

  // === Loaders ===
  const loadCompetitions = async () => {
    try {
      const data = await apiFetch("/competitions");
      setCompetitions(data);
    } catch (err) {
      console.error("❌ Failed to load competitions", err);
    }
  };

  const refreshCompetitions = async () => {
    try {
      const data = await apiFetch("/competitions");
      setCompetitions(data);
      console.log("✅ Competitions refreshed");
    } catch (err) {
      console.error("❌ Failed to refresh competitions", err);
    }
  };

  const loadMatches = async () => {
    try {
      const data = await apiFetch("/matches");
      setMatches(data);
    } catch (err) {
      console.error("❌ Failed to load matches", err);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await apiFetch("/users");
      setUsers(data);
    } catch (err) {
      console.error("❌ Failed to load users", err);
    }
  };

  // === Competitions ===
  const handleAddCompetition = async () => {
    if (!newCompetition.name || !newCompetition.url) return;
    try {
      const data = await apiFetch("/competitions", {
        method: "POST",
        body: JSON.stringify(newCompetition),
      });
      setCompetitions([...competitions, data]);
      setNewCompetition({ name: "", url: "", color: "#1976d2" });
    } catch (err) {
      console.error("❌ Failed to add competition", err);
    }
  };

  const handleUpdateCompetition = (id, field, value) => {
    const updated = competitions.map((c) =>
      c.id === id ? { ...c, [field]: value } : c
    );
    setCompetitions(updated);
  };

  const saveCompetition = async (competition) => {
    try {
      await apiFetch(`/competitions/${competition.id}`, {
        method: "PUT",
        body: JSON.stringify(competition),
      });
    } catch (err) {
      console.error("❌ Failed to save competition", err);
    }
  };

  const deleteCompetition = async (id) => {
    try {
      await apiFetch(`/competitions/${id}`, { method: "DELETE" });
      setCompetitions(competitions.filter((c) => c.id !== id));
    } catch (err) {
      console.error("❌ Failed to delete competition", err);
    }
  };

  // === Users ===
  const handleAddUser = async () => {
    if (!newUser.firstname || !newUser.surname || !newUser.email) {
      alert("⚠️ Please fill in all required fields (firstname, surname, email).");
      return;
    }
    try {
      const data = await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify(newUser),
      });
      if (!data || data.error) {
        alert(`❌ Failed to add user: ${data?.error || "Unknown error"}`);
        return;
      }
      alert(`✅ User "${data.firstname} ${data.surname}" added successfully!`);
      setNewUser({ firstname: "", surname: "", email: "", isAdmin: false });
      const refreshed = await apiFetch("/users");
      setUsers(refreshed);
    } catch (err) {
      console.error("❌ Failed to add user", err);
      alert("Error adding user — check console for details.");
    }
  };

  const handleUpdateUser = (id, field, value) => {
    const updated = users.map((u) =>
      u.id === id ? { ...u, [field]: value } : u
    );
    setUsers(updated);
  };

  const saveUser = async (user) => {
    try {
      await apiFetch(`/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify(user),
      });
    } catch (err) {
      console.error("❌ Failed to save user", err);
    }
  };

  const deleteUser = async (id) => {
    try {
      await apiFetch(`/users/${id}`, { method: "DELETE" });
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      console.error("❌ Failed to delete user", err);
    }
  };

  // === Utility ===
  const forceLogout = async () => {
    try {
      await apiFetch("/admin/force-logout", { method: "POST" });
      alert("All users logged out");
    } catch (err) {
      console.error("❌ Failed to force logout", err);
    }
  };

  // === Render ===
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Panel
      </Typography>

      {/* Toolbar */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Tooltip title="Recalculate Leaderboard">
          <IconButton color="primary">
            <ReplayIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit Mode">
          <IconButton color="secondary">
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Force Logout All Users">
          <IconButton color="error" onClick={forceLogout}>
            <ExitToAppIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* === Competitions === */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Competitions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="Competition Name"
              value={newCompetition.name}
              onChange={(e) =>
                setNewCompetition({ ...newCompetition, name: e.target.value })
              }
            />
            <TextField
              label="Feed URL"
              value={newCompetition.url}
              onChange={(e) =>
                setNewCompetition({ ...newCompetition, url: e.target.value })
              }
              sx={{ flex: 1 }}
            />
            <IconButton color="primary" onClick={handleAddCompetition}>
              <AddIcon />
            </IconButton>
          </Box>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Feed</TableCell>
                <TableCell>Color</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {competitions.map((c) => (
                <TableRow key={c.id}>
                  <TableCell sx={{ padding: "4px 8px" }}>
                    <TextField
                      value={c.name}
                      onChange={(e) =>
                        handleUpdateCompetition(c.id, "name", e.target.value)
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ padding: "4px 8px" }}>
                    <TextField
                      value={c.url}
                      onChange={(e) =>
                        handleUpdateCompetition(c.id, "url", e.target.value)
                      }
                      fullWidth
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ padding: "4px 8px" }}>
                    <TextField
                      type="color"
                      value={c.color}
                      onChange={(e) =>
                        handleUpdateCompetition(c.id, "color", e.target.value)
                      }
                      sx={{ width: 40 }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ padding: "4px 8px" }}>
                    <Tooltip title="Refresh">
                      <IconButton onClick={refreshCompetitions}>
                        <RefreshIcon color="primary" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Save">
                      <IconButton onClick={() => saveCompetition(c)}>
                        <SaveIcon color="success" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => deleteCompetition(c.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AccordionDetails>
      </Accordion>

      {/* === Matches === */}
      {/* unchanged */}

      {/* === Users === */}
      {/* unchanged */}
    </Box>
  );
}

export default AdminPage;