import "reflect-metadata";
import { DataSource } from "typeorm";
import Recipe from "./entities/Recipe";
import Ingredient from "./entities/Ingredient";
import Instruction from "./entities/Instruction";
import Comment from "./entities/Comment";
import Like from "./entities/Like";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [Recipe, Ingredient, Instruction, Comment, Like],
});
