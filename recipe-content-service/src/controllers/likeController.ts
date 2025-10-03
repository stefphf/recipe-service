import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import Like from "../entities/Like";

export const createLike = async (req: Request, res: Response) => {
  try {
    const likeRepository = AppDataSource.getRepository(Like);
    const userId = (req as any).userId;
    const { recipe_id } = req.body;

    if (!recipe_id) {
      return res.status(400).json({ message: "Recipe ID is required" });
    }

    const existingLike = await likeRepository.findOne({
      where: {
        user_id: userId,
        recipe: { recipe_id: recipe_id },
      },
    });

    if (existingLike) {
      return res.status(400).json({ message: "Like already exists" });
    }

    const newLike = likeRepository.create({
      user_id: userId,
      recipe: { recipe_id: recipe_id },
    });

    await likeRepository.save(newLike);
    res.status(201).json(newLike);
  } catch (error: any) {
    console.error("Create like error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const getLikes = async (req: Request, res: Response) => {
  try {
    const likeRepository = AppDataSource.getRepository(Like);
    const { recipe_id, user_id } = req.query;

    let where: any = {};
    if (recipe_id) where.recipe = { recipe_id: parseInt(recipe_id as string) };
    if (user_id) where.user_id = parseInt(user_id as string);

    const likes = await likeRepository.find({
      where,
      relations: ["recipe"],
    });

    res.json(likes);
  } catch (error: any) {
    console.error("Get likes error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const getLikeById = async (req: Request, res: Response) => {
  try {
    const likeRepository = AppDataSource.getRepository(Like);
    const like = await likeRepository.findOne({
      where: { like_id: parseInt(req.params.id) },
      relations: ["recipe"],
    });

    if (!like) {
      return res.status(404).json({ message: "Like not found" });
    }

    res.json(like);
  } catch (error: any) {
    console.error("Get like error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const deleteLike = async (req: Request, res: Response) => {
  try {
    const likeRepository = AppDataSource.getRepository(Like);
    const userId = (req as any).userId;

    const like = await likeRepository.findOneBy({
      like_id: parseInt(req.params.id),
    });

    if (!like) {
      return res.status(404).json({ message: "Like not found" });
    }

    if (like.user_id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await likeRepository.delete(like.like_id);

    if (result.affected === 0) {
      return res.status(404).json({ message: "Like not found" });
    }

    res.json({ message: "Like deleted successfully" });
  } catch (error: any) {
    console.error("Delete like error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};
