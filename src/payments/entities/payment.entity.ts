import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking!: Booking;

  @Column({ name: 'booking_id' })
  bookingId!: string;

  @Column({ name: 'order_code', unique: true })
  orderCode!: string;

  @Column({ type: 'decimal', precision: 12, scale: 0 })
  amount!: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @Column({ name: 'checkout_url', type: 'text', nullable: true })
  checkoutUrl!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}