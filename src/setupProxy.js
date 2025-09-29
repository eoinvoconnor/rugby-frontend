const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // Local backend for development
  const LOCAL_BACKEND = "http://localhost:5000";

  // Remote backend (your deployed API)
  const REMOTE_BACKEND = "https://rugby-backend.onrender.com"; // ⬅️ Replace if needed

  // Pick target based on environment
  const target =
    process.env.NODE_ENV === "production" ? REMOTE_BACKEND : LOCAL_BACKEND;

  app.use(
    "/api",
    createProxyMiddleware({
      target,
      changeOrigin: true,
    })
  );
};