import { Router } from "express";
import { UserController } from "../controllers/userController";
import { authenticate } from "../middleware/auth";

const userRouter = Router();

userRouter.get("/all", authenticate, UserController.getAllUsers);
userRouter.get("/profile", authenticate, UserController.getProfile);
userRouter.get("/:id", authenticate, UserController.getUserById);
userRouter.put("/:id", authenticate, UserController.updateUser);
userRouter.delete("/:id", authenticate, UserController.deleteUser);

export default userRouter;
