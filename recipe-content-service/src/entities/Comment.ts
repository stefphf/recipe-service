import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import Recipe from "./Recipe";

@Entity("comments")
export default class Comment {
  @PrimaryGeneratedColumn()
  comment_id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => Recipe, (recipe) => recipe.comments)
  recipe: Recipe;

  @Column("text")
  content: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;
}
