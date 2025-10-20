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
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DangerousIcon from "@mui/icons-material/Dangerous";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";

import { apiFetch } from "../api/api";
import { UserContext } from "../context/UserContext";
import { useMemo } from "react"; // ensure this is in your imports

function AdminPage() {
  useEffect(() => {
    document.title = "Admin Panel";
  }, []);

  const { user } = useContext(UserContext);
  const isSuperAdmin = user?.email === "eoinvoconnor@gmail.com";

  // Competitions state
  const [competitions, setCompetitions] = useState([]);
  const [newCompetition, setNewCompetition] = useState({
    name: "",
    url: "",
    color: "#1976d2",
  });
  const [showArchivedComps, setShowArchivedComps] = useState(false);

  // Matches state
  const [matches, setMatches] = useState([]);
  const [newMatch, setNewMatch] = useState({
    competitionId: "",
    teamA: "",
    teamB: "",
    kickoff: "",
  });
  const [matchSearch, setMatchSearch] = useState("");
  // 0 = All, 1 = Upcoming only, 2 = Completed only
  const [matchViewMode, setMatchViewMode] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: "kickoff", dir: "asc" });

  // Users state
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    firstname: "",
    surname: "",
    email: "",
    isAdmin: false,
  });
  const [userSearch, setUserSearch] = useState("");

  // ✅ State for predictions (admin view)
  const [predictions, setPredictions] = useState([]);
  const [predSearch, setPredSearch] = useState("");
  const [predSort, setPredSort] = useState({ key: "kickoff", dir: "asc" }); // kickoff|competition|winner|user


  // Load data on mount
  useEffect(() => {
    loadCompetitions();
    loadMatches();
    loadUsers();
    loadPredictions();
  }, []);

  const loadCompetitions = async () => {
    try {
      const data = await apiFetch("/competitions?includeArchived=1");
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

  const loadPredictions = async () => {
    try {
      // all users' predictions for Admin
      const data = await apiFetch("/predictions?all=1"); // or ?all=1&expand=1 if you wired expand
      setPredictions(data);
    } catch (err) {
      console.error("❌ Failed to load predictions", err);
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

  // Competitions handlers
  const handleAddCompetition = async () => {
    if (!newCompetition.name || !newCompetition.url) return;
    try {
      const data = await apiFetch("/competitions", {
        method: "POST",
        body: JSON.stringify(newCompetition),
      });
      setCompetitions((prev) => [...prev, data]);
      setNewCompetition({ name: "", url: "", color: "#1976d2" });
    } catch (err) {
      console.error("❌ Failed to add competition", err);
    }
  };

  const handleUpdateCompetition = (id, field, value) => {
    setCompetitions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
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
      setCompetitions((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("❌ Failed to delete competition", err);
    }
  };

  const handleRefreshCompetition = async (comp) => {
    try {
      const resp = await apiFetch(`/competitions/${comp.id}/refresh`, {
        method: "POST",
      });
      const added = typeof resp?.added === "number" ? resp.added : 0;
      alert(`✅ Refreshed "${comp.name}" — added ${added} matches`);
      await loadMatches();
      await loadCompetitions();
    } catch (err) {
      console.error("❌ Failed to refresh competition", err);
      alert(`❌ Refresh failed for "${comp.name}"`);
    }
  };
// for predictions 
// Fast lookups
const compById = new Map(competitions.map(c => [c.id, c]));
const matchById = new Map(matches.map(m => [m.id, m]));
const userById  = new Map(users.map(u => [u.id, u]));

const isPredictionLocked = (p) => {
  const m = matchById.get(p.matchId);
  if (!m) return false;
  const hasStarted = new Date(m.kickoff) <= new Date();
  // If backend also stores p.locked, respect either condition
  return hasStarted || p.locked === true;
};



  // SuperAdmin only
  const handleHideCompetition = async (comp) => {
    try {
      await apiFetch(`/competitions/${comp.id}/hide`, { method: "POST" });
      setCompetitions((prev) =>
        prev.map((c) => (c.id === comp.id ? { ...c, hidden: true } : c))
      );
    } catch (err) {
      console.error("❌ Failed to hide competition", err);
    }
  };

  const handleRestoreCompetition = async (comp) => {
    try {
      await apiFetch(`/competitions/${comp.id}/restore`, { method: "POST" });
      setCompetitions((prev) =>
        prev.map((c) => (c.id === comp.id ? { ...c, hidden: false } : c))
      );
    } catch (err) {
      console.error("❌ Failed to restore competition", err);
    }
  };

  const handlePurgeCompetition = async (comp) => {
    const ok = window.confirm(
      `⚠️ HARD DELETE "${comp.name}"?\nThis removes the competition, all matches and predictions.`
    );
    if (!ok) return;
    try {
      await apiFetch(`/superadmin/competitions/${comp.id}`, { method: "DELETE" });
      setCompetitions((prev) => prev.filter((c) => c.id !== comp.id));
      await loadMatches();
      alert("✅ Competition purged.");
    } catch (err) {
      console.error("❌ Failed to purge competition", err);
    }
  };

  // Users handlers
  const handleAddUser = async () => {
    if (!newUser.firstname || !newUser.surname || !newUser.email) {
      alert("⚠️ Please fill in firstname, surname and email.");
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
      setNewUser({ firstname: "", surname: "", email: "", isAdmin: false });
      const refreshed = await apiFetch("/users");
      setUsers(refreshed);
      alert(`✅ User "${data.firstname} ${data.surname}" added`);
    } catch (err) {
      console.error("❌ Failed to add user", err);
    }
  };

  const handleUpdateUser = (id, field, value) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, [field]: value } : u)));
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
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("❌ Failed to delete user", err);
    }
  };

  // Force logout (moved into Users accordion header)
  const forceLogout = async () => {
    try {
      await apiFetch("/admin/force-logout", { method: "POST" });
      alert("✅ All users logged out");
    } catch (err) {
      console.error("❌ Failed to force logout", err);
    }
  };

  // Match editing
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
      setMatches((prev) => [...prev, data]);
      setNewMatch({ teamA: "", teamB: "", kickoff: "", competitionId: "" });
    } catch (err) {
      console.error("❌ Failed to add match", err);
    }
  };

  const handleUpdateMatch = (id, field, value) => {
    setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

// 🔄 Manually run results scraper (Admin)
const handleUpdateResults = async () => {
  try {
    const res = await apiFetch("/admin/update-results", { method: "POST" });
    const updated = typeof res?.updated === "number" ? res.updated : 0;
    alert(`✅ Results updated. ${updated} matches adjusted.`);
    await loadMatches(); // so the Matches table reflects any new results
  } catch (err) {
    console.error("❌ Update results failed", err);
    alert("❌ Update results failed — check logs.");
  }
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
      setMatches((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("❌ Failed to delete match", err);
    }
  };

// my prediction CRUD handlers
const handleUpdatePrediction = (id, field, value) => {
  setPredictions(prev =>
    prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
  );
};

const savePrediction = async (p) => {
  try {
    await apiFetch(`/admin/predictions/${p.id}`, {
      method: "PUT",
      body: JSON.stringify(p),
    });
    // Optionally refresh from server:
    // await loadPredictions();
  } catch (err) {
    console.error("❌ Failed to save prediction", err);
    alert("❌ Save failed");
  }
};

const deletePrediction = async (id) => {
  try {
    await apiFetch(`/admin/predictions/${id}`, { method: "DELETE" });
    setPredictions(prev => prev.filter(p => p.id !== id));
  } catch (err) {
    console.error("❌ Failed to delete prediction", err);
    alert("❌ Delete failed");
  }
};

// Bulk unlock of future predictions
const handleUnlockPredictions = async () => {
  try {
    const resp = await apiFetch("/admin/predictions/unlock", { method: "POST" });
    alert(resp?.message || "✅ Unlocked predictions (future matches)");
    await loadPredictions();
  } catch (err) {
    console.error("❌ Failed to unlock predictions", err);
    alert("❌ Unlock failed");
  }
};

// Recalculate leaderboard
const recalcLeaderboard = async () => {
  try {
    const resp = await apiFetch("/admin/recalc-leaderboard", { method: "POST" });
    alert(resp?.message || "✅ Leaderboard recalculated");
  } catch (err) {
    console.error("❌ Failed to recalc leaderboard", err);
    alert("❌ Recalculate failed");
  }
};
// my predictions sort & filter
const filteredSortedPreds = useMemo(() => {
  const q = predSearch.trim().toLowerCase();

  const base = predictions.map(p => {
    const m = matchById.get(p.matchId);
    const u = userById.get(p.userId);
    const c = m ? compById.get(m.competitionId) : null;
    return { p, m, u, c };
  });

  const filtered = q
    ? base.filter(({ p, m, u, c }) => {
        const hay = [
          p.predictedWinner || p.winner || "",
          String(p.margin ?? ""),
          m?.teamA || "",
          m?.teamB || "",
          m?.competitionName || "",
          c?.name || "",
          u?.email || "",
          `${u?.firstname || ""} ${u?.surname || ""}`,
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
    : base;

  const dir = predSort.dir === "asc" ? 1 : -1;

  const sorted = [...filtered].sort((A, B) => {
    const { p: pA, m: mA, u: uA, c: cA } = A;
    const { p: pB, m: mB, u: uB, c: cB } = B;
    switch (predSort.key) {
      case "kickoff":
        return ((new Date(mA?.kickoff || 0)) - (new Date(mB?.kickoff || 0))) * dir;
      case "competition":
        return ((cA?.name || mA?.competitionName || "").localeCompare(cB?.name || mB?.competitionName || "")) * dir;
      case "user":
        return ((uA?.email || "").localeCompare(uB?.email || "")) * dir;
      case "winner":
        return ((pA.predictedWinner || pA.winner || "").localeCompare(pB.predictedWinner || pB.winner || "")) * dir;
      case "margin":
        return (((pA.margin ?? 0) - (pB.margin ?? 0)) * dir);
      case "locked": {
        const aLocked = isPredictionLocked(pA) ? 1 : 0;
        const bLocked = isPredictionLocked(pB) ? 1 : 0;
        return (aLocked - bLocked) * dir;
      }
      default:
        return 0;
    }
  });

  return sorted;
}, [predictions, predSearch, predSort, matchById, userById, compById]);


// ✅ The return must open a single JSX root
return (
  <Box sx={{ p: 3 }}>
    {/* === Admin toolbar === */}
    <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>   
      {/* Update match results (manual scrape) */}
      <Button variant="outlined" color="secondary" onClick={handleUpdateResults}>
        Update match results
      </Button>
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

          <Button
            variant="outlined"
            onClick={() => setShowArchivedComps((s) => !s)}
            sx={{ ml: 1, mb: 2 }}
          >
            {showArchivedComps ? "Hide archived" : "Show archived"}
          </Button>

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
                <TableRow key={c.id} sx={{ display: !showArchivedComps && c.hidden ? "none" : "table-row" }}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TextField
                        value={c.name}
                        onChange={(e) =>
                          handleUpdateCompetition(c.id, "name", e.target.value)
                        }
                      />
                      {c.hidden && (
                        <Chip size="small" label="Hidden" sx={{ bgcolor: "#999", color: "#fff" }} />
                      )}
                    </Box>
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
                      <IconButton onClick={() => handleRefreshCompetition(c)}>
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

                    {isSuperAdmin &&
                      (c.hidden ? (
                        <Tooltip title="Restore (unhide)">
                          <IconButton onClick={() => handleRestoreCompetition(c)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Hide competition (soft)">
                          <IconButton onClick={() => handleHideCompetition(c)}>
                            <VisibilityOffIcon />
                          </IconButton>
                        </Tooltip>
                      ))}

                    {isSuperAdmin && (
                      <Tooltip title="Hard purge (competition + matches + predictions)">
                        <IconButton onClick={() => handlePurgeCompetition(c)}>
                          <DangerousIcon sx={{ color: "#b71c1c" }} />
                        </IconButton>
                      </Tooltip>
                    )}
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
              color={
                matchViewMode === 1
                  ? "success"
                  : matchViewMode === 2
                  ? "secondary"
                  : "primary"
              }
              onClick={() => setMatchViewMode((matchViewMode + 1) % 3)}
            >
              {matchViewMode === 0 && "Showing: All Matches"}
              {matchViewMode === 1 && "Showing: Upcoming Only"}
              {matchViewMode === 2 && "Showing: Completed Only"}
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
                  onClick={() =>
                    setSortConfig({
                      key: "kickoff",
                      dir: sortConfig.dir === "asc" ? "desc" : "asc",
                    })
                  }
                  sx={{ cursor: "pointer" }}
                >
                  Date{" "}
                  {sortConfig.key === "kickoff"
                    ? sortConfig.dir === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </TableCell>
                <TableCell
                  onClick={() =>
                    setSortConfig({
                      key: "competitionName",
                      dir: sortConfig.dir === "asc" ? "desc" : "asc",
                    })
                  }
                  sx={{ cursor: "pointer" }}
                >
                  Competition{" "}
                  {sortConfig.key === "competitionName"
                    ? sortConfig.dir === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </TableCell>
                <TableCell
                  onClick={() =>
                    setSortConfig({
                      key: "teamA",
                      dir: sortConfig.dir === "asc" ? "desc" : "asc",
                    })
                  }
                  sx={{ cursor: "pointer" }}
                >
                  Team A{" "}
                  {sortConfig.key === "teamA"
                    ? sortConfig.dir === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </TableCell>
                <TableCell
                  onClick={() =>
                    setSortConfig({
                      key: "teamB",
                      dir: sortConfig.dir === "asc" ? "desc" : "asc",
                    })
                  }
                  sx={{ cursor: "pointer" }}
                >
                  Team B{" "}
                  {sortConfig.key === "teamB"
                    ? sortConfig.dir === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
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
                  const matchesSearch =
                    m.teamA.toLowerCase().includes(q) ||
                    m.teamB.toLowerCase().includes(q) ||
                    (m.competitionName || "").toLowerCase().includes(q);

                  const now = new Date();
                  const isPast = new Date(m.kickoff) < now;

                  if (matchViewMode === 1) return matchesSearch && !isPast; // upcoming
                  if (matchViewMode === 2) return matchesSearch && isPast; // completed
                  return matchesSearch; // all
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

      {/* === Predictions === */}
<Accordion>
  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
      <Typography sx={{ flex: 1 }}>Predictions</Typography>

      {/* Header actions on the right */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={recalcLeaderboard}
        >
          Recalculate leaderboard
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="secondary"
          onClick={handleUnlockPredictions}
          startIcon={<LockOpenIcon />}
        >
          Unlock predictions
        </Button>
      </Box>
    </Box>
  </AccordionSummary>

  <AccordionDetails>
    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
      <TextField
        placeholder="Search predictions (winner, user, competition, team)..."
        value={predSearch}
        onChange={(e) => setPredSearch(e.target.value)}
        InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
        fullWidth
      />
    </Box>

    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell
            sx={{ cursor: "pointer" }}
            onClick={() =>
              setPredSort({
                key: "kickoff",
                dir: predSort.key === "kickoff" && predSort.dir === "asc" ? "desc" : "asc",
              })
            }
          >
            Date {predSort.key === "kickoff" ? (predSort.dir === "asc" ? "↑" : "↓") : ""}
          </TableCell>
          <TableCell
            sx={{ cursor: "pointer" }}
            onClick={() =>
              setPredSort({
                key: "competition",
                dir: predSort.key === "competition" && predSort.dir === "asc" ? "desc" : "asc",
              })
            }
          >
            Competition {predSort.key === "competition" ? (predSort.dir === "asc" ? "↑" : "↓") : ""}
          </TableCell>
          <TableCell>Match</TableCell>
          <TableCell
            sx={{ cursor: "pointer" }}
            onClick={() =>
              setPredSort({
                key: "winner",
                dir: predSort.key === "winner" && predSort.dir === "asc" ? "desc" : "asc",
              })
            }
          >
            Predicted winner {predSort.key === "winner" ? (predSort.dir === "asc" ? "↑" : "↓") : ""}
          </TableCell>
          <TableCell>Margin</TableCell>
          <TableCell>Status</TableCell>
          <TableCell
            sx={{ cursor: "pointer" }}
            onClick={() =>
              setPredSort({
                key: "user",
                dir: predSort.key === "user" && predSort.dir === "asc" ? "desc" : "asc",
              })
            }
            align="left"
          >
            User {predSort.key === "user" ? (predSort.dir === "asc" ? "↑" : "↓") : ""}
          </TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {filteredSortedPreds.map((p) => {
          const m = matchById.get(p.matchId);
          const u = userById.get(p.userId);
          const c = m ? compById.get(m.competitionId) : null;
          const locked = isPredictionLocked(p);

          return (
            <TableRow key={p.id} sx={{ opacity: locked ? 0.65 : 1 }}>
              <TableCell>
                {m?.kickoff ? new Date(m.kickoff).toLocaleString() : "-"}
              </TableCell>

              <TableCell>
                <Chip
                  size="small"
                  label={c?.name || "Unknown"}
                  sx={{
                    backgroundColor: c?.color || "#777",
                    color: "#fff",
                    fontWeight: 600,
                  }}
                />
              </TableCell>

              <TableCell>
                {m ? `${m.teamA} vs ${m.teamB}` : "(match missing)"}
              </TableCell>

              <TableCell>
                <TextField
                  value={p.predictedWinner || ""}
                  onChange={(e) =>
                    handleUpdatePrediction(p.id, "predictedWinner", e.target.value)
                  }
                  size="small"
                  disabled={locked}
                />
              </TableCell>

              <TableCell sx={{ width: 110 }}>
                <TextField
                  type="number"
                  inputProps={{ min: 1, max: 999 }}
                  value={p.margin ?? ""}
                  onChange={(e) => {
                    let v = parseInt(e.target.value || "", 10);
                    if (isNaN(v)) v = "";
                    if (typeof v === "number") v = Math.min(999, Math.max(1, v));
                    handleUpdatePrediction(p.id, "margin", v);
                  }}
                  size="small"
                  disabled={locked}
                />
              </TableCell>

              <TableCell>
                {locked ? (
                  <Chip
                    size="small"
                    icon={<LockIcon sx={{ color: "#fff !important" }} />}
                    label="Locked"
                    sx={{ bgcolor: "#999", color: "#fff", fontWeight: 600 }}
                  />
                ) : (
                  <Chip
                    size="small"
                    icon={<LockOpenIcon sx={{ color: "#fff !important" }} />}
                    label="Open"
                    sx={{ bgcolor: "#4caf50", color: "#fff", fontWeight: 600 }}
                  />
                )}
              </TableCell>

              <TableCell align="left">{u?.email || "-"}</TableCell>

              <TableCell align="right">
                <Tooltip title="Save">
                  <IconButton onClick={() => savePrediction(p)}>
                    <SaveIcon color="success" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton onClick={() => deletePrediction(p.id)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </AccordionDetails>
</Accordion>


      {/* === Users === */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Users</Typography>
          {/* Right-aligned force logout button */}
          <Box sx={{ ml: "auto" }}>
            <Button
              variant="outlined"
              color="error"
              onClick={forceLogout}
              startIcon={<ExitToAppIcon />}
              size="small"
            >
              Force logout all users
            </Button>
          </Box>
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
                    u.firstname.toLowerCase().includes(userSearch.toLowerCase()) ||
                    u.surname.toLowerCase().includes(userSearch.toLowerCase()) ||
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
                          <SaveIcon color="success" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => deleteUser(u.id)}>
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
    </Box>
  );
}


export default AdminPage;