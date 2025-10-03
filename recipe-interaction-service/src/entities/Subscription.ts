import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export default class Subscription {
  @PrimaryGeneratedColumn()
  subscription_id: number;

  @Column()
  follower_id: number;

  @Column()
  followed_id: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;
}
