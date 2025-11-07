// src/pages/AdminUsers.js
import React, { useState, useEffect } from "react";
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, TextField, IconButton, Checkbox, Tooltip, Button
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SearchIcon from "@mui/icons-material/Search";
import { apiFetch } from "../api/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [newUser, setNewUser] = useState({ firstname: "", surname: "", email: "", isAdmin: false });

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    const data = await apiFetch("/users");
    setUsers(data);
  };

  const handleAddUser = async () => {
    if (!newUser.firstname || !newUser.surname || !newUser.email) return;
    const res = await apiFetch("/users", {
      method: "POST",
      body: JSON.stringify(newUser),
    });
    if (res?.error) {
      alert(`❌ ${res.error}`);
    } else {
      setNewUser({ firstname: "", surname: "", email: "", isAdmin: false });
      loadUsers();
    }
  };

  const handleUpdateUser = (id, field, value) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, [field]: value } : u));
  };

  const saveUser = async (u) => {
    await apiFetch(`/users/${u.id}`, {
      method: "PUT",
      body: JSON.stringify(u),
    });
  };

  const deleteUser = async (id) => {
    await apiFetch(`/users/${id}`, { method: "DELETE" });
    loadUsers();
  };

  const forceLogout = async () => {
    await apiFetch("/admin/force-logout", { method: "POST" });
    alert("✅ All users logged out.");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Admin Users</Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField label="Firstname" value={newUser.firstname} onChange={(e) => setNewUser({ ...newUser, firstname: e.target.value })} />
        <TextField label="Surname" value={newUser.surname} onChange={(e) => setNewUser({ ...newUser, surname: e.target.value })} />
        <TextField label="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
        <Checkbox checked={newUser.isAdmin} onChange={(e) => setNewUser({ ...newUser, isAdmin: e.target.checked })} />
        <IconButton onClick={handleAddUser}><AddIcon /></IconButton>
      </Box>

      <Button onClick={forceLogout} variant="outlined" color="error" startIcon={<ExitToAppIcon />}>
        Force logout all users
      </Button>

      <Box sx={{ mt: 3, mb: 2 }}>
        <TextField
          placeholder="Search users..."
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
        />
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Firstname</TableCell>
            <TableCell>Surname</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Admin</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users
            .filter((u) =>
              [u.firstname, u.surname, u.email].some(f =>
                f.toLowerCase().includes(userSearch.toLowerCase()))
            )
            .map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <TextField value={u.firstname} onChange={(e) => handleUpdateUser(u.id, "firstname", e.target.value)} />
                </TableCell>
                <TableCell>
                  <TextField value={u.surname} onChange={(e) => handleUpdateUser(u.id, "surname", e.target.value)} />
                </TableCell>
                <TableCell>
                  <TextField value={u.email} onChange={(e) => handleUpdateUser(u.id, "email", e.target.value)} />
                </TableCell>
                <TableCell>
                  <Checkbox checked={u.isAdmin} onChange={(e) => handleUpdateUser(u.id, "isAdmin", e.target.checked)} />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Save">
                    <IconButton onClick={() => saveUser(u)}><SaveIcon color="success" /></IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => deleteUser(u.id)}><DeleteIcon color="error" /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export default AdminUsers;