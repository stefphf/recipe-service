import { Router } from "express";
import {
  createComment,
  getComments,
  getCommentById,
  updateComment,
  deleteComment,
} from "../controllers/commentController";
import { authenticate } from "../middleware/auth";

const commentRouter = Router();

commentRouter.post("/", authenticate, createComment);
commentRouter.get("/", getComments);
commentRouter.get("/:id", getCommentById);
commentRouter.put("/:id", authenticate, updateComment);
commentRouter.delete("/:id", authenticate, deleteComment);

export default commentRouter;
