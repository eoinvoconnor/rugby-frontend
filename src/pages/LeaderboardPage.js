import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Stack,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import apiFetch from "../api/api"; // ✅ fixed import

function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [selectedComp, setSelectedComp] = useState("ALL");

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    try {
      const comps = await apiFetch("/api/competitions");
      setCompetitions(comps);

      const board = await apiFetch("/api/leaderboard");
      setLeaderboard(board);
    } catch (err) {
      console.error("❌ Failed to load leaderboard:", err);
    }
  }

  const filteredBoard = leaderboard.filter(
    (entry) => selectedComp === "ALL" || entry.competition === selectedComp
  );

  return (
    <Container sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Leaderboard
      </Typography>

      {/* 📌 Competition Filters */}
      <Stack
        direction="row"
        spacing={1}
        mb={2}
        flexWrap="wrap"
        justifyContent="center"
      >
        <ToggleButtonGroup
          value={selectedComp}
          exclusive
          onChange={(e, val) => val && setSelectedComp(val)}
        >
          <ToggleButton value="ALL">ALL</ToggleButton>
          {competitions.map((c) => (
            <ToggleButton key={c.id} value={c.name}>
              <Chip
                label={c.name}
                sx={{
                  bgcolor: selectedComp === c.name ? "grey.500" : c.color,
                  color: "white",
                }}
              />
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      {/* 📋 Leaderboard Table */}
      <TableContainer component={Paper}>
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
            {filteredBoard.map((entry, idx) => (
              <TableRow key={entry.userId}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{entry.userName}</TableCell>
                <TableCell>{entry.points}</TableCell>
                <TableCell>
                  {entry.accuracy ? `${entry.accuracy.toFixed(1)}%` : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default LeaderboardPage;