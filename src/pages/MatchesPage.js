// src/pages/MatchesPage.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import dayjs from "dayjs";
import { apiFetch } from "../api/api";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

function MatchesPage() {
  const { user, login, logout } = useContext(UserContext);
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState("ALL");
  const [hideCompleted, setHideCompleted] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const comps = await apiFetch("/competitions");
        setCompetitions(comps);

        const data = await apiFetch("/matches");
        const sorted = data.sort(
          (a, b) => new Date(a.kickoff) - new Date(b.kickoff)
        );
        setMatches(sorted);

        if (user) {
          const token = localStorage.getItem("token");
          const preds = await apiFetch("/predictions", {
            headers: {
              Authorization: `Bearer ${token}`, // ✅ attach token
            },
          });
          const mapped = {};
          preds.forEach((p) => {
            mapped[p.matchId] = { team: p.predictedWinner, margin: p.margin };
          });
          setPredictions(mapped);
        }
      } catch (err) {
        console.error("❌ Failed to load matches:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handlePrediction = (matchId, team) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: { ...(prev[matchId] || {}), team },
    }));
  };

  const handleMarginChange = (matchId, value) => {
    let margin = parseInt(value, 10);
    if (isNaN(margin)) margin = "";
    else {
      if (margin < 1) margin = 1;
      if (margin > 999) margin = 999;
    }
    setPredictions((prev) => ({
      ...prev,
      [matchId]: { ...(prev[matchId] || {}), margin },
    }));
  };

  const handleSubmit = async (clusterMatches) => {
    try {
      const token = localStorage.getItem("token");
      for (const match of clusterMatches) {
        const pred = predictions[match.id];
        if (!pred) continue;

        await apiFetch("/predictions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ attach token
          },
          body: JSON.stringify({
            userId: user.id,
            matchId: match.id,
            predictedWinner: pred.team,
            margin: pred.margin || 0,
          }),
        });
      }
      alert("✅ Predictions saved!");
    } catch (err) {
      console.error("❌ Failed to submit predictions:", err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  const groupedByDate = matches.reduce((acc, match) => {
    const dateKey = dayjs(match.kickoff).format("YYYY-MM-DD");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(match);
    return acc;
  }, {});

  return (
    <Box p={2}>
      {/* Competition Filters */}
      <Box mb={2} display="flex" flexWrap="wrap" gap={1}>
        <Chip
          label="ALL"
          color={selectedCompetition === "ALL" ? "primary" : "default"}
          onClick={() => setSelectedCompetition("ALL")}
        />
        {competitions.map((c) => (
          <Chip
            key={c.id}
            label={c.name}
            onClick={() => setSelectedCompetition(c.name)}
            sx={{
              bgcolor: c.color || "#666",
              color: "white",
              opacity:
                selectedCompetition === "ALL" || selectedCompetition === c.name
                  ? 1
                  : 0.5,
            }}
          />
        ))}
      </Box>

      {/* Hide completed toggle */}
      <FormControlLabel
        control={
          <Switch
            checked={hideCompleted}
            onChange={() => setHideCompleted(!hideCompleted)}
          />
        }
        label={
          hideCompleted ? "Show Completed Matches" : "Hide Completed Matches"
        }
      />

      {/* Matches grouped by date */}
      {Object.keys(groupedByDate).map((dateKey) => {
        const clusterMatches = groupedByDate[dateKey].filter(
          (m) =>
            selectedCompetition === "ALL" ||
            m.competitionName === selectedCompetition
        );

        const now = new Date();
        const visibleMatches = hideCompleted
          ? clusterMatches.filter((m) => new Date(m.kickoff) > now)
          : clusterMatches;

        if (visibleMatches.length === 0) return null;

        const allCompleted = visibleMatches.every(
          (m) => new Date(m.kickoff) < now
        );

        return (
          <Box key={dateKey} mb={4}>
            <Typography variant="h6" gutterBottom>
              {dayjs(dateKey).format("dddd, MMM D")}
            </Typography>

            {visibleMatches.map((match) => {
              const isPast = new Date(match.kickoff) < now;
              const userPred = predictions[match.id] || {};
              const compColor =
                competitions.find((c) => c.name === match.competitionName)
                  ?.color || "grey";

              return (
                <Box
                  key={match.id}
                  display="flex"
                  alignItems="center"
                  p={1}
                  mb={1}
                  sx={{
                    border: "1px solid #ccc",
                    borderLeft: `8px solid ${compColor}`,
                    opacity: isPast ? 0.6 : 1,
                  }}
                >
                  {isPast && (
                    <LockIcon fontSize="small" sx={{ mr: 1, color: "grey" }} />
                  )}
                  <Box flex={1} display="flex" gap={1}>
                    <Chip
                      label={match.teamA}
                      onClick={() =>
                        !isPast && handlePrediction(match.id, match.teamA)
                      }
                      sx={{
                        bgcolor: compColor,
                        opacity: userPred.team === match.teamA ? 1 : 0.5,
                        color: "white",
                      }}
                    />
                    <Chip
                      label={match.teamB}
                      onClick={() =>
                        !isPast && handlePrediction(match.id, match.teamB)
                      }
                      sx={{
                        bgcolor: compColor,
                        opacity: userPred.team === match.teamB ? 1 : 0.5,
                        color: "white",
                      }}
                    />
                  </Box>
                  <TextField
                    type="number"
                    size="small"
                    sx={{ width: 60, ml: 1 }}
                    value={userPred.margin || ""}
                    onChange={(e) =>
                      handleMarginChange(match.id, e.target.value)
                    }
                    disabled={isPast}
                  />
                </Box>
              );
            })}

            {!allCompleted && (
              <Box mt={1} textAlign="right">
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleSubmit(clusterMatches)}
                >
                  Submit Predictions
                </Button>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

export default MatchesPage;