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

import { apiFetch } from "../api/api";
import { UserContext } from "../context/UserContext";

function AdminPage() {
  // ✅ Hooks must be inside the component
  const { user, logout } = useContext(UserContext);

  // ✅ State for competitions
  const [competitions, setCompetitions] = useState([]);
  const [newCompetition, setNewCompetition] = useState({
    name: "",
    url: "",
    color: "#1976d2",
  });

  // ✅ State for matches
  const [matches, setMatches] = useState([]);
  const [matchSearch, setMatchSearch] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);

  // ✅ State for users
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    firstname: "",
    surname: "",
    email: "",
    isAdmin: false,
  });
  const [userSearch, setUserSearch] = useState("");

  // ✅ Load competitions, matches, users
  useEffect(() => {
    loadCompetitions();
    loadMatches();
    loadUsers();
  }, []);

  const loadCompetitions = async () => {
    try {
      const data = await apiFetch("/competitions");
      setCompetitions(data);
    } catch (err) {
      console.error("❌ Failed to load competitions", err);
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

  const handleAddUser = async () => {
    if (!newUser.firstname || !newUser.surname || !newUser.email) {
      alert("⚠️ Please fill in all required fields (firstname, surname, email).");
      return;
    }
  
    try {
      const data = await apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify(newUser),
      });
  
      if (!data || data.error) {
        alert(`❌ Failed to add user: ${data?.error || "Unknown error"}`);
        return;
      }
  
      alert(`✅ User "${data.firstname} ${data.surname}" added successfully!`);
  
      // Reset form
      setNewUser({ firstname: "", surname: "", email: "", isAdmin: false });
  
      // Refresh user list from backend to ensure consistency
      const refreshed = await apiFetch("/api/users");
      setUsers(refreshed);
    } catch (err) {
      console.error("❌ Failed to add user", err);
      alert("Error adding user — check console for details.");
    }
  };

  const handleUpdateCompetition = async (id, field, value) => {
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

  const handleUpdateUser = async (id, field, value) => {
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

  const forceLogout = async () => {
    try {
      await apiFetch("/admin/force-logout", { method: "POST" });
      alert("All users logged out");
    } catch (err) {
      console.error("❌ Failed to force logout", err);
    }
  };

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
                  <TableCell>
                    <TextField
                      value={c.name}
                      onChange={(e) =>
                        handleUpdateCompetition(c.id, "name", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={c.url}
                      onChange={(e) =>
                        handleUpdateCompetition(c.id, "url", e.target.value)
                      }
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="color"
                      value={c.color}
                      onChange={(e) =>
                        handleUpdateCompetition(c.id, "color", e.target.value)
                      }
                      sx={{ width: 50 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Save">
                      <IconButton onClick={() => saveCompetition(c)}>
                        <SaveIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => deleteCompetition(c.id)}>
                        <DeleteIcon />
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
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Matches</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              placeholder="Search matches..."
              value={matchSearch}
              onChange={(e) => setMatchSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1 }} />,
              }}
            />
            <Button
              variant="outlined"
              onClick={() => setShowCompleted(!showCompleted)}
            >
              {showCompleted ? "Hide Completed" : "Show Completed"}
            </Button>
            <Button variant="outlined" onClick={() => alert("Jump to today")}>
              Jump to Today
            </Button>
          </Box>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Competition</TableCell>
                <TableCell>Team A</TableCell>
                <TableCell>Team B</TableCell>
                <TableCell>Winner</TableCell>
                <TableCell>Margin</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {matches
                .filter((m) =>
                  `${m.teamA} ${m.teamB}`
                    .toLowerCase()
                    .includes(matchSearch.toLowerCase())
                )
                .map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{new Date(m.kickoff).toLocaleString()}</TableCell>
                    <TableCell>{m.competitionName}</TableCell>
                    <TableCell>{m.teamA}</TableCell>
                    <TableCell>{m.teamB}</TableCell>
                    <TableCell>
                        {m.result
                        ? `${m.result.winner || "-"} (${m.result.margin ?? "-"})`
                         : "-"}
                   </TableCell>
                    <TableCell>{m.margin || "-"}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </AccordionDetails>
      </Accordion>

      {/* === Users === */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Users</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="Firstname"
              value={newUser.firstname}
              onChange={(e) =>
                setNewUser({ ...newUser, firstname: e.target.value })
              }
            />
            <TextField
              label="Surname"
              value={newUser.surname}
              onChange={(e) =>
                setNewUser({ ...newUser, surname: e.target.value })
              }
            />
            <TextField
              label="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              sx={{ flex: 1 }}
            />
            <Checkbox
              checked={newUser.isAdmin}
              onChange={(e) =>
                setNewUser({ ...newUser, isAdmin: e.target.checked })
              }
            />
            <IconButton color="primary" onClick={handleAddUser}>
              <AddIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1 }} />,
              }}
            />
          </Box>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Firstname</TableCell>
                <TableCell>Surname</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users
                .filter(
                  (u) =>
                    u.firstname
                      .toLowerCase()
                      .includes(userSearch.toLowerCase()) ||
                    u.surname
                      .toLowerCase()
                      .includes(userSearch.toLowerCase()) ||
                    u.email.toLowerCase().includes(userSearch.toLowerCase())
                )
                .map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <TextField
                        value={u.firstname}
                        onChange={(e) =>
                          handleUpdateUser(u.id, "firstname", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={u.surname}
                        onChange={(e) =>
                          handleUpdateUser(u.id, "surname", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={u.email}
                        onChange={(e) =>
                          handleUpdateUser(u.id, "email", e.target.value)
                        }
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={u.isAdmin}
                        onChange={(e) =>
                          handleUpdateUser(u.id, "isAdmin", e.target.checked)
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Save">
                        <IconButton onClick={() => saveUser(u)}>
                          <SaveIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => deleteUser(u.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

export default AdminPage;