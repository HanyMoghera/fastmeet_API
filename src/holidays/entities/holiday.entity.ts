import { Weekday } from "src/working_hours/entities/working_hour.entity";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Holiday {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    day: Weekday

    @Column({unique: true})
    date: Date

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
    
}
