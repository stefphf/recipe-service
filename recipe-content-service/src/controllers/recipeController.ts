import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import Recipe from "../entities/Recipe";
import Ingredient from "../entities/Ingredient";
import Instruction from "../entities/Instruction";
import { ILike } from "typeorm";
import { publishRecipeCreated, publishRecipeDeleted } from "../events";

export const createRecipe = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const userId = (req as any).userId;
    const {
      title,
      description,
      difficulty,
      type,
      video_url,
      image_url,
      ingredients,
      instructions,
    } = req.body;

    const recipeRepository = queryRunner.manager.getRepository(Recipe);
    const newRecipe = recipeRepository.create({
      user_id: userId,
      title,
      description,
      difficulty,
      type,
      video_url,
      image_url,
    });

    const savedRecipe = await recipeRepository.save(newRecipe);

    if (ingredients && Array.isArray(ingredients)) {
      const ingredientRepository =
        queryRunner.manager.getRepository(Ingredient);
      for (const ing of ingredients) {
        const ingredient = ingredientRepository.create({
          ...ing,
          recipe: savedRecipe,
        });
        await ingredientRepository.save(ingredient);
      }
    }

    if (instructions && Array.isArray(instructions)) {
      const instructionRepository =
        queryRunner.manager.getRepository(Instruction);
      for (const inst of instructions) {
        const instruction = instructionRepository.create({
          ...inst,
          recipe: savedRecipe,
        });
        await instructionRepository.save(instruction);
      }
    }

    await queryRunner.commitTransaction();

    const fullRecipe = await recipeRepository.findOne({
      where: { recipe_id: savedRecipe.recipe_id },
      relations: ["ingredients", "instructions"],
    });

    // Публикация события о создании рецепта
    await publishRecipeCreated(savedRecipe);

    res.status(201).json(fullRecipe);
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("Create recipe error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  } finally {
    await queryRunner.release();
  }
};

export const getRecipes = async (req: Request, res: Response) => {
  try {
    const recipeRepository = AppDataSource.getRepository(Recipe);
    const { type, difficulty, search, page = 1, limit = 10 } = req.query;

    let where: any = {};
    if (type) where.type = type;
    if (difficulty) where.difficulty = difficulty;
    if (search) where.title = ILike(`%${search}%`);

    const [recipes, total] = await recipeRepository.findAndCount({
      where,
      relations: ["ingredients", "instructions"],
      order: { created_at: "DESC" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    res.json({
      recipes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error("Get recipes error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const getRecipeById = async (req: Request, res: Response) => {
  try {
    const recipeRepository = AppDataSource.getRepository(Recipe);
    const recipe = await recipeRepository.findOne({
      where: { recipe_id: parseInt(req.params.id) },
      relations: ["ingredients", "instructions"],
    });

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json(recipe);
  } catch (error: any) {
    console.error("Get recipe error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const updateRecipe = async (req: Request, res: Response) => {
  try {
    const recipeRepository = AppDataSource.getRepository(Recipe);
    const userId = (req as any).userId;

    const recipe = await recipeRepository.findOneBy({
      recipe_id: parseInt(req.params.id),
    });

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    if (recipe.user_id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { title, description, difficulty, type, video_url, image_url } =
      req.body;
    if (title !== undefined) recipe.title = title;
    if (description !== undefined) recipe.description = description;
    if (difficulty !== undefined) recipe.difficulty = difficulty;
    if (type !== undefined) recipe.type = type;
    if (video_url !== undefined) recipe.video_url = video_url;
    if (image_url !== undefined) recipe.image_url = image_url;

    const result = await recipeRepository.save(recipe);
    res.json(result);
  } catch (error: any) {
    console.error("Update recipe error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const deleteRecipe = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const recipeRepository = queryRunner.manager.getRepository(Recipe);
    const ingredientRepository = queryRunner.manager.getRepository(Ingredient);
    const instructionRepository =
      queryRunner.manager.getRepository(Instruction);

    const userId = (req as any).userId;
    const recipeId = parseInt(req.params.id);

    const recipe = await recipeRepository.findOneBy({ recipe_id: recipeId });

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    if (recipe.user_id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    await ingredientRepository.delete({ recipe: { recipe_id: recipeId } });
    await instructionRepository.delete({ recipe: { recipe_id: recipeId } });

    await recipeRepository.delete(recipeId);

    await queryRunner.commitTransaction();

    // Публикация события об удалении рецепта
    await publishRecipeDeleted(recipeId, userId);

    res.json({ message: "Recipe deleted successfully" });
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error("Delete recipe error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  } finally {
    await queryRunner.release();
  }
};
