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
  Chip,
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
  useEffect(() => {
    document.title = "Admin Panel";
  }, []);
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
  const [newMatch, setNewMatch] = useState({
    competitionId: "",
    teamA: "",
    teamB: "",
    kickoff: "",
  });
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
      const data = await apiFetch("/users", {
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
      const refreshed = await apiFetch("/users");
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

// --- MATCH MANAGEMENT ---

const handleAddMatch = async () => {
  if (!newMatch.teamA || !newMatch.teamB || !newMatch.kickoff || !newMatch.competitionId) {
    alert("Please complete all fields before adding a match");
    return;
  }

  try {
    const data = await apiFetch("/matches", {
      method: "POST",
      body: JSON.stringify(newMatch),
    });
    setMatches([...matches, data]);
    setNewMatch({ teamA: "", teamB: "", kickoff: "", competitionId: "" });
  } catch (err) {
    console.error("❌ Failed to add match", err);
  }
};

const handleUpdateMatch = (id, field, value) => {
  setMatches((prev) =>
    prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
  );
};

const saveMatch = async (match) => {
  try {
    await apiFetch(`/matches/${match.id}`, {
      method: "PUT",
      body: JSON.stringify(match),
    });
  } catch (err) {
    console.error("❌ Failed to save match", err);
  }
};

const deleteMatch = async (id) => {
  try {
    await apiFetch(`/matches/${id}`, { method: "DELETE" });
    setMatches(matches.filter((m) => m.id !== id));
  } catch (err) {
    console.error("❌ Failed to delete match", err);
  }
};

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin
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
<Accordion>
  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
    <Typography>Matches</Typography>
  </AccordionSummary>
  <AccordionDetails>
    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
      <TextField
        label="Search matches..."
        value={matchSearch}
        onChange={(e) => setMatchSearch(e.target.value)}
        InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
      />
      <Button
        variant="outlined"
        onClick={() => setShowCompleted(!showCompleted)}
      >
        {showCompleted ? "Hide Completed" : "Show Completed"}
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddMatch}
        startIcon={<AddIcon />}
      >
        Add Match
      </Button>
    </Box>

    <Table size="small">
    <TableHead>
  <TableRow>
    <TableCell
      onClick={() => setSortConfig({ key: "kickoff", dir: sortConfig.dir === "asc" ? "desc" : "asc" })}
      sx={{ cursor: "pointer" }}
    >
      Date {sortConfig.key === "kickoff" ? (sortConfig.dir === "asc" ? "↑" : "↓") : ""}
    </TableCell>
    <TableCell
      onClick={() => setSortConfig({ key: "competitionName", dir: sortConfig.dir === "asc" ? "desc" : "asc" })}
      sx={{ cursor: "pointer" }}
    >
      Competition {sortConfig.key === "competitionName" ? (sortConfig.dir === "asc" ? "↑" : "↓") : ""}
    </TableCell>
    <TableCell
      onClick={() => setSortConfig({ key: "teamA", dir: sortConfig.dir === "asc" ? "desc" : "asc" })}
      sx={{ cursor: "pointer" }}
    >
      Team A {sortConfig.key === "teamA" ? (sortConfig.dir === "asc" ? "↑" : "↓") : ""}
    </TableCell>
    <TableCell
      onClick={() => setSortConfig({ key: "teamB", dir: sortConfig.dir === "asc" ? "desc" : "asc" })}
      sx={{ cursor: "pointer" }}
    >
      Team B {sortConfig.key === "teamB" ? (sortConfig.dir === "asc" ? "↑" : "↓") : ""}
    </TableCell>
    <TableCell>Winner</TableCell>
    <TableCell>Margin</TableCell>
    <TableCell align="right">Actions</TableCell>
  </TableRow>
</TableHead>
      <TableBody>
        {matches
          .filter((m) => {
            const q = matchSearch.toLowerCase();
            return (
              m.teamA.toLowerCase().includes(q) ||
              m.teamB.toLowerCase().includes(q) ||
              (m.competitionName || "").toLowerCase().includes(q)
            );
          })
          .sort((a, b) => {
            const dir = sortConfig.dir === "asc" ? 1 : -1;
            if (sortConfig.key === "kickoff") {
              return (new Date(a.kickoff) - new Date(b.kickoff)) * dir;
            }
            if (a[sortConfig.key] < b[sortConfig.key]) return -1 * dir;
            if (a[sortConfig.key] > b[sortConfig.key]) return 1 * dir;
            return 0;
          })
                    .map((m) => (
            <TableRow key={m.id}>
              <TableCell>
                <TextField
                  type="datetime-local"
                  value={new Date(m.kickoff).toISOString().slice(0, 16)}
                  onChange={(e) =>
                    handleUpdateMatch(m.id, "kickoff", e.target.value)
                  }
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={m.competitionName}
                  sx={{
                    backgroundColor: m.competitionColor || "#999",
                    color: "#fff",
                  }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={m.teamA}
                  onChange={(e) =>
                    handleUpdateMatch(m.id, "teamA", e.target.value)
                  }
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={m.teamB}
                  onChange={(e) =>
                    handleUpdateMatch(m.id, "teamB", e.target.value)
                  }
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={m.result?.winner || ""}
                  onChange={(e) =>
                    handleUpdateMatch(m.id, "result", {
                      ...m.result,
                      winner: e.target.value,
                    })
                  }
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={m.result?.margin || ""}
                  onChange={(e) =>
                    handleUpdateMatch(m.id, "result", {
                      ...m.result,
                      margin: e.target.value,
                    })
                  }
                />
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Save">
                  <IconButton onClick={() => saveMatch(m)}>
                    <SaveIcon color="success" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton onClick={() => deleteMatch(m.id)}>
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