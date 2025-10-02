// src/pages/MatchesPage.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Chip,
  Button,
  Box,
  Paper,
  Grid,
  Divider,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { apiFetch } from "../api/api";

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [hideCompleted, setHideCompleted] = useState(false);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const data = await apiFetch("/competitions");
        setMatches(data.matches || []);
      } catch (err) {
        console.error("❌ Failed to load matches:", err);
      }
    }
    fetchMatches();
  }, []);

  const handlePrediction = (matchId, team) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: team,
    }));
  };

  // Group matches by date
  const groupByDate = (matches) => {
    const grouped = {};
    matches.forEach((match) => {
      const date = new Date(match.kickoff).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(match);
    });
    return grouped;
  };

  // Apply filters
  const filteredMatches = matches.filter((match) => {
    const matchDate = new Date(match.kickoff);
    const isCompleted = matchDate < new Date();

    if (hideCompleted && isCompleted) return false;
    if (activeFilter !== "ALL" && match.competitionName !== activeFilter)
      return false;

    return true;
  });

  const groupedMatches = groupByDate(filteredMatches);

  return (
    <Container>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        {/* Filter Chips */}
        {["ALL", "URC", "Top 14", "Premiership"].map((comp) => (
          <Chip
            key={comp}
            label={comp}
            clickable
            color={activeFilter === comp ? "primary" : "default"}
            onClick={() => setActiveFilter(comp)}
          />
        ))}

        {/* Hide Completed Switch */}
        <FormControlLabel
          control={
            <Switch
              checked={hideCompleted}
              onChange={(e) => setHideCompleted(e.target.checked)}
            />
          }
          label="Hide Completed Matches"
        />
      </Box>

      {/* Render Matches by Date */}
      {Object.entries(groupedMatches).map(([date, matches]) => (
        <Box key={date} mb={4}>
          <Typography variant="h6" gutterBottom>
            {date}
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            {matches.map((match) => {
              const matchDate = new Date(match.kickoff);
              const isCompleted = matchDate < new Date();
              const userPick = predictions[match.id];

              return (
                <React.Fragment key={match.id}>
                  <Grid
                    container
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 1 }}
                  >
                    <Grid item xs={10}>
                      <Box display="flex" gap={1}>
                        <Chip
                          label={match.teamA}
                          color={
                            userPick === match.teamA ? "primary" : "default"
                          }
                          disabled={isCompleted}
                          onClick={() => handlePrediction(match.id, match.teamA)}
                        />
                        <Chip
                          label={match.teamB}
                          color={
                            userPick === match.teamB ? "primary" : "default"
                          }
                          disabled={isCompleted}
                          onClick={() => handlePrediction(match.id, match.teamB)}
                        />
                      </Box>
                    </Grid>
                    <Grid item>
                      {isCompleted ? (
                        <Chip label="Locked" color="default" />
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          {new Date(match.kickoff).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                  <Divider />
                </React.Fragment>
              );
            })}
            {matches.length > 0 && (
              <Box mt={2}>
                <Button variant="contained" color="primary">
                  Submit Predictions
                </Button>
              </Box>
            )}
          </Paper>
        </Box>
      ))}
    </Container>
  );
}