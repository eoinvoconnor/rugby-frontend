// src/pages/MatchesPage.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Chip,
  Button,
  TextField,
  Grid,
  Switch,
  FormControlLabel,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { apiFetch } from "../api/api";

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [hideCompleted, setHideCompleted] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const comps = await apiFetch("/competitions");
        const mats = await apiFetch("/matches");
        setCompetitions(comps);
        setMatches(mats);
      } catch (err) {
        console.error("❌ Failed to fetch matches:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePredictionChange = (matchId, team, margin) => {
    setPredictions({
      ...predictions,
      [matchId]: { team, margin },
    });
  };

  const handleSubmit = async (dayMatches) => {
    try {
      await apiFetch("/predictions", {
        method: "POST",
        body: JSON.stringify(
          dayMatches.map((m) => ({
            matchId: m.id,
            prediction: predictions[m.id] || null,
          }))
        ),
      });
      alert("✅ Predictions submitted!");
    } catch (err) {
      console.error("❌ Error submitting predictions:", err);
      alert("Failed to submit predictions");
    }
  };

  if (loading) return <Typography>Loading matches...</Typography>;

  // Group matches by date
  const matchesByDate = matches.reduce((acc, match) => {
    const date = new Date(match.kickoff).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(match);
    return acc;
  }, {});

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Matches
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={hideCompleted}
            onChange={(e) => setHideCompleted(e.target.checked)}
          />
        }
        label="Hide Completed Matches"
      />

      {Object.entries(matchesByDate).map(([date, dayMatches]) => {
        // Filter matches if hiding completed
        const filteredMatches = hideCompleted
          ? dayMatches.filter((m) => new Date(m.kickoff) > new Date())
          : dayMatches;

        // Skip this cluster if no matches remain
        if (filteredMatches.length === 0) return null;

        return (
          <div key={date} style={{ marginBottom: "2rem" }}>
            <Typography variant="h6">{date}</Typography>

            {/* Competition chip — one per date cluster */}
            {filteredMatches.length > 0 && (
              <Chip
                label={
                  competitions.find(
                    (c) => c.id === filteredMatches[0].competitionId
                  )?.name || "Unknown"
                }
                style={{
                  backgroundColor:
                    competitions.find(
                      (c) => c.id === filteredMatches[0].competitionId
                    )?.color || "#ccc",
                  color: "white",
                  margin: "10px 0",
                  fontWeight: "bold",
                }}
              />
            )}

            {filteredMatches.map((match) => {
              const isLocked = new Date(match.kickoff) < new Date();

              return (
                <Grid
                  key={match.id}
                  container
                  alignItems="center"
                  spacing={1}
                  style={{
                    marginBottom: "10px",
                    borderLeft: `6px solid ${
                      competitions.find((c) => c.id === match.competitionId)
                        ?.color || "#ccc"
                    }`,
                    paddingLeft: "10px",
                    opacity: isLocked ? 0.6 : 1,
                  }}
                >
                  {isLocked && (
                    <Grid item>
                      <LockIcon style={{ color: "gray" }} />
                    </Grid>
                  )}

                  {/* Team A */}
                  <Grid item>
                    <Chip
                      label={match.teamA}
                      clickable={!isLocked}
                      onClick={() =>
                        !isLocked && handlePredictionChange(match.id, "A", 0)
                      }
                      style={{
                        backgroundColor:
                          predictions[match.id]?.team === "A"
                            ? competitions.find(
                                (c) => c.id === match.competitionId
                              )?.color || "#1976d2"
                            : "#e0e0e0",
                        color:
                          predictions[match.id]?.team === "A"
                            ? "white"
                            : "black",
                      }}
                    />
                  </Grid>

                  {/* Team B */}
                  <Grid item>
                    <Chip
                      label={match.teamB}
                      clickable={!isLocked}
                      onClick={() =>
                        !isLocked && handlePredictionChange(match.id, "B", 0)
                      }
                      style={{
                        backgroundColor:
                          predictions[match.id]?.team === "B"
                            ? competitions.find(
                                (c) => c.id === match.competitionId
                              )?.color || "#1976d2"
                            : "#e0e0e0",
                        color:
                          predictions[match.id]?.team === "B"
                            ? "white"
                            : "black",
                      }}
                    />
                  </Grid>

                  {/* Margin */}
                  <Grid item>
                    <TextField
                      type="number"
                      size="small"
                      placeholder="Margin"
                      value={predictions[match.id]?.margin || ""}
                      onChange={(e) =>
                        handlePredictionChange(
                          match.id,
                          predictions[match.id]?.team || "A",
                          parseInt(e.target.value, 10) || 0
                        )
                      }
                      disabled={isLocked}
                      style={{ width: "80px" }}
                    />
                  </Grid>
                </Grid>
              );
            })}

            {/* Submit button for this day */}
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSubmit(filteredMatches)}
              style={{ marginTop: "10px" }}
            >
              Submit Predictions
            </Button>
          </div>
        );
      })}
    </Container>
  );
}