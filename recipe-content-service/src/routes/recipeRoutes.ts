import { Router } from "express";
import {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
} from "../controllers/recipeController";
import { authenticate } from "../middleware/auth";

const recipeRouter = Router();

recipeRouter.post("/", authenticate, createRecipe);
recipeRouter.get("/", getRecipes);
recipeRouter.get("/:id", getRecipeById);
recipeRouter.put("/:id", authenticate, updateRecipe);
recipeRouter.delete("/:id", authenticate, deleteRecipe);

export default recipeRouter;
