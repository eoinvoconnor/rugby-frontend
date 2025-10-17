// src/pages/MyPredictionsPage.js
import React, { useEffect, useState, useCallback } from "react";
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

const pillStyle = (color) => ({
  bgcolor: color || "#1976d2",
  color: "#fff",
  fontWeight: 600,
});

export default function MyPredictionsPage() {
  const { user } = useUser();
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "My predictions";
  }, []);

  const buildGroups = useCallback((allMatches, preds) => {
    // Index matches for quick join
    const matchById = new Map((allMatches || []).map((m) => [m.id, m]));

    const enriched = (preds || [])
      .map((pred) => {
        const match = matchById.get(pred.matchId);
        if (!match) return null;

        const dateKey = dayjs(match.kickoff).format("YYYY-MM-DD");

        // Be tolerant of old/new shapes
        const pick =
          pred.predictedWinner ??
          pred.winner ??
          ""; // empty means not chosen (shouldn’t happen post-submit)

        const margin =
          pred.margin ??
          pred.predictedMargin ??
          null;

        return {
          ...pred,
          dateKey,
          // from match
          teamA: match.teamA,
          teamB: match.teamB,
          kickoff: match.kickoff,
          competitionName: match.competitionName,
          color: match.competitionColor || "#1976d2",
          // normalized fields for display
          pick,
          margin,
        };
      })
      .filter(Boolean);

    const groupedByDate = enriched.reduce((acc, item) => {
      acc[item.dateKey] = acc[item.dateKey] || [];
      acc[item.dateKey].push(item);
      return acc;
    }, {});
    setGrouped(groupedByDate);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, p] = await Promise.all([
        apiFetch("/matches"),
        apiFetch("/predictions"),
      ]);
      setMatches(m || []);
      setPredictions(p || []);
      buildGroups(m || [], p || []);
    } catch (err) {
      console.error("❌ Failed to load my predictions", err);
      setMatches([]);
      setPredictions([]);
      setGrouped({});
    } finally {
      setLoading(false);
    }
  }, [buildGroups]);

  useEffect(() => {
    load();
  }, [load]);

  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h4">My predictions</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          {user && (
            <Typography variant="body2" color="text.secondary">
              Signed in as <strong>{user.firstname || user.email}</strong>
            </Typography>
          )}
          <Button
            size="small"
            variant="outlined"
            onClick={load}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
        </Stack>
      </Stack>

      {sortedDates.length === 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography color="text.secondary">
            {loading
              ? "Loading your predictions…"
              : "You haven’t submitted any predictions yet."}
          </Typography>
        </Paper>
      )}

      {/* Predictions grouped by date */}
      {sortedDates.map((dateKey) => (
        <Paper key={dateKey} id={`date-${dateKey}`} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {dayjs(dateKey).format("dddd, D MMMM YYYY")}
          </Typography>

          {grouped[dateKey].map((p) => (
            <Box
              key={`${p.userId}-${p.matchId}`}
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
                size="small"
                label={
                  p.pick
                    ? `${p.pick}${p.margin ? ` by ${p.margin}` : ""}`
                    : "—"
                }
                sx={pillStyle(p.color)}
              />
            </Box>
          ))}
        </Paper>
      ))}
    </Container>
  );
}