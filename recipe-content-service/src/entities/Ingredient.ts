import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import Recipe from "./Recipe";

@Entity("ingredients")
export default class Ingredient {
  @PrimaryGeneratedColumn()
  ingredient_id: number;

  @ManyToOne(() => Recipe, (recipe) => recipe.ingredients)
  recipe: Recipe;

  @Column()
  name: string;

  @Column()
  amount: string;
}
