// src/pages/AdminPredictions.js
import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  Box, Typography, Accordion, AccordionSummary, AccordionDetails,
  Table, TableHead, TableRow, TableCell, TableBody,
  TextField, IconButton, Tooltip, Chip, Button
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import SearchIcon from "@mui/icons-material/Search";
import { apiFetch } from "../api/api";
import { UserContext } from "../context/UserContext";

const pillStyle = (bg = "#607d8b") => ({
  bgcolor: bg,
  color: "#fff",
  fontWeight: 600,
  px: 1.25,
});

function AdminPredictions() {
  const { user } = useContext(UserContext);
  const [predictions, setPredictions] = useState([]);
  const [predSearch, setPredSearch] = useState("");
  const [predSort, setPredSort] = useState({ key: "kickoff", dir: "asc" });

  const [competitions, setCompetitions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);

  const compById = new Map(competitions.map(c => [c.id, c]));
  const matchById = new Map(matches.map(m => [m.id, m]));
  const userById = new Map(users.map(u => [u.id, u]));

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const [comps, matches, users, preds] = await Promise.all([
      apiFetch("/competitions?includeArchived=1"),
      apiFetch("/matches"),
      apiFetch("/users"),
      apiFetch("/predictions?all=1&expand=1"),
    ]);
    setCompetitions(comps);
    setMatches(matches);
    setUsers(users);
    setPredictions(preds);
  };

  const isPredictionLocked = (p) => {
    const m = matchById.get(p.matchId);
    if (!m) return false;
    return new Date(m.kickoff) <= new Date() || p.locked === true;
  };

  const handleUpdatePrediction = (id, field, value) => {
    setPredictions(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const savePrediction = async (p) => {
    try {
      await apiFetch(`/admin/predictions/${p.id}`, {
        method: "PUT",
        body: JSON.stringify(p),
      });
    } catch (err) {
      console.error("❌ Failed to save prediction", err);
    }
  };

  const deletePrediction = async (id) => {
    try {
      await apiFetch(`/admin/predictions/${id}`, { method: "DELETE" });
      setPredictions(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("❌ Failed to delete prediction", err);
    }
  };

  const handleUnlockPredictions = async () => {
    try {
      const resp = await apiFetch("/admin/predictions/unlock", { method: "POST" });
      alert(resp?.message || "✅ Unlocked predictions");
      await loadAll();
    } catch (err) {
      alert("❌ Unlock failed");
    }
  };

  const recalcLeaderboard = async () => {
    try {
      const resp = await apiFetch("/admin/recalc-leaderboard", { method: "POST" });
      alert(resp?.message || "✅ Leaderboard recalculated");
    } catch (err) {
      alert("❌ Leaderboard recalc failed");
    }
  };

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
            c?.name || "",
            u?.email || "",
          ].join(" ").toLowerCase();
          return hay.includes(q);
        })
      : base;

    const dir = predSort.dir === "asc" ? 1 : -1;

    return [...filtered].sort((A, B) => {
      const { m: mA } = A;
      const { m: mB } = B;
      return ((new Date(mA?.kickoff || 0)) - (new Date(mB?.kickoff || 0))) * dir;
    });
  }, [predictions, predSearch, predSort, matchById, userById, compById]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Admin Predictions</Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Button onClick={recalcLeaderboard} variant="contained">Recalc Leaderboard</Button>
        <Button onClick={handleUnlockPredictions} variant="outlined">Unlock Predictions</Button>
      </Box>

      <TextField
        fullWidth
        placeholder="Search predictions..."
        value={predSearch}
        onChange={(e) => setPredSearch(e.target.value)}
        InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
      />

      <Table size="small" sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>Kickoff</TableCell>
            <TableCell>Competition</TableCell>
            <TableCell>Match</TableCell>
            <TableCell>Winner</TableCell>
            <TableCell>Margin</TableCell>
            <TableCell>Locked?</TableCell>
            <TableCell>User</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredSortedPreds.map(({ p, m, u, c }) => (
            <TableRow key={p.id}>
              <TableCell>{m?.kickoff ? new Date(m.kickoff).toLocaleString() : "-"}</TableCell>
              <TableCell>
                <Chip size="small" label={c?.name || "?"} sx={{ bgcolor: c?.color || "#888", color: "#fff" }} />
              </TableCell>
              <TableCell>{m ? `${m.teamA} vs ${m.teamB}` : "-"}</TableCell>
              <TableCell>
                <TextField
                  size="small"
                  value={p.predictedWinner || ""}
                  onChange={(e) => handleUpdatePrediction(p.id, "predictedWinner", e.target.value)}
                  disabled={isPredictionLocked(p)}
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  type="number"
                  value={p.margin ?? ""}
                  onChange={(e) => {
                    let v = parseInt(e.target.value || "", 10);
                    v = isNaN(v) ? "" : Math.min(999, Math.max(1, v));
                    handleUpdatePrediction(p.id, "margin", v);
                  }}
                  disabled={isPredictionLocked(p)}
                />
              </TableCell>
              <TableCell>
                {isPredictionLocked(p) ? <LockIcon /> : <LockOpenIcon />}
              </TableCell>
              <TableCell>{u?.email || "-"}</TableCell>
              <TableCell>
                <Tooltip title="Save">
                  <IconButton onClick={() => savePrediction(p)}><SaveIcon /></IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton onClick={() => deletePrediction(p.id)}><DeleteIcon /></IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export default AdminPredictions;