// src/pages/MatchesPage.js

import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { apiFetch } from "../api/api";
import { useUser } from "../context/UserContext";

function MatchesPage() {
  const { user } = useUser();
  const [matches, setMatches] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  // Load competitions + matches
  useEffect(() => {
    async function loadData() {
      try {
        const comps = await apiFetch("/competitions");
        setCompetitions(comps);

        const data = await apiFetch("/matches");
        // Sort by kickoff ascending
        data.sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
        setMatches(data);

        if (user) {
          const preds = await apiFetch(`/predictions/${user.id}`);
          const predMap = {};
          preds.forEach((p) => {
            predMap[p.matchId] = { team: p.team, margin: p.margin };
          });
          setPredictions(predMap);
        }
      } catch (err) {
        console.error("❌ Failed to load matches:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handlePredictionChange = (matchId, team, margin) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: { team, margin },
    }));
  };

  const handleSubmitCluster = async (cluster) => {
    try {
      const payload = cluster.matches
        .filter((m) => predictions[m._id])
        .map((m) => ({
          matchId: m._id,
          userId: user.id,
          ...predictions[m._id],
        }));

      if (payload.length > 0) {
        await apiFetch("/predictions", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        alert("Predictions saved!");
      }
    } catch (err) {
      console.error("❌ Failed to save predictions:", err);
    }
  };

  // Group matches by date + competition
  const groupedMatches = matches.reduce((acc, m) => {
    const dateKey = dayjs(m.kickoff).format("YYYY-MM-DD");
    if (!acc[dateKey]) acc[dateKey] = {};
    if (!acc[dateKey][m.competition]) acc[dateKey][m.competition] = [];
    acc[dateKey][m.competition].push(m);
    return acc;
  }, {});

  // Apply filter
  const filteredClusters = Object.entries(groupedMatches).map(
    ([date, comps]) => ({
      date,
      competitions: Object.entries(comps)
        .filter(
          ([comp]) => filter === "ALL" || comp.toLowerCase() === filter.toLowerCase()
        )
        .map(([comp, matches]) => ({ comp, matches })),
    })
  );

  if (loading) return <CircularProgress />;

  return (
    <Container>
      {/* Competition Filter Chips */}
      <Stack direction="row" spacing={1} mb={2} sx={{ flexWrap: "wrap" }}>
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
              bgcolor:
                filter === c.name ? c.color || "primary.main" : "default",
              color: filter === c.name ? "white" : "black",
            }}
          />
        ))}
      </Stack>

      {/* Clusters */}
      {filteredClusters.map((cluster) => (
        <Box key={cluster.date} sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            {dayjs(cluster.date).format("dddd, D MMMM YYYY")}
          </Typography>

          {cluster.competitions.map(({ comp, matches }) => {
            const compData = competitions.find((c) => c.name === comp);

            return (
              <Box
                key={comp}
                sx={{
                  border: `2px solid ${compData?.color || "#ccc"}`,
                  borderRadius: 2,
                  p: 2,
                  mb: 3,
                }}
              >
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  {comp}
                </Typography>

                {matches.map((m) => {
                  const isPast = dayjs(m.kickoff).isBefore(dayjs());
                  const pred = predictions[m._id] || {};

                  return (
                    <Box
                      key={m._id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 1,
                        borderLeft: `8px solid ${compData?.color || "#ccc"}`,
                        mb: 1,
                        bgcolor: isPast ? "#f5f5f5" : "white",
                      }}
                    >
                      {isPast && <LockIcon sx={{ color: "grey", mr: 2 }} />}

                      <Stack direction="row" spacing={1}>
                        <Chip
                          label={m.teamA}
                          disabled={isPast}
                          sx={{
                            bgcolor:
                              pred.team === m.teamA
                                ? compData?.color || "primary.main"
                                : "default",
                            color: pred.team === m.teamA ? "white" : "black",
                          }}
                          onClick={() =>
                            !isPast &&
                            handlePredictionChange(
                              m._id,
                              m.teamA,
                              pred.margin
                            )
                          }
                        />
                        <Chip
                          label={m.teamB}
                          disabled={isPast}
                          sx={{
                            bgcolor:
                              pred.team === m.teamB
                                ? compData?.color || "primary.main"
                                : "default",
                            color: pred.team === m.teamB ? "white" : "black",
                          }}
                          onClick={() =>
                            !isPast &&
                            handlePredictionChange(
                              m._id,
                              m.teamB,
                              pred.margin
                            )
                          }
                        />
                      </Stack>

                      <TextField
                        type="number"
                        size="small"
                        value={pred.margin || ""}
                        disabled={isPast}
                        onChange={(e) =>
                          handlePredictionChange(
                            m._id,
                            pred.team,
                            e.target.value
                          )
                        }
                        sx={{ width: 70, ml: 2 }}
                      />
                    </Box>
                  );
                })}

                {/* Submit button per competition cluster */}
                {user && (
                  <Button
                    variant="contained"
                    onClick={() => handleSubmitCluster({ matches })}
                    sx={{ mt: 2 }}
                  >
                    Submit Predictions
                  </Button>
                )}
              </Box>
            );
          })}
        </Box>
      ))}
    </Container>
  );
}

export default MatchesPage;