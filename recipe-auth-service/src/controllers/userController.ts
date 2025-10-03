import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import User from "../entities/User";
import { publishUserUpdated, publishUserCreated } from "../events";

export class UserController {
  static getProfile = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const userRepository = AppDataSource.getRepository(User);

      const user = await userRepository.findOne({
        where: { user_id: userId },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        profile_photo: user.profile_photo,
        bio: user.bio,
        created_at: user.created_at,
      });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: error.message || "Internal server error" });
    }
  };

  static getAllUsers = async (req: Request, res: Response) => {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const users = await userRepository.find({
        select: [
          "user_id",
          "username",
          "email",
          "profile_photo",
          "bio",
          "created_at",
        ],
      });

      res.json(users);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: error.message || "Internal server error" });
    }
  };

  static getUserById = async (req: Request, res: Response) => {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { user_id: parseInt(req.params.id) },
        select: [
          "user_id",
          "username",
          "email",
          "profile_photo",
          "bio",
          "created_at",
        ],
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: error.message || "Internal server error" });
    }
  };

  static updateUser = async (req: Request, res: Response) => {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const userId = (req as any).userId;

      const user = await userRepository.findOneBy({ user_id: userId });
      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.user_id !== parseInt(req.params.id)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { username, profile_photo, bio } = req.body;
      if (username !== undefined) user.username = username;
      if (profile_photo !== undefined) user.profile_photo = profile_photo;
      if (bio !== undefined) user.bio = bio;

      await userRepository.save(user);

      await publishUserUpdated(user);

      res.json({
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        profile_photo: user.profile_photo,
        bio: user.bio,
        created_at: user.created_at,
      });
    } catch (error: any) {
      if (error.code === "23505") {
        return res.status(400).json({ message: "Username already exists" });
      }
      res
        .status(500)
        .json({ message: error.message || "Internal server error" });
    }
  };

  static deleteUser = async (req: Request, res: Response) => {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const userId = (req as any).userId;

      if (parseInt(req.params.id) !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const result = await userRepository.delete(userId);

      if (result.affected === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User deleted successfully" });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: error.message || "Internal server error" });
    }
  };
}
