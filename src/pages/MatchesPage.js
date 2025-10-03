// src/pages/MatchesPage.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Chip,
  TextField,
  IconButton,
  Collapse,
  Divider,
  FormControlLabel,
  Switch,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import dayjs from "dayjs";
import { apiFetch } from "../api/api";
import { useUser } from "../context/UserContext";

function MatchesPage() {
  const { user, authFetch } = useUser();

  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPredictions, setSelectedPredictions] = useState({});
  const [hideCompleted, setHideCompleted] = useState(false);
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState("ALL");

  // ✅ Fetch matches, competitions, and predictions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchesData, compsData] = await Promise.all([
          apiFetch("/matches"),
          apiFetch("/competitions"),
        ]);
        setMatches(matchesData);
        setCompetitions(compsData);

        if (user) {
          try {
            const userPreds = await authFetch("/predictions");
            setPredictions(userPreds);
            const predMap = {};
            userPreds.forEach((p) => {
              predMap[p.matchId] = p;
            });
            setSelectedPredictions(predMap);
          } catch (err) {
            console.error("❌ Failed to fetch predictions:", err);
          }
        }
      } catch (err) {
        console.error("❌ Failed to load matches:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authFetch]);

  // ✅ Handle prediction selection
  const handlePrediction = (matchId, team) => {
    setSelectedPredictions((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        matchId,
        predictedWinner: team,
        margin: prev[matchId]?.margin || "",
      },
    }));
  };

  // ✅ Handle margin input
  const handleMarginChange = (matchId, margin) => {
    let value = parseInt(margin, 10);
    if (isNaN(value)) value = "";
    else if (value < 1) value = 1;
    else if (value > 999) value = 999;

    setSelectedPredictions((prev) => ({
      ...prev,
      [matchId]: { ...prev[matchId], margin: value },
    }));
  };

  // ✅ Submit predictions securely
  const handleSubmit = async (date) => {
    const toSubmit = Object.values(selectedPredictions).filter((p) =>
      matches.some(
        (m) =>
          m.id === p.matchId &&
          dayjs(m.kickoff).format("YYYY-MM-DD") === date &&
          dayjs(m.kickoff).isAfter(dayjs())
      )
    );

    if (toSubmit.length === 0) return;

    try {
      await authFetch("/predictions", {
        method: "POST",
        body: JSON.stringify(toSubmit),
      });
      alert("✅ Predictions submitted!");
    } catch (err) {
      console.error("❌ Failed to submit predictions:", err);
      alert("❌ Failed to submit predictions.");
    }
  };

  // ✅ Group matches by date
  const groupedMatches = matches.reduce((groups, match) => {
    const date = dayjs(match.kickoff).format("YYYY-MM-DD");
    if (!groups[date]) groups[date] = [];
    groups[date].push(match);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedMatches).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  if (loading) return <CircularProgress />;

  return (
    <Box>
      {/* Competition Filters */}
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <Chip
          label="ALL"
          color={selectedCompetition === "ALL" ? "primary" : "default"}
          onClick={() => setSelectedCompetition("ALL")}
        />
        {competitions.map((comp) => (
          <Chip
            key={comp.id}
            label={comp.name}
            sx={{
              backgroundColor:
                selectedCompetition === comp.id
                  ? comp.colour || "#1976d2"
                  : "#e0e0e0",
              color:
                selectedCompetition === comp.id
                  ? "#fff"
                  : "black",
            }}
            onClick={() => setSelectedCompetition(comp.id)}
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
        label="Hide completed matches"
      />

      {sortedDates.map((date) => {
        const dayMatches = groupedMatches[date].filter(
          (m) =>
            selectedCompetition === "ALL" ||
            m.competitionId === selectedCompetition
        );

        const visibleMatches = hideCompleted
          ? dayMatches.filter((m) => dayjs(m.kickoff).isAfter(dayjs()))
          : dayMatches;

        if (visibleMatches.length === 0) return null;

        return (
          <Box key={date} sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {dayjs(date).format("dddd, MMM D")}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {visibleMatches.map((match) => {
              const prediction = selectedPredictions[match.id] || {};
              const locked = dayjs(match.kickoff).isBefore(dayjs());

              return (
                <Box
                  key={match.id}
                  sx={{
                    mb: 2,
                    p: 2,
                    border: "1px solid #ccc",
                    borderRadius: 2,
                  }}
                >
                  {/* Competition Label */}
                  <Chip
                    label={match.competitionName}
                    sx={{
                      mb: 1,
                      backgroundColor:
                        competitions.find((c) => c.id === match.competitionId)
                          ?.colour || "#1976d2",
                      color: "white",
                    }}
                  />

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {/* Team Chips */}
                    {[match.teamA, match.teamB].map((team) => (
                      <Chip
                        key={team}
                        label={team}
                        onClick={() =>
                          !locked && handlePrediction(match.id, team)
                        }
                        sx={{
                          flex: 1,
                          backgroundColor:
                            prediction.predictedWinner === team
                              ? competitions.find(
                                  (c) => c.id === match.competitionId
                                )?.colour || "#1976d2"
                              : "#e0e0e0",
                          color:
                            prediction.predictedWinner === team
                              ? "white"
                              : "black",
                        }}
                      />
                    ))}

                    {/* Margin input */}
                    {!locked ? (
                      <TextField
                        type="number"
                        label="Margin"
                        size="small"
                        value={prediction.margin || ""}
                        onChange={(e) =>
                          handleMarginChange(match.id, e.target.value)
                        }
                        sx={{ width: 80 }}
                      />
                    ) : (
                      <LockIcon color="disabled" />
                    )}
                  </Box>
                </Box>
              );
            })}

            {/* Submit button only if upcoming matches exist */}
            {visibleMatches.some((m) => dayjs(m.kickoff).isAfter(dayjs())) && (
              <Button
                variant="contained"
                onClick={() => handleSubmit(date)}
                sx={{ mt: 2 }}
              >
                Submit Predictions
              </Button>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

export default MatchesPage;