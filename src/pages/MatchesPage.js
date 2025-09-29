// src/pages/MatchesPage.js
import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  Paper,
  Stack,
  Chip,
  Button,
  TextField,
  IconButton,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import dayjs from "dayjs";
import { apiFetch } from "../api/api";
import { useUser } from "../context/UserContext";

function MatchesPage() {
  const { user } = useUser();
  const [matches, setMatches] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [selectedCompetition, setSelectedCompetition] = useState("ALL");
  const [hideCompleted, setHideCompleted] = useState(false);

  const todayRef = useRef(null);

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    try {
      const comps = await apiFetch("/api/competitions");
      setCompetitions(comps);

      const matchList = await apiFetch("/api/matches");
      matchList.sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
      setMatches(matchList);

      if (user) {
        const preds = await apiFetch("/api/predictions");
        const map = {};
        preds.forEach((p) => {
          map[p.matchId] = p;
        });
        setPredictions(map);
      }
    } catch (err) {
      console.error("❌ Failed to load matches:", err);
    }
  }

  async function handlePredictionSubmit(cluster) {
    try {
      for (const match of cluster) {
        if (
          predictions[match.id] &&
          predictions[match.id].winner &&
          predictions[match.id].winner !== "" &&
          predictions[match.id].submittedAt
        ) {
          continue; // already submitted
        }

        const pred = predictions[match.id];
        if (pred && pred.winner) {
          await apiFetch("/api/predictions", {
            method: "POST",
            body: JSON.stringify({
              userId: user.id,
              matchId: match.id,
              winner: pred.winner,
            }),
          });
        }
      }
      loadMatches();
    } catch (err) {
      console.error("❌ Failed to submit predictions:", err);
    }
  }

  const groupedByDate = matches.reduce((acc, match) => {
    const date = dayjs(match.kickoff).format("YYYY-MM-DD");
    if (!acc[date]) acc[date] = [];
    acc[date].push(match);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  return (
    <Container sx={{ mt: 2 }}>
      {/* 🔹 Overlay Filter Bar */}
      <Paper
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          mb: 2,
          p: 1,
          backgroundColor: "white",
          boxShadow: 2,
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ flexWrap: "wrap", alignItems: "center" }}
        >
          <Chip
            label="ALL"
            clickable
            onClick={() => setSelectedCompetition("ALL")}
            sx={{
              bgcolor: selectedCompetition === "ALL" ? "grey.800" : "grey.400",
              color: "white",
              fontWeight: selectedCompetition === "ALL" ? "bold" : "normal",
            }}
          />
          {competitions.map((comp) => (
            <Chip
              key={comp.id}
              label={comp.name}
              clickable
              onClick={() =>
                setSelectedCompetition(
                  selectedCompetition === comp.id ? "ALL" : comp.id
                )
              }
              sx={{
                bgcolor:
                  selectedCompetition === "ALL" || selectedCompetition === comp.id
                    ? comp.color || "#1976d2"
                    : "grey.400",
                color: "white",
                fontWeight:
                  selectedCompetition === comp.id ? "bold" : "normal",
              }}
            />
          ))}
          <FormControlLabel
            control={
              <Checkbox
                checked={hideCompleted}
                onChange={(e) => setHideCompleted(e.target.checked)}
              />
            }
            label="Hide completed"
          />
        </Stack>
      </Paper>

      {/* 🔹 Matches by Date */}
      {sortedDates.map((date) => {
        const cluster = groupedByDate[date].filter((m) => {
          if (
            selectedCompetition !== "ALL" &&
            m.competitionId !== selectedCompetition
          )
            return false;
          if (hideCompleted && new Date(m.kickoff) < new Date()) return false;
          return true;
        });

        if (cluster.length === 0) return null;

        return (
          <Paper
            key={date}
            ref={
              dayjs(date).isSame(dayjs(), "day") && !todayRef.current
                ? todayRef
                : null
            }
            sx={{ mb: 3, p: 2, borderLeft: `8px solid ${cluster[0].competitionColor}` }}
          >
            <Stack spacing={2}>
              {cluster.map((match) => {
                const pred = predictions[match.id] || {};
                const isPast = new Date(match.kickoff) < new Date();

                return (
                  <Stack
                    key={match.id}
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{
                      opacity: isPast ? 0.5 : 1,
                    }}
                  >
                    <Chip
                      label={match.teamA}
                      clickable={!isPast}
                      onClick={() =>
                        !isPast &&
                        setPredictions((prev) => ({
                          ...prev,
                          [match.id]: { ...pred, winner: match.teamA },
                        }))
                      }
                      sx={{
                        bgcolor:
                          pred.winner === match.teamA
                            ? match.competitionColor
                            : "grey.400",
                        color: "white",
                      }}
                    />
                    <Chip
                      label={match.teamB}
                      clickable={!isPast}
                      onClick={() =>
                        !isPast &&
                        setPredictions((prev) => ({
                          ...prev,
                          [match.id]: { ...pred, winner: match.teamB },
                        }))
                      }
                      sx={{
                        bgcolor:
                          pred.winner === match.teamB
                            ? match.competitionColor
                            : "grey.400",
                        color: "white",
                      }}
                    />
                    <TextField
                      size="small"
                      type="number"
                      value={pred.margin || ""}
                      onChange={(e) =>
                        setPredictions((prev) => ({
                          ...prev,
                          [match.id]: {
                            ...pred,
                            margin: parseInt(e.target.value, 10) || "",
                          },
                        }))
                      }
                      disabled={isPast}
                      sx={{ width: 70 }}
                    />
                    {isPast && <LockIcon fontSize="small" />}
                  </Stack>
                );
              })}
              <Button
                variant="contained"
                onClick={() => handlePredictionSubmit(cluster)}
                disabled={cluster.every(
                  (m) =>
                    !predictions[m.id] ||
                    !predictions[m.id].winner ||
                    new Date(m.kickoff) < new Date()
                )}
                sx={{ alignSelf: "flex-end" }}
              >
                Submit Predictions
              </Button>
            </Stack>
          </Paper>
        );
      })}
    </Container>
  );
}

export default MatchesPage;