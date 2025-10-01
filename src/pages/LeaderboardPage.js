// src/pages/LeaderboardPage.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Chip,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
} from "@mui/material";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { apiFetch } from "../api/api"; // ✅ fixed import

function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [previous, setPrevious] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const comps = await apiFetch("/competitions");
      setCompetitions(comps);

      const board = await apiFetch("/leaderboard");
      setLeaderboard(board);
    } catch (err) {
      console.error("❌ Failed to load leaderboard:", err);
    }
  }

  const filteredBoard =
    filter === "ALL"
      ? leaderboard
      : leaderboard.map((user) => ({
          ...user,
          points: user.pointsByComp?.[filter] || 0,
          accuracy: user.accuracyByComp?.[filter] || 0,
        }));

  return (
    <Container sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Leaderboard
      </Typography>

      {/* 📌 Competition Filter */}
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

      {/* 📋 Leaderboard Table */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>User</TableCell>
              <TableCell align="right">Points</TableCell>
              <TableCell align="right">% Accuracy</TableCell>
              <TableCell align="center">Trend</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBoard
              .sort((a, b) => b.points - a.points)
              .map((row, index) => {
                const prevRank = previous.findIndex((u) => u.user === row.user);
                let trend = null;
                if (prevRank !== -1) {
                  if (prevRank > index) trend = "up";
                  else if (prevRank < index) trend = "down";
                }

                return (
                  <TableRow key={row.user}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.user}</TableCell>
                    <TableCell align="right">{row.points}</TableCell>
                    <TableCell align="right">
                      {row.accuracy?.toFixed(1) || 0}%
                    </TableCell>
                    <TableCell align="center">
                      {trend === "up" && (
                        <ArrowDropUpIcon sx={{ color: "green" }} />
                      )}
                      {trend === "down" && (
                        <ArrowDropDownIcon sx={{ color: "red" }} />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}

export default LeaderboardPage;