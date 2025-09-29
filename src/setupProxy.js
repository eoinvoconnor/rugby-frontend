const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // Default port
  const DEFAULT_PORT = 5000;

  // If you started backend on another port, 
  // it prints "🚀 Server running on port X"
  // so we'll let you override with BACKEND_PORT env variable if needed
  const backendPort = process.env.BACKEND_PORT || DEFAULT_PORT;

  app.use(
    "/api",
    createProxyMiddleware({
      target: `http://localhost:${backendPort}`,
      changeOrigin: true,
    })
  );
};
