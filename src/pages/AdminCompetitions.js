

import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  TextField,
  Paper,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import api from "../api/api";

export default function AdminCompetitions() {
  const [competitions, setCompetitions] = useState([]);

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      const res = await api.get("/api/competitions");
      setCompetitions(res.data);
    } catch (err) {
      console.error("Failed to fetch competitions:", err);
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...competitions];
    updated[index][field] = value;
    setCompetitions(updated);
  };

  const handleSave = async (index) => {
    const comp = competitions[index];
    try {
      await api.post("/api/competitions/save", comp);
      fetchCompetitions();
    } catch (err) {
      console.error("Failed to save competition:", err);
    }
  };

  const handleRefresh = async (index) => {
    const comp = competitions[index];
    try {
      const res = await api.post(`/api/competitions/${comp.id}/refresh`);
      alert(res.data.message || "Competition refreshed");
      fetchCompetitions();
    } catch (err) {
      console.error("Failed to refresh competition:", err);
    }
  };

  const handleDelete = async (index) => {
    const comp = competitions[index];
    if (!window.confirm("Are you sure you want to delete this competition?")) return;
    try {
      await api.post(`/api/competitions/delete`, { id: comp.id });
      fetchCompetitions();
    } catch (err) {
      console.error("Failed to delete competition:", err);
    }
  };

  const handleAdd = () => {
    const newComp = {
      id: Date.now(),
      name: "New Competition",
      url: "",
      color: "#888",
    };
    setCompetitions([...competitions, newComp]);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Competition Feeds
      </Typography>

      {competitions.map((comp, index) => (
        <Paper
          key={comp.id}
          sx={{ padding: 2, marginBottom: 2 }}
          elevation={3}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Name"
                value={comp.name}
                onChange={(e) => handleChange(index, "name", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="Feed URL"
                value={comp.url}
                onChange={(e) => handleChange(index, "url", e.target.value)}
              />
            </Grid>
            <Grid item xs={6} sm={1}>
                <TextField
                    type="color"
                    value={c.color}
                    onChange={(e) =>
                     handleUpdateCompetition(c.id, "color", e.target.value)
                    }
                    sx={{ width: 50 }}
                />
            </Grid>
            <Grid item xs={6} sm={2}>
              <Tooltip title="Save">
                <IconButton onClick={() => handleSave(index)}>
                  <SaveIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh">
                <IconButton onClick={() => handleRefresh(index)}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton onClick={() => handleDelete(index)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Paper>
      ))}

      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleAdd}
      >
        Add Competition
      </Button>
    </div>
  );
}