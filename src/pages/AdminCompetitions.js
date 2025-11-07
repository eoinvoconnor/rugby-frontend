import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  IconButton,
  MenuItem,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import { apiFetch } from "../api/api";
import ColorPicker from "../components/ColorPicker";

export default function AdminCompetitions() {
  const [competitions, setCompetitions] = useState([]);
  const [newComp, setNewComp] = useState({ name: "", color: "#888888", icsUrl: "" });

  const fetchCompetitions = async () => {
    try {
      const res = await apiFetch("/api/competitions");
      setCompetitions(res);
    } catch (err) {
      console.error("Failed to fetch competitions:", err);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const handleUpdateCompetition = async (updatedComp) => {
    try {
      await apiFetch(`/api/competitions/${updatedComp.id}`, {
        method: "PUT",
        body: JSON.stringify(updatedComp),
      });
      fetchCompetitions();
    } catch (err) {
      console.error("Failed to update competition:", err);
    }
  };

  const handleDeleteCompetition = async (id) => {
    try {
      await apiFetch(`/api/competitions/${id}`, { method: "DELETE" });
      fetchCompetitions();
    } catch (err) {
      console.error("Failed to delete competition:", err);
    }
  };

  const handleRefreshCompetition = async (id) => {
    try {
      await apiFetch(`/api/competitions/${id}/refresh`, { method: "POST" });
      fetchCompetitions();
    } catch (err) {
      console.error("Failed to refresh competition:", err);
    }
  };

  const handleAddCompetition = async () => {
    if (!newComp.name || !newComp.icsUrl) return;
    try {
      await apiFetch("/api/competitions", {
        method: "POST",
        body: JSON.stringify(newComp),
      });
      setNewComp({ name: "", color: "#888888", icsUrl: "" });
      fetchCompetitions();
    } catch (err) {
      console.error("Failed to add competition:", err);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Competition Admin
      </Typography>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Competitions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {competitions.map((c) => (
            <Box key={c.id} sx={{ mb: 2, p: 2, border: "1px solid #ccc", borderRadius: 1 }}>
              <TextField
                label="Name"
                value={c.name}
                onChange={(e) => setCompetitions(prev => prev.map(comp => comp.id === c.id ? { ...comp, name: e.target.value } : comp))}
                sx={{ mr: 2, width: 200 }}
              />
              <TextField
                label="ICS URL"
                value={c.icsUrl || ""}
                onChange={(e) => setCompetitions(prev => prev.map(comp => comp.id === c.id ? { ...comp, icsUrl: e.target.value } : comp))}
                sx={{ mr: 2, width: 400 }}
              />
              <ColorPicker
                value={c.color || "#888888"}
                onChange={(color) => setCompetitions(prev => prev.map(comp => comp.id === c.id ? { ...comp, color } : comp))}
              />
              <IconButton onClick={() => handleUpdateCompetition(c)}><SaveIcon /></IconButton>
              <IconButton onClick={() => handleRefreshCompetition(c.id)}><RefreshIcon /></IconButton>
              <IconButton onClick={() => handleDeleteCompetition(c.id)}><DeleteIcon /></IconButton>
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Add New Competition</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <TextField
              label="Name"
              value={newComp.name}
              onChange={(e) => setNewComp({ ...newComp, name: e.target.value })}
            />
            <TextField
              label="ICS URL"
              value={newComp.icsUrl}
              onChange={(e) => setNewComp({ ...newComp, icsUrl: e.target.value })}
              sx={{ width: 400 }}
            />
            <ColorPicker
              value={newComp.color}
              onChange={(color) => setNewComp({ ...newComp, color })}
            />
            <Button variant="contained" onClick={handleAddCompetition}>
              Add
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}