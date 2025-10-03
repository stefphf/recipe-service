import { Router } from "express";
import {
  createLike,
  getLikes,
  getLikeById,
  deleteLike,
} from "../controllers/likeController";
import { authenticate } from "../middleware/auth";

const likeRouter = Router();

likeRouter.post("/", authenticate, createLike);
likeRouter.get("/", getLikes);
likeRouter.get("/:id", getLikeById);
likeRouter.delete("/:id", authenticate, deleteLike);

export default likeRouter;
