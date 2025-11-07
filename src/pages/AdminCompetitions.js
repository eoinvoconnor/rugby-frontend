import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { apiFetch } from "../api/api";

export default function AdminCompetitions() {
  const [competitions, setCompetitions] = useState([]);
  const [newCompetition, setNewCompetition] = useState({
    name: "",
    feedUrl: "",
    color: "#888888",
  });

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

  const handleUpdateCompetition = async (comp) => {
    try {
      await apiFetch(`/api/competitions/${comp.id}`, {
        method: "PUT",
        body: JSON.stringify(comp),
      });
      fetchCompetitions();
    } catch (err) {
      console.error("Failed to update competition:", err);
    }
  };

  const handleDeleteCompetition = async (id) => {
    try {
      await apiFetch(`/api/competitions/${id}`, {
        method: "DELETE",
      });
      fetchCompetitions();
    } catch (err) {
      console.error("Failed to delete competition:", err);
    }
  };

  const handleRefreshCompetition = async (id) => {
    try {
      await apiFetch(`/api/competitions/${id}/refresh`, {
        method: "POST",
      });
      fetchCompetitions();
    } catch (err) {
      console.error("Failed to refresh competition:", err);
    }
  };

  const handleAddCompetition = async () => {
    try {
      await apiFetch("/api/competitions", {
        method: "POST",
        body: JSON.stringify(newCompetition),
      });
      setNewCompetition({ name: "", feedUrl: "", color: "#888888" });
      fetchCompetitions();
    } catch (err) {
      console.error("Failed to add competition:", err);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Competitions
      </Typography>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Competitions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {competitions.map((c) => (
            <Box key={c.id} sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
              <TextField
                label="Name"
                value={c.name}
                onChange={(e) => handleUpdateCompetition({ ...c, name: e.target.value })}
              />
              <TextField
                label="Feed URL"
                value={c.feedUrl}
                onChange={(e) => handleUpdateCompetition({ ...c, feedUrl: e.target.value })}
                fullWidth
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <input
                  type="color"
                  value={c.color}
                  onChange={(e) => handleUpdateCompetition({ ...c, color: e.target.value })}
                />
                <TextField
                  label="Hex"
                  value={c.color}
                  onChange={(e) => handleUpdateCompetition({ ...c, color: e.target.value })}
                  sx={{ width: 100 }}
                />
              </Box>
              <IconButton onClick={() => handleRefreshCompetition(c.id)}><RefreshIcon /></IconButton>
              <IconButton onClick={() => handleUpdateCompetition(c)}><SaveIcon /></IconButton>
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
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              label="Name"
              value={newCompetition.name}
              onChange={(e) => setNewCompetition({ ...newCompetition, name: e.target.value })}
            />
            <TextField
              label="Feed URL"
              value={newCompetition.feedUrl}
              onChange={(e) => setNewCompetition({ ...newCompetition, feedUrl: e.target.value })}
              fullWidth
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <input
                type="color"
                value={newCompetition.color}
                onChange={(e) => setNewCompetition({ ...newCompetition, color: e.target.value })}
              />
              <TextField
                label="Hex"
                value={newCompetition.color}
                onChange={(e) => setNewCompetition({ ...newCompetition, color: e.target.value })}
                sx={{ width: 100 }}
              />
            </Box>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddCompetition}>
              Add
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}