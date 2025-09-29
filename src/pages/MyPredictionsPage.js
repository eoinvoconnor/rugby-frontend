// src/pages/MyPredictionsPage.js
import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  Typography,
  Paper,
  Chip,
  Snackbar,
  Alert,
  Stack,
  Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { apiFetch } from "../api/api";
import { useUser } from "../context/UserContext";

function MyPredictionsPage() {
  const { user } = useUser();
  const [predictions, setPredictions] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [expired, setExpired] = useState(false);
  const [competitionFilter, setCompetitionFilter] = useState("ALL");

  const gridRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    apiFetch(`/api/predictions?userId=${user.id}`)
      .then((data) => {
        // Sort predictions by date ascending
        const sorted = [...data].sort(
          (a, b) => new Date(a.kickoff) - new Date(b.kickoff)
        );
        setPredictions(sorted);
      })
      .catch((err) => {
        console.error("❌ Failed to load predictions:", err);
        if (err.message.includes("session")) {
          setExpired(true);
        }
      });
  }, [user]);

  // Unique competitions
  const competitions = [
    ...new Map(
      predictions.map((p) => [
        p.competitionId,
        { id: p.competitionId, name: p.competitionName, color: p.competitionColor },
      ])
    ).values(),
  ];

  // Apply filter
  const filteredPredictions =
    competitionFilter === "ALL"
      ? predictions
      : predictions.filter((p) => p.competitionName === competitionFilter);

  // Jump to first upcoming prediction
  const handleJumpToNow = () => {
    const now = new Date();
    const idx = filteredPredictions.findIndex(
      (p) => new Date(p.kickoff) > now
    );
    if (idx !== -1 && gridRef.current) {
      gridRef.current.scrollToIndexes({ rowIndex: idx });
    }
  };

  const columns = [
    {
      field: "kickoff",
      headerName: "Date",
      flex: 1,
      valueFormatter: (params) =>
        params.value ? new Date(params.value).toLocaleString("en-GB") : "—",
    },
    { field: "teamA", headerName: "Team A", flex: 1 },
    { field: "teamB", headerName: "Team B", flex: 1 },
    { field: "winner", headerName: "Your Pick", flex: 1 },
    {
      field: "margin",
      headerName: "Margin",
      flex: 0.5,
      renderCell: (params) =>
        params.row.margin !== null ? (
          <Typography>{params.row.margin}</Typography>
        ) : (
          "—"
        ),
    },
    {
      field: "points",
      headerName: "Points",
      flex: 0.5,
      renderCell: (params) =>
        params.row.points !== null ? (
          <Typography sx={{ fontWeight: "bold" }}>{params.row.points}</Typography>
        ) : (
          "—"
        ),
    },
  ];

  if (expired) {
    return (
      <Container sx={{ mt: 2 }}>
        <Typography color="error">
          🚨 Your session has expired. Please log in again.
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 2 }}>
      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5">My Predictions</Typography>
        <Button variant="outlined" size="small" onClick={handleJumpToNow}>
          Jump to Now
        </Button>
      </Stack>

      {/* Competition filter chips */}
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
        <Chip
          label="ALL"
          onClick={() => setCompetitionFilter("ALL")}
          sx={{
            bgcolor: competitionFilter === "ALL" ? "primary.main" : "grey.400",
            color: "white",
          }}
        />
        {competitions.map((c) => (
          <Chip
            key={c.id}
            label={c.name}
            onClick={() => setCompetitionFilter(c.name)}
            sx={{
              bgcolor:
                competitionFilter === c.name ? "grey.400" : c.color || "#888",
              color: "white",
            }}
          />
        ))}
      </Stack>

      {/* Predictions table */}
      <Paper sx={{ height: 600 }}>
        <DataGrid
          rows={filteredPredictions}
          columns={columns}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          getRowClassName={(params) => `competition-${params.row.competitionId}`}
          sx={{
            "& .MuiDataGrid-row": {
              borderLeft: "6px solid transparent",
            },
            "& .MuiDataGrid-row:hover": {
              filter: "brightness(0.95)",
            },
            // 🔹 Dynamic competition colors on row border
            ...(competitions.reduce((acc, comp) => {
              acc[`.competition-${comp.id}`] = {
                borderLeft: `6px solid ${comp.color || "#888"}`,
              };
              return acc;
            }, {})),
          }}
          slots={{}}
          apiRef={gridRef}
        />
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default MyPredictionsPage;