// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  Divider,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SportsRugbyIcon from "@mui/icons-material/SportsRugby";

import MatchesPage from "./pages/MatchesPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import MyPredictionsPage from "./pages/MyPredictionsPage";
import UserProfile from "./pages/UserProfile";
import UserLogin from "./pages/UserLogin";
import AdminCompetitions from "./pages/AdminCompetitions";
import AdminMatches from "./pages/AdminMatches";
import AdminPredictions from "./pages/AdminPredictions";
import AdminUsers from "./pages/AdminUsers";


import { UserProvider, useUser } from "./context/UserContext";
import { API_BASE_URL } from "./api/api";

function AppContent() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [pageTitle, setPageTitle] = useState("Matches");

  const { user, logout } = useUser();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // ✅ Drawer navigation items (switch Login/Logout dynamically)
  const menuItems = [
    { text: "Matches", path: "/", title: "Matches" },
    { text: "Leaderboard", path: "/leaderboard", title: "Leaderboard" }, 
        ...(user
      ? [
          { text: "My predictions", path: "/mypredictions", title: "My predictions" },
          { text: "Profile", path: "/profile", title: "Profile" },
          ...(user.isAdmin
            ? [
              { text: "Admin Competitions", path: "/adminCompetitions", title: "Admin  Competitions" },
              { text: "Admin Matches", path: "/adminMatches", title: "Admin Matches" },
              { text: "Admin Predictions", path: "/adminPredictions", title: "Admin Predictions" },
              { text: "Admin Users", path: "/adminUsers", title: "Admin Users" },
            ]
            : []),
          { text: "Logout", action: logout }, // ✅ logout wired
        ]
      : [{ text: "Login", path: "/login", title: "Login" }]),
  ];

  // ✅ Backend health check
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/health`);
        if (res.ok) {
          setBackendStatus("online");
          console.log(`✅ Backend reachable at: ${API_BASE_URL}`);
        } else {
          setBackendStatus("offline");
          console.warn(`⚠️ Backend returned error at: ${API_BASE_URL}`);
        }
      } catch (err) {
        setBackendStatus("offline");
        console.error(`❌ Backend not reachable at: ${API_BASE_URL}`, err);
      }
    };

    checkBackend();
  }, []);

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={item.path ? "a" : "button"}
            href={item.path || undefined}
            onClick={() => {
              if (item.action) item.action(); // ✅ trigger logout
              if (item.title) setPageTitle(item.title);
              setMobileOpen(false);
            }}
          >
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* Top AppBar */}
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <SportsRugbyIcon sx={{ mr: 1 }} />
          <Typography variant="h6" noWrap>
            {pageTitle}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {/* ✅ Backend Status Indicator */}
          <Tooltip title={`Backend status: ${backendStatus}`}>
            <Typography
              variant="body2"
              sx={{
                color:
                  backendStatus === "online"
                    ? "lightgreen"
                    : backendStatus === "offline"
                    ? "red"
                    : "orange",
              }}
            >
              {backendStatus === "online"
                ? "Backend online"
                : backendStatus === "offline"
                ? "Backend offline"
                : "Checking..."}
            </Typography>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: 240 }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="temporary" // ✅ toggleable even on desktop
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Routes>
          <Route path="/" element={<MatchesPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/mypredictions" element={<MyPredictionsPage />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/adminCompetitions" element={<AdminCompetitions />} />
          <Route path="/adminMatches" element={<AdminMatches />} />
          <Route path="/adminPredictions" element={<AdminPredictions />} />
          <Route path="/adminUsers" element={<AdminUsers />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}