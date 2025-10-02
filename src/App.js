// src/App.js
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import MatchesPage from "./pages/MatchesPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import MyPredictionsPage from "./pages/MyPredictionsPage";
import AdminPage from "./pages/AdminPage";
import UserLogin from "./pages/UserLogin";
import UserProfile from "./pages/UserProfile";
import { useUser } from "./context/UserContext";

// ✅ Map routes → natural page titles
const pageTitles = {
  "/": "Matches",
  "/matches": "Matches",
  "/leaderboard": "Leaderboard",
  "/mypredictions": "My predictions",
  "/profile": "Profile",
  "/login": "Login",
  "/admin": "Admin",
};

function App() {
  const { user, isAdmin, setUser } = useUser();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [backendUrl, setBackendUrl] = useState("");
  const [backendStatus, setBackendStatus] = useState("checking");

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Dynamic page title
  const pageTitle = pageTitles[location.pathname] || "Rugby Predictions";

  // ✅ Update browser tab title
  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  // ✅ Restore login on startup
  useEffect(() => {
    const savedUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user"));

    if (savedUser && !user) {
      setUser(savedUser);
      console.log("🔑 Restored user session:", savedUser.email);
    }
  }, [user, setUser]);

  // ✅ Backend connectivity check
useEffect(() => {
  const url = process.env.REACT_APP_API_URL || "http://localhost:5001/api";  // ✅ match api.js
  setBackendUrl(url);

  const checkBackend = async () => {
    try {
      const res = await fetch(`${url}/hello`);
      if (res.ok) {
        setBackendStatus("online");
        console.log(`✅ Backend reachable at: ${url}`);
      } else {
        setBackendStatus("offline");
        console.warn(`⚠️ Backend returned error at: ${url}`);
      }
    } catch (err) {
      setBackendStatus("offline");
      console.error(`❌ Backend not reachable at: ${url}`, err);
    }
  };

  checkBackend();
}, []);

  

  // ✅ Logout handler
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    setDrawerOpen(false);
    navigate("/login");
  };

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      {/* Persistent TopBar */}
      <AppBar position="sticky">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {pageTitle}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List onClick={() => setDrawerOpen(false)}>
          <ListItem button component={Link} to="/matches">
            <ListItemText primary="Matches" />
          </ListItem>
          <ListItem button component={Link} to="/leaderboard">
            <ListItemText primary="Leaderboard" />
          </ListItem>
          <ListItem button component={Link} to="/mypredictions">
            <ListItemText primary="My predictions" />
          </ListItem>

          {/* Only visible after login */}
          {user && (
            <ListItem button component={Link} to="/profile">
              <ListItemText primary="Profile" />
            </ListItem>
          )}

          {/* Admin only */}
          {isAdmin && (
            <ListItem button component={Link} to="/admin">
              <ListItemText primary="Admin" />
            </ListItem>
          )}

          {/* Login / Logout toggle */}
          {user ? (
            <ListItem button onClick={handleLogout}>
              <ListItemText primary="Logout" />
            </ListItem>
          ) : (
            <ListItem button component={Link} to="/login">
              <ListItemText primary="Login" />
            </ListItem>
          )}
        </List>
      </Drawer>

      {/* Main content */}
      <Box flex="1">
        <Routes>
          <Route path="/" element={<MatchesPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/mypredictions" element={<MyPredictionsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/login" element={<UserLogin />} />
        </Routes>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor:
            backendStatus === "online"
              ? "success.main"
              : backendStatus === "offline"
              ? "error.main"
              : "warning.main",
          color: "white",
          p: 1,
          textAlign: "center",
          fontSize: "0.8rem",
        }}
      >
        {backendStatus === "checking" && "🔄 Checking backend..."}
        {backendStatus === "online" && `🟢 Connected to backend: ${backendUrl}`}
        {backendStatus === "offline" && `🔴 Backend not reachable: ${backendUrl}`}
      </Box>
    </Box>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}