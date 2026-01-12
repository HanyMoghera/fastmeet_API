import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


export enum settingKey {
    HOUR_PRICE = 'hour_price_global',
    MAX_DAILY_BOOKINGS = 'max_active_bookings_per_user_per_day'
}

@Entity('settings')
export class Setting {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    key: string; // hourly_price or max booking per user 

    @Column()
    value:string // value of hourly price or max booking per user 
}
