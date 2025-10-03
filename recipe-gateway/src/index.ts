import express from "express";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import { authenticate } from "./middleware/auth";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

const proxyOptions: Options = {
  changeOrigin: true,
  timeout: 30000,
  proxyTimeout: 30000,
  onProxyReq(proxyReq, req) {
    if ((req as any).userId) {
      proxyReq.setHeader("X-User-Id", (req as any).userId);
    }
  },
  onError(err, _req, res) {
    console.error("Proxy error:", err);
    (res as any)
      .status(500)
      .json({ message: "Service temporarily unavailable" });
  },
};

app.use(
  "/api/auth",
  createProxyMiddleware({
    ...proxyOptions,
    target: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
    pathRewrite: { "^/api/auth": "/auth" },
  })
);

app.use(
  "/api/users",
  authenticate,
  createProxyMiddleware({
    ...proxyOptions,
    target: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
    pathRewrite: { "^/api/users": "/users" },
  })
);

app.use(
  "/api/recipes",
  authenticate,
  createProxyMiddleware({
    ...proxyOptions,
    target: process.env.CONTENT_SERVICE_URL || "http://localhost:3002",
    pathRewrite: { "^/api/recipes": "/recipes" },
  })
);
app.use(
  "/api/comments",
  authenticate,
  createProxyMiddleware({
    ...proxyOptions,
    target: process.env.CONTENT_SERVICE_URL || "http://localhost:3002",
    pathRewrite: { "^/api/comments": "/comments" },
  })
);
app.use(
  "/api/likes",
  authenticate,
  createProxyMiddleware({
    ...proxyOptions,
    target: process.env.CONTENT_SERVICE_URL || "http://localhost:3002",
    pathRewrite: { "^/api/likes": "/likes" },
  })
);

app.use(
  "/api/saved-recipes",
  authenticate,
  createProxyMiddleware({
    ...proxyOptions,
    target: process.env.INTERACTION_SERVICE_URL || "http://localhost:3003",
    pathRewrite: { "^/api/saved-recipes": "/saved-recipes" },
  })
);
app.use(
  "/api/subscriptions",
  authenticate,
  createProxyMiddleware({
    ...proxyOptions,
    target: process.env.INTERACTION_SERVICE_URL || "http://localhost:3003",
    pathRewrite: { "^/api/subscriptions": "/subscriptions" },
  })
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    service: "api-gateway",
    time: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on http://localhost:${PORT}`);
});
