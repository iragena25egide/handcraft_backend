import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User";
import { OrderItem } from "./OrderItem";

@Entity()
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("decimal", { precision: 10, scale: 2 })
  total: number;

  @Column({ default: "Processing" })
  status: string;

  @ManyToOne(() => User, (user) => user.orders, { nullable: true })
  user: User;

  @Column({ nullable: true })
  guestName: string;

  @Column({ nullable: true })
  guestPhone: string;

  @Column({ nullable: true })
  guestEmail: string;

  @Column({ nullable: true })
  shippingAddress: string;

  @Column({ nullable: true })
  shippingCity: string;

  @Column({ nullable: true })
  shippingZipCode: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
