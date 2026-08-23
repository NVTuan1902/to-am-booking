import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @Column({ name: 'owner_id' })
  ownerId!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ name: 'price_per_night', type: 'decimal', precision: 12, scale: 0 })
  pricePerNight!: number;

  @Column({ name: 'max_guests', type: 'int', default: 2 })
  maxGuests!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}