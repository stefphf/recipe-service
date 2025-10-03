import express from "express";
import { AppDataSource } from "./data-source";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import { connectRabbitMQ } from "./rabbitmq";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Инициализация базы данных
AppDataSource.initialize()
  .then(async () => {
    console.log("✅ Auth Service Database connected!");

    // Пытаемся подключиться к RabbitMQ, но не блокируем запуск
    try {
      await connectRabbitMQ();
      console.log("✅ Auth Service RabbitMQ connected!");
    } catch (error) {
      console.log("⚠️ RabbitMQ not available, continuing without events...");
    }

    app.use("/auth", authRoutes);
    app.use("/users", userRoutes);

    app.get("/health", (req, res) => {
      res.json({
        status: "OK",
        service: "auth-service",
        timestamp: new Date().toISOString(),
      });
    });

    app.use("*", (req, res) => {
      res.status(404).json({ message: "Route not found in auth service" });
    });

    app.listen(PORT, () => {
      console.log(`🔑 Auth Service running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Database connection error:", error);
    process.exit(1);
  });

export default app;
