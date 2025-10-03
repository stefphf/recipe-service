import express from "express";
import { AppDataSource } from "./data-source";
import recipeRoutes from "./routes/recipeRoutes";
import commentRoutes from "./routes/commentRoutes";
import likeRoutes from "./routes/likeRoutes";
import { connectRabbitMQ } from "./rabbitmq";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Инициализация базы данных и RabbitMQ
Promise.all([AppDataSource.initialize(), connectRabbitMQ()])
  .then(() => {
    console.log("✅ Content Service Database connected!");
    console.log("✅ Content Service RabbitMQ connected!");

    app.use("/recipes", recipeRoutes);
    app.use("/comments", commentRoutes);
    app.use("/likes", likeRoutes);

    app.get("/health", (req, res) => {
      res.json({
        status: "OK",
        service: "content-service",
        timestamp: new Date().toISOString(),
      });
    });

    app.use("*", (req, res) => {
      res.status(404).json({ message: "Route not found in content service" });
    });

    app.use(
      (
        error: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        console.error("Content Service Error:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    );

    app.listen(PORT, () => {
      console.log(`📝 Content Service running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Startup error:", error);
    process.exit(1);
  });

export default app;
