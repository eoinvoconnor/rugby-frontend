import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Stack,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Button,
} from "@mui/material";
import dayjs from "dayjs";
import apiFetch from "../api/api"; // ✅ fixed import
import { useUser } from "../context/UserContext";

function MyPredictionsPage() {
  const { user } = useUser();
  const [predictions, setPredictions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [selectedComp, setSelectedComp] = useState("ALL");

  useEffect(() => {
    if (user) {
      loadPredictions();
    }
  }, [user]);

  async function loadPredictions() {
    try {
      const comps = await apiFetch("/api/competitions");
      setCompetitions(comps);

      const allMatches = await apiFetch("/api/matches");
      setMatches(allMatches);

      const preds = await apiFetch(`/api/predictions/${user.id}`);
      setPredictions(preds);
    } catch (err) {
      console.error("❌ Failed to load predictions:", err);
    }
  }

  const mergedPredictions = useMemo(() => {
    return predictions
      .map((p) => {
        const match = matches.find((m) => m.id === p.matchId);
        return match
          ? {
              ...p,
              teamA: match.teamA,
              teamB: match.teamB,
              competitionName: match.competitionName,
              competitionColor: match.competitionColor,
              kickoff: match.kickoff,
            }
          : null;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
  }, [predictions, matches]);

  const filteredPredictions = mergedPredictions.filter(
    (p) => selectedComp === "ALL" || p.competitionName === selectedComp
  );

  return (
    <Container sx={{ mt: 2 }}>
      {/* 📌 Competition Filters */}
      <Stack
        direction="row"
        spacing={1}
        mb={2}
        flexWrap="wrap"
        justifyContent="center"
      >
        <ToggleButtonGroup
          value={selectedComp}
          exclusive
          onChange={(e, val) => val && setSelectedComp(val)}
        >
          <ToggleButton value="ALL">ALL</ToggleButton>
          {competitions.map((c) => (
            <ToggleButton key={c.id} value={c.name}>
              <Chip
                label={c.name}
                sx={{
                  bgcolor: selectedComp === c.name ? "grey.500" : c.color,
                  color: "white",
                }}
              />
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      {/* 📋 Predictions List */}
      {filteredPredictions.length === 0 ? (
        <Typography>No predictions yet.</Typography>
      ) : (
        filteredPredictions.map((p) => (
          <Paper
            key={p.matchId}
            sx={{
              p: 2,
              mb: 2,
              borderLeft: `6px solid ${p.competitionColor || "#888"}`,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography sx={{ flex: 1 }}>
                {p.teamA} vs {p.teamB}
              </Typography>
              <Chip
                label={p.winner}
                sx={{
                  bgcolor: p.competitionColor || "primary.main",
                  color: "white",
                }}
              />
              <Typography>Margin: {p.margin || "—"}</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {dayjs(p.kickoff).format("dddd, D MMMM YYYY")}
            </Typography>
          </Paper>
        ))
      )}

      {/* Jump to Now button */}
      {filteredPredictions.length > 0 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Button
            variant="outlined"
            onClick={() => {
              const upcoming = filteredPredictions.find(
                (p) => new Date(p.kickoff) > new Date()
              );
              if (upcoming) {
                const el = document.getElementById(`match-${upcoming.matchId}`);
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            Jump to Now
          </Button>
        </Box>
      )}
    </Container>
  );
}

export default MyPredictionsPage;