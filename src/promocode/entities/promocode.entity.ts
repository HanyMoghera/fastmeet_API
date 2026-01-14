import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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
  valid_from: Date;

  @Column({ type: 'timestamp' })
  valid_to: Date;

  @Column({ type: 'int', nullable: true })
  usage_limit: number; // total usage limit for all the users 

  @Column({ type: 'int', nullable: true })
  per_user_limit: number;  // total usage limit for one user 

  @Column({ type: 'int', default: 0 })
  used_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn() 
  updated_at: Date;
}
