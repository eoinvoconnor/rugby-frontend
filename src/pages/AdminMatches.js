import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DataGrid } from "@mui/x-data-grid";
import { apiFetch } from "../api/api";
import dayjs from "dayjs";

export default function AdminMatches() {
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const matchRes = await apiFetch("/matches");
      const predRes = await apiFetch("/api/predictions?all=1");
      setMatches(matchRes);
      setPredictions(predRes);
    };
    fetchData();
  }, []);

  const handleCellEditCommit = async (params) => {
    const { id, field, value } = params;
    const updated = matches.map((m) =>
      m.id === id ? { ...m, result: { ...m.result, [field]: value } } : m
    );
    setMatches(updated);
    try {
      await apiFetch(`/matches/${id}`, {
        method: "PUT",
        body: JSON.stringify(updated.find((m) => m.id === id)),
      });
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const columns = [
    {
      field: "kickoff",
      headerName: "Date",
      width: 180,
      valueGetter: (params) => dayjs(params.row.kickoff).format("YYYY-MM-DD HH:mm"),
      sortComparator: (v1, v2) => new Date(v1) - new Date(v2),
    },
    { field: "competitionName", headerName: "Competition", width: 160 },
    { field: "teamA", headerName: "Team A", width: 160 },
    { field: "teamB", headerName: "Team B", width: 160 },
    {
      field: "winner",
      headerName: "Winner",
      width: 120,
      editable: true,
      valueGetter: (params) => params.row.result?.winner || "",
    },
    {
      field: "margin",
      headerName: "Margin",
      width: 100,
      editable: true,
      type: "number",
      valueGetter: (params) => params.row.result?.margin || "",
    },
    {
      field: "predictionCount",
      headerName: "Predictions",
      width: 120,
      valueGetter: (params) =>
        predictions.filter((p) => p.matchId === params.row.id).length,
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Match Admin
      </Typography>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Matches</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ height: 800, width: "100%" }}>
            <DataGrid
              rows={matches}
              columns={columns}
              getRowId={(row) => row.id}
              pageSize={25}
              rowsPerPageOptions={[25]}
              disableSelectionOnClick
              onCellEditCommit={handleCellEditCommit}
              initialState={{
                sorting: {
                  sortModel: [{ field: "kickoff", sort: "asc" }],
                },
              }}
            />
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}