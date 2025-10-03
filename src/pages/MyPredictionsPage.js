// src/pages/MyPredictionsPage.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Chip,
  Stack,
  Button,
} from "@mui/material";
import dayjs from "dayjs";
import { apiFetch } from "../api/api";
import { useUser } from "../context/UserContext";

function MyPredictionsPage() {
  const { user } = useUser();
  const [predictions, setPredictions] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    if (user) {
      loadCompetitions();
      loadPredictions();
    }
  }, [user]);

  async function loadPredictions() {
    try {
      const data = await apiFetch(`/predictions/${user.id}`);
      setPredictions(data);
    } catch (err) {
      console.error("❌ Failed to load predictions:", err);
    }
  }

  async function loadCompetitions() {
    try {
      const comps = await apiFetch("/competitions");
      setCompetitions(comps);
    } catch (err) {
      console.error("❌ Failed to load competitions:", err);
    }
  }

  // Attach competition info (name + color) to predictions
  const predictionsWithComp = predictions.map((p) => {
    const comp = competitions.find((c) => c.id === p.competitionId);
    return {
      ...p,
      competitionName: comp?.name || "Unknown",
      color: comp?.color || "#666",
    };
  });

  // Apply filter
  const filteredPredictions =
    filter === "ALL"
      ? predictionsWithComp
      : predictionsWithComp.filter((p) => p.competitionName === filter);

  // Group by date
  const grouped = filteredPredictions.reduce((acc, pred) => {
    const dateKey = dayjs(pred.date).format("YYYY-MM-DD");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(pred);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  const scrollToToday = () => {
    const todayKey = dayjs().format("YYYY-MM-DD");
    const el = document.getElementById(`date-${todayKey}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Container sx={{ mt: 2 }}>
      {/* Competition filters */}
      <Stack
        direction="row"
        spacing={1}
        sx={{ mb: 2, flexWrap: "wrap", alignItems: "center" }}
      >
        <Chip
          label="ALL"
          color={filter === "ALL" ? "primary" : "default"}
          onClick={() => setFilter("ALL")}
        />
        {competitions.map((c) => (
          <Chip
            key={c.id}
            label={c.name}
            onClick={() => setFilter(c.name)}
            sx={{
              bgcolor: c.color || "#666",
              color: "white",
              opacity: filter === "ALL" || filter === c.name ? 1 : 0.5,
            }}
          />
        ))}
        <Button variant="outlined" onClick={scrollToToday}>
          Jump to Today
        </Button>
      </Stack>

      {/* Predictions grouped by date */}
      {sortedDates.map((dateKey) => (
        <Paper key={dateKey} id={`date-${dateKey}`} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {dayjs(dateKey).format("dddd, D MMMM YYYY")}
          </Typography>

          {grouped[dateKey].map((p) => (
            <Box
              key={p._id}
              sx={{
                display: "flex",
                alignItems: "center",
                p: 1,
                borderLeft: `8px solid ${p.color}`,
                mb: 1,
                bgcolor: "#fafafa",
              }}
            >
              <Typography sx={{ flex: 1 }}>
                {p.teamA} vs {p.teamB}
              </Typography>
              <Chip
                label={`${p.predictedWinner} by ${p.predictedMargin}`}
                sx={{
                  bgcolor: p.color,
                  color: "white",
                }}
              />
            </Box>
          ))}
        </Paper>
      ))}
    </Container>
  );
}

export default MyPredictionsPage;