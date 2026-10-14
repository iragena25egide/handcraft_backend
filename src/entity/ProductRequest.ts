import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn, ManyToOne } from "typeorm";
import { Product } from "./Product";

@Entity()
export class ProductRequest {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  customerName: string;

  @Column()
  customerPhone: string;

  @Column({ nullable: true })
  customerEmail: string;

  @ManyToOne(() => Product, { nullable: true })
  product: Product;

  @Column({ nullable: true })
  productId: number;

  @Column({ nullable: true })
  productName: string;

  @Column({ default: "Pending" })
  status: string; // e.g., 'Pending', 'Contacted', 'Resolved'

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
