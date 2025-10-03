import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    req.originalUrl === "/api/auth/login" ||
    req.originalUrl === "/api/auth/register"
  ) {
    return next();
  }

  const token = req.headers.authorization?.split(" ")[1];
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
