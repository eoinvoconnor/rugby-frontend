// src/pages/MatchesPage.js

import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Typography,
  TextField,
} from "@mui/material";
import SportsRugbyIcon from "@mui/icons-material/SportsRugby";
import LockIcon from "@mui/icons-material/Lock";
import { apiFetch } from "../api/api";

// Competition colors
const competitionColors = {
  Premiership: "#003087",
  URC: "#4CAF50",
  "Top 14": "#FFD700",
  SixNations: "#D32F2F",
  default: "#9E9E9E",
};

function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [filter, setFilter] = useState("ALL");
  const [hideCompleted, setHideCompleted] = useState(false);

  // Fetch matches + competitions
  useEffect(() => {
    const loadData = async () => {
      try {
        const comps = await apiFetch("/competitions");
        setCompetitions(comps);

        const data = await apiFetch("/matches");
        // ✅ Sort matches by kickoff ascending
        const sorted = data.sort(
          (a, b) => new Date(a.kickoff) - new Date(b.kickoff)
        );
        setMatches(sorted);
      } catch (err) {
        console.error("❌ Failed to load matches:", err);
      }
    };
    loadData();
  }, []);

  const handlePrediction = (matchId, team, margin) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: { team, margin },
    }));
  };

  const handleSubmit = async (clusterMatches) => {
    try {
      const payload = clusterMatches
        .filter((m) => predictions[m.id])
        .map((m) => ({
          matchId: m.id,
          ...predictions[m.id],
        }));

      if (payload.length > 0) {
        await apiFetch("/predictions", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        alert("✅ Predictions saved!");
      }
    } catch (err) {
      console.error("❌ Failed to submit predictions:", err);
      alert("❌ Failed to submit predictions");
    }
  };

  // Group matches by day
  const groupedByDay = matches.reduce((acc, match) => {
    const day = dayjs(match.kickoff).format("YYYY-MM-DD");
    if (!acc[day]) acc[day] = [];
    acc[day].push(match);
    return acc;
  }, {});

  // Apply filters
  const filteredGroups = Object.entries(groupedByDay).filter(([day, dayMatches]) => {
    const visibleMatches = dayMatches.filter((m) => {
      const isPast = new Date(m.kickoff) < new Date();
      if (hideCompleted && isPast) return false;
      if (filter !== "ALL" && m.competitionName !== filter) return false;
      return true;
    });
    return visibleMatches.length > 0;
  });

  return (
    <Box p={2}>
      {/* Competition Filter Chips */}
      <Box mb={2} display="flex" gap={1} flexWrap="wrap">
        <Chip
          label="ALL"
          color={filter === "ALL" ? "primary" : "default"}
          onClick={() => setFilter("ALL")}
        />
        {competitions.map((comp) => (
          <Chip
            key={comp.id}
            label={comp.name}
            onClick={() => setFilter(comp.name)}
            sx={{
              backgroundColor:
                filter === comp.name
                  ? competitionColors[comp.name] || competitionColors.default
                  : "#E0E0E0",
              color: filter === comp.name ? "#fff" : "#000",
            }}
          />
        ))}
        <Chip
          label={hideCompleted ? "Show Completed" : "Hide Completed"}
          onClick={() => setHideCompleted(!hideCompleted)}
        />
      </Box>

      {/* Match Clusters by Day */}
      {filteredGroups.map(([day, dayMatches]) => {
        const visibleMatches = dayMatches.filter((m) => {
          const isPast = new Date(m.kickoff) < new Date();
          if (hideCompleted && isPast) return false;
          if (filter !== "ALL" && m.competitionName !== filter) return false;
          return true;
        });

        if (visibleMatches.length === 0) return null;

        return (
          <Paper key={day} sx={{ mb: 3, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {dayjs(day).format("dddd, MMMM D")}
            </Typography>
            <Grid container spacing={2}>
              {visibleMatches.map((match) => {
                const isPast = new Date(match.kickoff) < new Date();
                const prediction = predictions[match.id] || {};
                const color =
                  competitionColors[match.competitionName] ||
                  competitionColors.default;

                return (
                  <Grid
                    item
                    xs={12}
                    key={match.id}
                    sx={{
                      borderLeft: `8px solid ${color}`,
                      opacity: isPast ? 0.6 : 1,
                      position: "relative",
                    }}
                  >
                    {isPast && (
                      <LockIcon
                        sx={{
                          position: "absolute",
                          left: 8,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#757575",
                        }}
                      />
                    )}
                    <Box display="flex" alignItems="center" gap={2} p={1}>
                      {/* Team A */}
                      <Chip
                        label={match.teamA}
                        onClick={() =>
                          !isPast &&
                          handlePrediction(match.id, "A", prediction.margin || 0)
                        }
                        sx={{
                          backgroundColor:
                            prediction.team === "A" ? color : "#E0E0E0",
                          color: prediction.team === "A" ? "#fff" : "#000",
                        }}
                      />
                      <Typography variant="body1">vs</Typography>
                      {/* Team B */}
                      <Chip
                        label={match.teamB}
                        onClick={() =>
                          !isPast &&
                          handlePrediction(match.id, "B", prediction.margin || 0)
                        }
                        sx={{
                          backgroundColor:
                            prediction.team === "B" ? color : "#E0E0E0",
                          color: prediction.team === "B" ? "#fff" : "#000",
                        }}
                      />
                      {/* Margin input */}
                      <TextField
                        type="number"
                        size="small"
                        label="Margin"
                        value={prediction.margin || ""}
                        onChange={(e) =>
                          handlePrediction(
                            match.id,
                            prediction.team,
                            parseInt(e.target.value) || 0
                          )
                        }
                        disabled={isPast}
                        sx={{ width: 80 }}
                      />
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
            {/* Cluster Submit */}
            <Box mt={2} textAlign="right">
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSubmit(dayMatches)}
              >
                Submit Predictions
              </Button>
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}

export default MatchesPage;