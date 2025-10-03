import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import User from "../entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const { email, password, username, profile_photo, bio } = req.body;

    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ message: "Email, password and username are required" });
    }

    const existingUser = await userRepository.findOneBy({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = userRepository.create({
      email,
      username,
      password: hashedPassword,
      profile_photo,
      bio,
    });

    await userRepository.save(newUser);

    const token = jwt.sign(
      { id: newUser.user_id, email: newUser.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        user_id: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
        profile_photo: newUser.profile_photo,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await userRepository.findOneBy({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.user_id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        profile_photo: user.profile_photo,
        bio: user.bio,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};
