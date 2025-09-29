import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Stack,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import { DataGrid } from "@mui/x-data-grid";
import apiFetch from "../api/api"; // ✅ fixed import

function AdminPage() {
  const [matches, setMatches] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [newComp, setNewComp] = useState({
    name: "",
    url: "",
    color: "#1976d2",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [editMode, setEditMode] = useState(false);

  // 🔹 Standard competitions with names + URLs
  const standardCompetitions = [
    { name: "Top14", url: "webcal://ics.ecal.com/ecal-sub/68c1b84538582c00081bd07b/Ligue%20Nationale%20De%20Rugby.ics" },
    { name: "Premiership", url: "webcal://ics.ecal.com/ecal-sub/68b80d5c0fb910000876112c/Premiership%20Rugby%20.ics" },
    { name: "URC", url: "webcal://ics.ecal.com/ecal-sub/68b810331c6d630008c085ef/United%20Rugby%20Championship.ics" },
    { name: "Champions Cup", url: "webcal://ics.ecal.com/ecal-sub/68b810640fb9100008761171/EPCR.ics" },
    { name: "Challenge Cup", url: "webcal://ics.ecal.com/ecal-sub/68b8108f1c6d630008c085fc/EPCR.ics" },
    { name: "Autumn Internationals", url: "webcal://ics.ecal.com/ecal-sub/68d28502c4f7f8000894f5b2/Six%20Nations%20Rugby.ics" },
    { name: "Six Nations", url: "webcal://ics.ecal.com/ecal-sub/68d28557f028450008896c2a/Six%20Nations%20Rugby.ics" },
  ];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const comps = await apiFetch("/api/competitions");
      setCompetitions(comps);

      const matchList = await apiFetch("/api/matches");
      const withPreds = matchList.map((m) => ({ ...m, predictionsCount: 0 }));
      setMatches(withPreds);
    } catch (err) {
      console.error("❌ Failed to load data:", err);
    }
  }

  // 🔄 Recalculate results + leaderboard via server scrape
  async function handleRecalculate() {
    try {
      const result = await apiFetch("/api/admin/update-results", {
        method: "POST",
      });
      setSnackbar({
        open: true,
        message: `✅ ${result.updated} matches updated`,
        severity: "success",
      });
      loadData();
    } catch (err) {
      console.error("❌ Failed to recalc:", err);
      setSnackbar({
        open: true,
        message: "❌ Failed to update results",
        severity: "error",
      });
    }
  }

  // 🚨 Force logout all users
  async function handleForceLogout() {
    try {
      const res = await apiFetch("/api/admin/force-logout", {
        method: "POST",
      });
      setSnackbar({
        open: true,
        message: `🚨 All users logged out. New session version: ${res.sessionVersion}`,
        severity: "warning",
      });
    } catch (err) {
      console.error("❌ Force logout failed:", err);
      setSnackbar({
        open: true,
        message: "❌ Failed to force logout users",
        severity: "error",
      });
    }
  }

  async function handleAddCompetition() {
    try {
      let safeUrl = newComp.url.trim();
      if (safeUrl.startsWith("webcal://")) {
        safeUrl = safeUrl.replace("webcal://", "https://");
      }

      const result = await apiFetch("/api/competitions", {
        method: "POST",
        body: JSON.stringify({
          name: newComp.name,
          url: safeUrl,
          color: newComp.color,
        }),
      });

      if (result.success) {
        setNewComp({ name: "", url: "", color: "#1976d2" });
        loadData();
        setSnackbar({
          open: true,
          message: `✅ Competition "${newComp.name}" added`,
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "❌ Error adding competition",
          severity: "error",
        });
      }
    } catch (err) {
      console.error("❌ Error adding competition:", err);
    }
  }

  async function handleUpdateCompetition(c) {
    try {
      await apiFetch(`/api/competitions/${c.id}`, {
        method: "PUT",
        body: JSON.stringify(c),
      });
      loadData();
      setSnackbar({
        open: true,
        message: `✅ Competition "${c.name}" updated`,
        severity: "success",
      });
    } catch (err) {
      console.error("❌ Error updating competition:", err);
    }
  }

  async function handleRefreshCompetition(compId) {
    try {
      await apiFetch(`/api/competitions/${compId}/refresh`, { method: "POST" });
      loadData();
      setSnackbar({
        open: true,
        message: "🔄 Competition refreshed",
        severity: "info",
      });
    } catch (err) {
      console.error("❌ Error refreshing competition:", err);
    }
  }

  async function handleDeleteCompetition(compId) {
    if (!window.confirm("Delete this competition?")) return;
    try {
      await apiFetch(`/api/competitions/${compId}`, { method: "DELETE" });
      loadData();
      setSnackbar({
        open: true,
        message: "🗑️ Competition deleted",
        severity: "warning",
      });
    } catch (err) {
      console.error("❌ Error deleting competition:", err);
    }
  }

  // 🔹 Winner & Margin editing
  async function handleSetWinner(matchId, winner) {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;
    const updated = { ...match, result: { ...match.result, winner } };
    try {
      await apiFetch(`/api/matches/${matchId}`, {
        method: "PUT",
        body: JSON.stringify(updated),
      });
      setMatches((prev) => prev.map((m) => (m.id === matchId ? updated : m)));
    } catch (err) {
      console.error("❌ Error updating winner:", err);
    }
  }

  async function handleSetMargin(matchId, margin) {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;
    const updated = { ...match, result: { ...match.result, margin: parseInt(margin, 10) || null } };
    try {
      await apiFetch(`/api/matches/${matchId}`, {
        method: "PUT",
        body: JSON.stringify(updated),
      });
      setMatches((prev) => prev.map((m) => (m.id === matchId ? updated : m)));
    } catch (err) {
      console.error("❌ Error updating margin:", err);
    }
  }

  const columns = [
    {
      field: "competition",
      headerName: "Competition",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.row.competitionName}
          sx={{
            bgcolor: params.row.competitionColor || "#888",
            color: "white",
          }}
          size="small"
        />
      ),
    },
    {
      field: "teamA",
      headerName: "Team A",
      flex: 1,
      renderCell: (params) => {
        const isWinner = params.row.result?.winner === params.row.teamA;
        return (
          <Chip
            label={params.row.teamA}
            clickable={editMode}
            onClick={editMode ? () => handleSetWinner(params.row.id, params.row.teamA) : undefined}
            sx={{
              fontWeight: isWinner ? "bold" : "normal",
              bgcolor: isWinner ? "success.main" : undefined,
              color: isWinner ? "white" : "inherit",
            }}
          />
        );
      },
    },
    {
      field: "teamB",
      headerName: "Team B",
      flex: 1,
      renderCell: (params) => {
        const isWinner = params.row.result?.winner === params.row.teamB;
        return (
          <Chip
            label={params.row.teamB}
            clickable={editMode}
            onClick={editMode ? () => handleSetWinner(params.row.id, params.row.teamB) : undefined}
            sx={{
              fontWeight: isWinner ? "bold" : "normal",
              bgcolor: isWinner ? "success.main" : undefined,
              color: isWinner ? "white" : "inherit",
            }}
          />
        );
      },
    },
    {
      field: "kickoff",
      headerName: "Date/Time",
      flex: 1.2,
      valueFormatter: (params) => new Date(params.value).toLocaleString("en-GB"),
    },
    {
      field: "margin",
      headerName: "Margin",
      flex: 0.5,
      renderCell: (params) =>
        editMode ? (
          <TextField
            size="small"
            type="number"
            value={params.row.result?.margin || ""}
            onChange={(e) => handleSetMargin(params.row.id, e.target.value)}
            sx={{ width: 70 }}
          />
        ) : (
          params.row.result?.margin || "—"
        ),
    },
    { field: "predictionsCount", headerName: "Predictions Submitted", flex: 1 },
  ];

  async function handleRowUpdate(newRow) {
    try {
      return await apiFetch(`/api/matches/${newRow.id}`, {
        method: "PUT",
        body: JSON.stringify(newRow),
      });
    } catch (err) {
      console.error("❌ Error updating match:", err);
      return newRow;
    }
  }

  return (
    <Container sx={{ mt: 2 }}>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Tooltip title="Recalculate Results & Leaderboard">
          <IconButton color="secondary" onClick={handleRecalculate}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={editMode ? "Done Editing" : "Edit Results"}>
          <IconButton onClick={() => setEditMode((prev) => !prev)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Force Logout All Users">
          <IconButton color="error" onClick={handleForceLogout}>
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* 📌 Competitions Accordion */}
      <Accordion defaultExpanded={false} sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>📌 Competitions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            {competitions.map((c) => (
              <Paper
                key={c.id}
                sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}
              >
                <Chip
                  label={c.name}
                  sx={{
                    bgcolor: c.color || "#666",
                    color: "white",
                  }}
                  size="small"
                />
                <TextField
                  label="Name"
                  size="small"
                  value={c.name}
                  onChange={(e) =>
                    setCompetitions((prev) =>
                      prev.map((comp) =>
                        comp.id === c.id ? { ...comp, name: e.target.value } : comp
                      )
                    )
                  }
                />
                <TextField
                  label="Feed URL"
                  size="small"
                  value={c.url}
                  onChange={(e) =>
                    setCompetitions((prev) =>
                      prev.map((comp) =>
                        comp.id === c.id ? { ...comp, url: e.target.value } : comp
                      )
                    )
                  }
                  sx={{ flex: 1 }}
                />
                <TextField
                  type="color"
                  size="small"
                  value={c.color || "#1976d2"}
                  onChange={(e) =>
                    setCompetitions((prev) =>
                      prev.map((comp) =>
                        comp.id === c.id ? { ...comp, color: e.target.value } : comp
                      )
                    )
                  }
                  sx={{ width: 80 }}
                />
                <IconButton onClick={() => handleRefreshCompetition(c.id)}>
                  <RefreshIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleDeleteCompetition(c.id)}
                >
                  <DeleteIcon />
                </IconButton>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleUpdateCompetition(c)}
                >
                  Save
                </Button>
              </Paper>
            ))}

            {/* ➕ Add Competition */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">➕ Add Competition</Typography>
              <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
                {standardCompetitions.map((comp) => (
                  <Chip
                    key={comp.name}
                    label={comp.name}
                    onClick={() =>
                      setNewComp({
                        name: comp.name,
                        url: comp.url,
                        color: "#1976d2",
                      })
                    }
                    sx={{ bgcolor: "#1976d2", color: "white" }}
                  />
                ))}
              </Stack>
              <Stack direction="row" spacing={2} mt={1}>
                <TextField
                  label="Name"
                  size="small"
                  value={newComp.name}
                  onChange={(e) =>
                    setNewComp((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <TextField
                  label="ICS Feed URL"
                  size="small"
                  value={newComp.url}
                  onChange={(e) =>
                    setNewComp((prev) => ({ ...prev, url: e.target.value }))
                  }
                  sx={{ flex: 1 }}
                />
                <TextField
                  type="color"
                  size="small"
                  value={newComp.color}
                  onChange={(e) =>
                    setNewComp((prev) => ({ ...prev, color: e.target.value }))
                  }
                  sx={{ width: 80 }}
                />
                <Button variant="contained" onClick={handleAddCompetition}>
                  Add
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* 📋 Matches Table */}
      <Paper sx={{ height: 600 }}>
        <DataGrid
          rows={matches}
          columns={columns}
          getRowId={(row) => row.id}
          processRowUpdate={handleRowUpdate}
          disableRowSelectionOnClick
          experimentalFeatures={{ newEditingApi: true }}
          pageSizeOptions={[10, 25, 50]}
        />
      </Paper>

      {/* ✅ Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default AdminPage;