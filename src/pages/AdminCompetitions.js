import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import { apiFetch } from "../api/api";

export default function AdminCompetitions() {
  const [competitions, setCompetitions] = useState([]);
  const [newName, setNewName] = useState("");
  const [newFeed, setNewFeed] = useState("");
  const [newColor, setNewColor] = useState("#888888");

  const fetchCompetitions = async () => {
    try {
      const res = await apiFetch("/competitions");
      setCompetitions(res);
    } catch (err) {
      console.error("Failed to fetch competitions:", err);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const handleUpdateCompetition = async (updated) => {
    try {
      await apiFetch(`/competitions/${updated.id}`, {
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
      await apiFetch(`/competitions/${id}`, { method: "DELETE" });
      fetchCompetitions();
    } catch (err) {
      console.error("Failed to delete competition:", err);
    }
  };

  const handleRefreshCompetition = async (id) => {
    try {
      await apiFetch(`/competitions/${id}/refresh`);
      fetchCompetitions();
    } catch (err) {
      console.error("Failed to refresh competition:", err);
    }
  };

  const handleAddCompetition = async () => {
    try {
      await apiFetch("/competitions", {
        method: "POST",
        body: JSON.stringify({ name: newName, url: newFeed, color: newColor }),
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
        Competitions Admin
      </Typography>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Competitions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {competitions.map((c) => (
            <Box
              key={c.id}
              sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
            >
              <TextField
                label="Name"
                value={c.name}
                onChange={(e) =>
                  setCompetitions((prev) =>
                    prev.map((comp) =>
                      comp.id === c.id ? { ...comp, name: e.target.value } : comp
                    )
                  )
                }
              />
              <TextField
                label="Feed URL"
                value={c.feedUrl}
                onChange={(e) =>
                  setCompetitions((prev) =>
                    prev.map((comp) =>
                      comp.id === c.id ? { ...comp, feedUrl: e.target.value } : comp
                    )
                  )
                }
                sx={{ flex: 1 }}
              />
              <TextField
                label="Color"
                type="color"
                value={c.color || "#888888"}
                onChange={(e) =>
                  setCompetitions((prev) =>
                    prev.map((comp) =>
                      comp.id === c.id ? { ...comp, color: e.target.value } : comp
                    )
                  )
                }
              />
              <IconButton onClick={() => handleUpdateCompetition(c)}>
                <SaveIcon />
              </IconButton>
              <IconButton onClick={() => handleRefreshCompetition(c.id)}>
                <RefreshIcon />
              </IconButton>
              <IconButton onClick={() => handleDeleteCompetition(c.id)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          {/* Add new competition */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 4 }}>
            <TextField
              label="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <TextField
              label="Feed URL"
              value={newFeed}
              onChange={(e) => setNewFeed(e.target.value)}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Color"
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
            />
            <IconButton onClick={handleAddCompetition}>
              <AddIcon />
            </IconButton>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}