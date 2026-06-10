import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  message!: string;

  @Column({ default: false })
  isRead!: boolean;

  @Column({ type: "int", nullable: true })
  userId!: number | null;

  @CreateDateColumn()
  createdAt!: Date;
}
