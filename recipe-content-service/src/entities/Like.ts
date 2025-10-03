import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import Recipe from "./Recipe";

@Entity("likes")
export default class Like {
  @PrimaryGeneratedColumn()
  like_id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => Recipe, (recipe) => recipe.likes)
  recipe: Recipe;
}
