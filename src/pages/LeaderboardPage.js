// src/pages/LeaderboardPage.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Stack,
  Chip,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { apiFetch } from "../api/api";

function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState("ALL");
  const [previousLeaderboard, setPreviousLeaderboard] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const comps = await apiFetch("/api/competitions");
      setCompetitions(comps);

      const data = await apiFetch("/api/leaderboard");
      setLeaderboard(data);
    } catch (err) {
      console.error("❌ Failed to load leaderboard:", err);
    }
  }

  // Apply competition filter
  const filteredLeaderboard = leaderboard
    .map((entry) => {
      if (selectedCompetition === "ALL") {
        return {
          ...entry,
          earned: entry.earned,
          submitted: entry.submitted,
          accuracy: entry.accuracy,
        };
      } else {
        const compStats = entry.competitions.find(
          (c) => c.competitionId === selectedCompetition
        );
        return {
          ...entry,
          earned: compStats?.earned || 0,
          submitted: compStats?.submitted || 0,
          accuracy: compStats?.accuracy || 0,
        };
      }
    })
    .sort((a, b) => b.earned - a.earned);

  // Track movement arrows
  const withMovement = filteredLeaderboard.map((entry, index) => {
    const prevIndex = previousLeaderboard.findIndex(
      (prev) => prev.user === entry.user
    );
    let movement = 0;
    if (prevIndex !== -1) {
      movement = prevIndex - index; // positive = moved up
    }
    return { ...entry, rank: index + 1, movement };
  });

  useEffect(() => {
    if (filteredLeaderboard.length > 0) {
      setPreviousLeaderboard(
        filteredLeaderboard.map((entry, idx) => ({
          user: entry.user,
          rank: idx + 1,
        }))
      );
    }
  }, [selectedCompetition, leaderboard]);

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
        </Stack>
      </Paper>

      {/* 🔹 Leaderboard Table */}
      <Paper sx={{ p: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Player</TableCell>
              <TableCell>Points</TableCell>
              <TableCell>Accuracy %</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {withMovement.map((entry) => (
              <TableRow key={entry.user}>
                <TableCell>
                  {entry.rank}
                  {entry.movement > 0 && (
                    <ArrowDropUpIcon sx={{ color: "green" }} />
                  )}
                  {entry.movement < 0 && (
                    <ArrowDropDownIcon sx={{ color: "red" }} />
                  )}
                </TableCell>
                <TableCell>{entry.user}</TableCell>
                <TableCell>{entry.earned}</TableCell>
                <TableCell>{entry.accuracy}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}

export default LeaderboardPage;