import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import SavedRecipe from "../entities/SavedRecipe";

export const createSavedRecipe = async (req: Request, res: Response) => {
  try {
    const savedRecipeRepository = AppDataSource.getRepository(SavedRecipe);
    const userId = (req as any).userId;
    const { recipe_id } = req.body;

    if (!recipe_id) {
      return res.status(400).json({ message: "Recipe ID is required" });
    }

    const existingSavedRecipe = await savedRecipeRepository.findOne({
      where: {
        user_id: userId,
        recipe_id: recipe_id,
      },
    });

    if (existingSavedRecipe) {
      return res.status(400).json({ message: "Recipe already saved" });
    }

    const newSavedRecipe = savedRecipeRepository.create({
      user_id: userId,
      recipe_id: recipe_id,
    });

    await savedRecipeRepository.save(newSavedRecipe);
    res.status(201).json(newSavedRecipe);
  } catch (error: any) {
    console.error("Create saved recipe error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const getSavedRecipes = async (req: Request, res: Response) => {
  try {
    const savedRecipeRepository = AppDataSource.getRepository(SavedRecipe);
    const userId = (req as any).userId;

    const savedRecipes = await savedRecipeRepository.find({
      where: { user_id: userId },
      order: { saved_at: "DESC" },
    });

    res.json(savedRecipes);
  } catch (error: any) {
    console.error("Get saved recipes error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const getSavedRecipeById = async (req: Request, res: Response) => {
  try {
    const savedRecipeRepository = AppDataSource.getRepository(SavedRecipe);
    const savedRecipe = await savedRecipeRepository.findOne({
      where: { saved_recipe_id: parseInt(req.params.id) },
    });

    if (!savedRecipe) {
      return res.status(404).json({ message: "Saved recipe not found" });
    }

    if (savedRecipe.user_id !== (req as any).userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(savedRecipe);
  } catch (error: any) {
    console.error("Get saved recipe error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const deleteSavedRecipe = async (req: Request, res: Response) => {
  try {
    const savedRecipeRepository = AppDataSource.getRepository(SavedRecipe);
    const userId = (req as any).userId;

    const savedRecipe = await savedRecipeRepository.findOneBy({
      saved_recipe_id: parseInt(req.params.id),
    });

    if (!savedRecipe) {
      return res.status(404).json({ message: "Saved recipe not found" });
    }

    if (savedRecipe.user_id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await savedRecipeRepository.delete(
      savedRecipe.saved_recipe_id
    );

    if (result.affected === 0) {
      return res.status(404).json({ message: "Saved recipe not found" });
    }

    res.json({ message: "Saved recipe deleted successfully" });
  } catch (error: any) {
    console.error("Delete saved recipe error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const deleteSavedRecipeByRecipe = async (
  req: Request,
  res: Response
) => {
  try {
    const savedRecipeRepository = AppDataSource.getRepository(SavedRecipe);
    const userId = (req as any).userId;
    const { recipe_id } = req.params;

    const savedRecipe = await savedRecipeRepository.findOne({
      where: {
        user_id: userId,
        recipe_id: parseInt(recipe_id),
      },
    });

    if (!savedRecipe) {
      return res.status(404).json({ message: "Saved recipe not found" });
    }

    const result = await savedRecipeRepository.delete(
      savedRecipe.saved_recipe_id
    );

    if (result.affected === 0) {
      return res.status(404).json({ message: "Saved recipe not found" });
    }

    res.json({ message: "Saved recipe deleted successfully" });
  } catch (error: any) {
    console.error("Delete saved recipe by recipe error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const checkRecipeSaved = async (req: Request, res: Response) => {
  try {
    const savedRecipeRepository = AppDataSource.getRepository(SavedRecipe);
    const userId = (req as any).userId;
    const { recipe_id } = req.params;

    const savedRecipe = await savedRecipeRepository.findOne({
      where: {
        user_id: userId,
        recipe_id: parseInt(recipe_id),
      },
    });

    res.json({ is_saved: !!savedRecipe });
  } catch (error: any) {
    console.error("Check recipe saved error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};
