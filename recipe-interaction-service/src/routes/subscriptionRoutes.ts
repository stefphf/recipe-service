import { Router } from "express";
import {
  createSubscription,
  getSubscriptionById,
  deleteSubscription,
  deleteSubscriptionByUser,
  checkSubscription,
  getFollowers,
  getFollowing,
} from "../controllers/subscriptionController";
import { authenticate } from "../middleware/auth";

const subscriptionRouter = Router();

subscriptionRouter.post("/", authenticate, createSubscription);
subscriptionRouter.get("/:id", getSubscriptionById);
subscriptionRouter.delete("/:id", authenticate, deleteSubscription);
subscriptionRouter.delete(
  "/user/:followed_id",
  authenticate,
  deleteSubscriptionByUser
);
subscriptionRouter.get("/followers/:user_id", getFollowers);
subscriptionRouter.get("/following/:user_id", getFollowing);
subscriptionRouter.get("/check/:followed_id", authenticate, checkSubscription);

export default subscriptionRouter;
