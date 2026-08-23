import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';
import { User } from '../../users/entities/user.entity';

export enum BookingStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Room)
  @JoinColumn({ name: 'room_id' })
  room!: Room;

  @Column({ name: 'room_id' })
  roomId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'customer_id' })
  customer!: User;

  @Column({ name: 'customer_id' })
  customerId!: string;

  @Column({ name: 'check_in_date', type: 'date' })
  checkInDate!: string;

  @Column({ name: 'check_out_date', type: 'date' })
  checkOutDate!: string;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status!: BookingStatus;

  @Column({ name: 'total_price', type: 'decimal', precision: 12, scale: 0 })
  totalPrice!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}