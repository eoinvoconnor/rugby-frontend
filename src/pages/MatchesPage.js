// src/pages/MatchesPage.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Chip,
  Stack,
  TextField,
} from "@mui/material";
import dayjs from "dayjs";
import LockIcon from "@mui/icons-material/Lock";
import { apiFetch } from "../api/api";
import { useUser } from "../context/UserContext";

function MatchesPage() {
  const { user } = useUser();
  const [matches, setMatches] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [predictions, setPredictions] = useState({});
  const [hideCompleted, setHideCompleted] = useState(false);

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    try {
      const comps = await apiFetch("/competitions");
      setCompetitions(comps);

      const data = await apiFetch("/matches");
      setMatches(data);
    } catch (err) {
      console.error("❌ Failed to load matches:", err);
    }
  }

  const handlePredictionChange = (matchId, team, margin) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: { team, margin },
    }));
  };

  const handleSubmit = async (clusterMatches) => {
    const toSubmit = clusterMatches
      .filter((m) => predictions[m._id])
      .map((m) => ({
        matchId: m._id,
        ...predictions[m._id],
      }));

    if (!toSubmit.length) return;

    try {
      await apiFetch("/predictions", {
        method: "POST",
        body: JSON.stringify({ predictions: toSubmit }),
      });
      alert("Predictions submitted!");
    } catch (err) {
      console.error("❌ Failed to submit predictions:", err);
    }
  };

  // Filtering
  const filteredMatches =
    filter === "ALL"
      ? matches
      : matches.filter((m) => m.competition === filter);

  const upcomingMatches = filteredMatches.filter((m) => {
    const isPast = dayjs(m.kickoff).isBefore(dayjs());
    return hideCompleted ? !isPast : true;
  });

  // Group by competition + kickoff date
  const grouped = upcomingMatches.reduce((acc, match) => {
    const dateKey = dayjs(match.kickoff).format("YYYY-MM-DD");
    const compKey = match.competition;
    const clusterKey = `${compKey}_${dateKey}`;

    if (!acc[clusterKey]) {
      acc[clusterKey] = { competition: compKey, date: dateKey, matches: [] };
    }
    acc[clusterKey].matches.push(match);
    return acc;
  }, {});

  const sortedClusters = Object.values(grouped).sort((a, b) => {
    if (a.date === b.date) return a.competition.localeCompare(b.competition);
    return new Date(a.date) - new Date(b.date);
  });

  return (
    <Container sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Matches
      </Typography>

      {/* Competition Filter */}
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
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
      </Stack>

      {sortedClusters.map((cluster) => (
        <Paper key={cluster.competition + cluster.date} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {cluster.competition} —{" "}
            {dayjs(cluster.date).format("dddd, D MMMM YYYY")}
          </Typography>

          {cluster.matches.map((m) => {
            const isPast = dayjs(m.kickoff).isBefore(dayjs());
            const pred = predictions[m._id] || {};
            const comp = competitions.find((c) => c.name === m.competition);

            return (
              <Box
                key={m._id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 1,
                  borderLeft: `8px solid ${comp?.color || "#ccc"}`,
                  mb: 1,
                  bgcolor: isPast ? "#f5f5f5" : "white",
                }}
              >
                {isPast ? (
                  <LockIcon sx={{ color: "grey", mr: 2 }} />
                ) : (
                  <>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={m.teamA}
                        sx={{
                          bgcolor:
                            pred.team === m.teamA
                              ? comp?.color || "primary.main"
                              : "default",
                          color: pred.team === m.teamA ? "white" : "black",
                        }}
                        onClick={() =>
                          handlePredictionChange(m._id, m.teamA, pred.margin)
                        }
                      />
                      <Chip
                        label={m.teamB}
                        sx={{
                          bgcolor:
                            pred.team === m.teamB
                              ? comp?.color || "primary.main"
                              : "default",
                          color: pred.team === m.teamB ? "white" : "black",
                        }}
                        onClick={() =>
                          handlePredictionChange(m._id, m.teamB, pred.margin)
                        }
                      />
                    </Stack>
                    <TextField
                      type="number"
                      size="small"
                      value={pred.margin || ""}
                      onChange={(e) =>
                        handlePredictionChange(m._id, pred.team, e.target.value)
                      }
                      sx={{ width: 70, ml: 2 }}
                    />
                  </>
                )}
              </Box>
            );
          })}

          {/* Cluster Submit */}
          <Box sx={{ textAlign: "right", mt: 1 }}>
            <Button
              variant="contained"
              onClick={() => handleSubmit(cluster.matches)}
              disabled={cluster.matches.every((m) =>
                dayjs(m.kickoff).isBefore(dayjs())
              )}
            >
              Submit
            </Button>
          </Box>
        </Paper>
      ))}
    </Container>
  );
}

export default MatchesPage;