import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export default class SavedRecipe {
  @PrimaryGeneratedColumn()
  saved_recipe_id: number;

  @Column()
  user_id: number;

  @Column()
  recipe_id: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  saved_at: Date;
}
