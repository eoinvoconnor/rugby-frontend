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
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import { apiFetch } from "../api/api";

export default function AdminCompetitions() {
  const [competitions, setCompetitions] = useState([]);
  const [newName, setNewName] = useState("");
  const [newFeed, setNewFeed] = useState("");
  const [newColor, setNewColor] = useState("#888888");
  const [showArchived, setShowArchived] = useState(false);

  const fetchCompetitions = async () => {
    try {
      const data = await apiFetch("/api/competitions");
      setCompetitions(data);
    } catch (err) {
      console.error("Failed to fetch competitions:", err);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const handleUpdateCompetition = async (updated) => {
    try {
      await apiFetch(`/api/competitions/${updated.id}`, {
        method: "PUT",
        body: JSON.stringify(updated),
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
      await apiFetch(`/api/competitions/${id}/refresh`);
      fetchCompetitions();
    } catch (err) {
      console.error("Failed to refresh competition:", err);
    }
  };

  const handleAddCompetition = async () => {
    try {
      await apiFetch("/api/competitions", {
        method: "POST",
        body: JSON.stringify({
          name: newName,
          feedUrl: newFeed,
          color: newColor,
        }),
      });
      setNewName("");
      setNewFeed("");
      setNewColor("#888888");
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
          <Button
            variant="outlined"
            onClick={() => setShowArchived(!showArchived)}
            sx={{ mb: 2 }}
          >
            {showArchived ? "Hide Archived" : "Show Archived"}
          </Button>
          {competitions
            .filter((c) => (showArchived ? true : !c.archived))
            .map((c) => (
              <Box
                key={c.id}
                sx={{
                  display: "flex",
                  gap: 2,
                  mb: 1,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <TextField
                  label="Name"
                  value={c.name}
                  onChange={(e) =>
                    setCompetitions((prev) =>
                      prev.map((comp) =>
                        comp.id === c.id
                          ? { ...comp, name: e.target.value }
                          : comp
                      )
                    )
                  }
                />
                <TextField
                  label="Feed"
                  value={c.feedUrl}
                  fullWidth
                  onChange={(e) =>
                    setCompetitions((prev) =>
                      prev.map((comp) =>
                        comp.id === c.id
                          ? { ...comp, feedUrl: e.target.value }
                          : comp
                      )
                    )
                  }
                />
                <input
                  type="color"
                  value={c.color || "#888888"}
                  onChange={(e) =>
                    setCompetitions((prev) =>
                      prev.map((comp) =>
                        comp.id === c.id
                          ? { ...comp, color: e.target.value }
                          : comp
                      )
                    )
                  }
                />
                <Tooltip title="Save">
                  <IconButton onClick={() => handleUpdateCompetition(c)}>
                    <SaveIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton onClick={() => handleDeleteCompetition(c.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Refresh feed">
                  <IconButton onClick={() => handleRefreshCompetition(c.id)}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
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
              label="Competition Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <TextField
              label="Feed URL"
              value={newFeed}
              fullWidth
              onChange={(e) => setNewFeed(e.target.value)}
            />
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
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