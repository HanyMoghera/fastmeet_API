import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

import { Room } from '../../rooms/entities/room.entity';
import { User } from '../../users/entities/user.entity';
import { Weekday } from 'src/working_hours/entities/working_hour.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

 @Column()
    start_time: number;

  @Column()
    end_time: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar', nullable: true })
  promo_code: string;

  @Column('date')
  date: string;

  @Column()
  weekday:Weekday;

  @ManyToOne(() => Room, (room) => room.bookings, { nullable: false })
  room: Room;

  @ManyToOne(() => User, (user) => user.bookings, { nullable: false })
  user: User;


  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
  
  // saving a idempotency Key 
  @Column({ unique: true })
  idempotencyKey: string;

  @VersionColumn()
  version: number;

}
