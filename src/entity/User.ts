import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn, OneToMany } from "typeorm";
import { Order } from "./Order";
import { Product } from "./Product";

export enum UserRole {
  BUYER = "BUYER",
  SELLER = "SELLER",
  SUPER_ADMIN = "SUPER_ADMIN"
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password?: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.BUYER
  })
  role: UserRole;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Product, (product) => product.seller)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
