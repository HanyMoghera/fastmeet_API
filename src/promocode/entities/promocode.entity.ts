import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Expose, Transform } from 'class-transformer';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

@Entity('promocodes')
export class Promocode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column({
    type: 'enum',
    enum: DiscountType,
  })
  discount_type: DiscountType;

  @Column('decimal', { precision: 10, scale: 2 })
  discount_value: number;

  @Column({ type: 'timestamp' })
  @Transform(({ value }) => value?.toISOString(), { toPlainOnly: true })
  valid_from: Date;

  @Column({ type: 'timestamp' })
  @Transform(({ value }) => value?.toISOString(), { toPlainOnly: true })
  valid_to: Date;

  @Column({ type: 'int', nullable: true })
  usage_limit: number;

  @Column({ type: 'int', nullable: true })
  per_user_limit: number;

  @Column({ type: 'int', default: 0 })
  used_count: number;

  @CreateDateColumn()
  @Transform(({ value }) => value?.toISOString(), { toPlainOnly: true })
  created_at: Date;

  @UpdateDateColumn()
  @Transform(({ value }) => value?.toISOString(), { toPlainOnly: true })
  updated_at: Date;
}
