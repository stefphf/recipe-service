import express from "express";
import { AppDataSource } from "./data-source";
import savedRecipeRoutes from "./routes/savedRecipeRoutes";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import { connectRabbitMQ } from "./rabbitmq";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

// Инициализация базы данных и RabbitMQ
Promise.all([AppDataSource.initialize(), connectRabbitMQ()])
  .then(() => {
    console.log("✅ Interaction Service Database connected!");
    console.log("✅ Interaction Service RabbitMQ connected!");

    app.use("/saved-recipes", savedRecipeRoutes);
    app.use("/subscriptions", subscriptionRoutes);

    app.get("/health", (req, res) => {
      res.json({
        status: "OK",
        service: "interaction-service",
        timestamp: new Date().toISOString(),
      });
    });

    app.use("*", (req, res) => {
      res
        .status(404)
        .json({ message: "Route not found in interaction service" });
    });

    app.use(
      (
        error: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        console.error("Interaction Service Error:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    );

    app.listen(PORT, () => {
      console.log(`💬 Interaction Service running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Startup error:", error);
    process.exit(1);
  });

export default app;
