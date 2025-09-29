import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Stack,
  Chip,
  TextField,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import dayjs from "dayjs";
import apiFetch from "../api/api"; // ✅ fixed import
import { useUser } from "../context/UserContext";

function MatchesPage() {
  const { user } = useUser();
  const [matches, setMatches] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [selectedComp, setSelectedComp] = useState("ALL");
  const [hideCompleted, setHideCompleted] = useState(false);

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    try {
      const comps = await apiFetch("/api/competitions");
      setCompetitions(comps);

      const data = await apiFetch("/api/matches");
      setMatches(data);

      if (user) {
        const preds = await apiFetch(`/api/predictions/${user.id}`);
        const predMap = {};
        preds.forEach((p) => {
          predMap[p.matchId] = { winner: p.winner, margin: p.margin };
        });
        setPredictions(predMap);
      }
    } catch (err) {
      console.error("❌ Failed to load matches:", err);
    }
  }

  function handlePrediction(matchId, field, value) {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: { ...prev[matchId], [field]: value },
    }));
  }

  async function submitPrediction(matchId) {
    if (!user) return alert("Please log in to submit predictions.");
    try {
      const prediction = predictions[matchId];
      if (!prediction?.winner) return alert("Select a winner first!");

      await apiFetch(`/api/predictions/${matchId}`, {
        method: "POST",
        body: JSON.stringify({
          userId: user.id,
          winner: prediction.winner,
          margin: prediction.margin,
        }),
      });

      alert("✅ Prediction saved!");
    } catch (err) {
      console.error("❌ Failed to submit prediction:", err);
    }
  }

  const groupedMatches = useMemo(() => {
    const grouped = {};
    matches.forEach((m) => {
      const date = dayjs(m.kickoff).format("YYYY-MM-DD");
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(m);
    });

    Object.values(grouped).forEach((arr) =>
      arr.sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff))
    );

    return Object.entries(grouped).sort(
      ([d1], [d2]) => new Date(d1) - new Date(d2)
    );
  }, [matches]);

  const filteredGroupedMatches = groupedMatches.map(([date, dayMatches]) => {
    let filtered = dayMatches;
    if (selectedComp !== "ALL") {
      filtered = filtered.filter((m) => m.competitionName === selectedComp);
    }
    if (hideCompleted) {
      filtered = filtered.filter((m) => new Date(m.kickoff) > new Date());
    }
    return [date, filtered];
  });

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

      {/* 📋 Matches */}
      {filteredGroupedMatches.map(([date, dayMatches]) =>
        dayMatches.length === 0 ? null : (
          <Paper key={date} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {dayjs(date).format("dddd, D MMMM YYYY")}
            </Typography>
            <Stack spacing={2}>
              {dayMatches.map((match) => {
                const isPast = new Date(match.kickoff) <= new Date();
                const prediction = predictions[match.id] || {};

                return (
                  <Box
                    key={match.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      borderLeft: `6px solid ${match.competitionColor || "#888"}`,
                      p: 1,
                      bgcolor: isPast ? "grey.100" : "white",
                    }}
                  >
                    <Chip
                      label={match.teamA}
                      clickable={!isPast}
                      onClick={
                        !isPast
                          ? () =>
                              handlePrediction(match.id, "winner", match.teamA)
                          : undefined
                      }
                      sx={{
                        mr: 1,
                        bgcolor:
                          prediction.winner === match.teamA
                            ? match.competitionColor
                            : "grey.400",
                        color: "white",
                      }}
                    />
                    <Chip
                      label={match.teamB}
                      clickable={!isPast}
                      onClick={
                        !isPast
                          ? () =>
                              handlePrediction(match.id, "winner", match.teamB)
                          : undefined
                      }
                      sx={{
                        mr: 1,
                        bgcolor:
                          prediction.winner === match.teamB
                            ? match.competitionColor
                            : "grey.400",
                        color: "white",
                      }}
                    />
                    <TextField
                      size="small"
                      type="number"
                      disabled={isPast}
                      value={prediction.margin || ""}
                      onChange={(e) =>
                        handlePrediction(match.id, "margin", e.target.value)
                      }
                      sx={{ width: 70, mr: 1 }}
                    />
                    {isPast ? (
                      <LockIcon fontSize="small" color="disabled" />
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => submitPrediction(match.id)}
                      >
                        Submit
                      </Button>
                    )}
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        )
      )}
    </Container>
  );
}

export default MatchesPage;