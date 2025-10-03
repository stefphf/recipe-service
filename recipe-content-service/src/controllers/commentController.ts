import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import Comment from "../entities/Comment";

export const createComment = async (req: Request, res: Response) => {
  try {
    const commentRepository = AppDataSource.getRepository(Comment);
    const userId = (req as any).userId;
    const { recipe_id, content } = req.body;

    if (!recipe_id || !content) {
      return res
        .status(400)
        .json({ message: "Recipe ID and content are required" });
    }

    const newComment = commentRepository.create({
      user_id: userId,
      recipe: { recipe_id },
      content,
    });

    const savedComment = await commentRepository.save(newComment);
    res.status(201).json(savedComment);
  } catch (error: any) {
    console.error("Create comment error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const getComments = async (req: Request, res: Response) => {
  try {
    const commentRepository = AppDataSource.getRepository(Comment);
    const { recipe_id } = req.query;

    let where: any = {};
    if (recipe_id) where.recipe = { recipe_id: parseInt(recipe_id as string) };

    const comments = await commentRepository.find({
      where,
      relations: ["recipe"],
      order: { created_at: "DESC" },
    });

    res.json(comments);
  } catch (error: any) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const getCommentById = async (req: Request, res: Response) => {
  try {
    const commentRepository = AppDataSource.getRepository(Comment);
    const comment = await commentRepository.findOne({
      where: { comment_id: parseInt(req.params.id) },
      relations: ["recipe"],
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.json(comment);
  } catch (error: any) {
    console.error("Get comment error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const updateComment = async (req: Request, res: Response) => {
  try {
    const commentRepository = AppDataSource.getRepository(Comment);
    const userId = (req as any).userId;

    const comment = await commentRepository.findOneBy({
      comment_id: parseInt(req.params.id),
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user_id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    commentRepository.merge(comment, req.body);
    const result = await commentRepository.save(comment);

    res.json(result);
  } catch (error: any) {
    console.error("Update comment error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const commentRepository = AppDataSource.getRepository(Comment);
    const userId = (req as any).userId;

    const comment = await commentRepository.findOneBy({
      comment_id: parseInt(req.params.id),
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user_id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await commentRepository.delete(comment.comment_id);

    if (result.affected === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.json({ message: "Comment deleted successfully" });
  } catch (error: any) {
    console.error("Delete comment error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};
