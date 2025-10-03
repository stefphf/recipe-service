import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import Recipe from "./Recipe";

@Entity("instructions")
export default class Instruction {
  @PrimaryGeneratedColumn()
  instruction_id: number;

  @ManyToOne(() => Recipe, (recipe) => recipe.instructions)
  recipe: Recipe;

  @Column()
  step_number: number;

  @Column("text")
  description: string;

  @Column({ nullable: true })
  image_url: string;
}
