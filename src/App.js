// src/App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";
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
import AdminPage from "./pages/AdminPage";

import { UserProvider, useUser } from "./context/UserContext"; // ✅ FIXED
import { API_BASE_URL } from "./api/api";

// ✅ Protected route wrapper
function ProtectedRoute({ children, requireAdmin = false }) {
  const { user } = useUser(); // ✅ FIXED

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppContent() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [pageTitle, setPageTitle] = useState("Matches");

  const { user, setUser } = useUser(); // ✅ FIXED
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // ✅ Logout function
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ✅ Build menu items dynamically
  const menuItems = [
    { text: "Matches", path: "/", title: "Matches" },
    { text: "Leaderboard", path: "/leaderboard", title: "Leaderboard" },
  ];

  if (!user) {
    menuItems.push({ text: "Login", path: "/login", title: "Login" });
  } else {
    menuItems.push(
      { text: "My predictions", path: "/mypredictions", title: "My predictions" },
      { text: "Profile", path: "/profile", title: "Profile" }
    );
    if (user.isAdmin) {
      menuItems.push({ text: "Admin", path: "/admin", title: "Admin" });
    }
    menuItems.push({ text: "Logout", action: handleLogout });
  }

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
            component={item.path ? Link : "button"}
            to={item.path || undefined}
            onClick={() => {
              if (item.action) {
                item.action();
              } else {
                setPageTitle(item.title);
                setMobileOpen(false);
              }
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
      <Box component="nav" sx={{ width: 240, flexShrink: 0 }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
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
          <Route
            path="/mypredictions"
            element={
              <ProtectedRoute>
                <MyPredictionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<UserLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

export default App;