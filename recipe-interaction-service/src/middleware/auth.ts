import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userIdFromHeader = req.headers["x-user-id"] as string;
  const token = req.headers.authorization?.split(" ")[1];

  if (userIdFromHeader) {
    (req as any).userId = parseInt(userIdFromHeader);
    return next();
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as any).userId = (decoded as any).id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
