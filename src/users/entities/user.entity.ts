import { Booking } from "src/booking/entities/booking.entity";
import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn 
} from "typeorm"


@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 20})
    first_name:string

    @Column({length: 20})
    last_name:string

    @Column()
    password:string

    @Column({unique: true})
    email:string

     @Column({
        type:'boolean',
        default:false
    })
    isAdmin:boolean


    @Column({
        type : "timestamptz",
        default: ()=>'CURRENT_TIMESTAMP',
    })
        creaded_at:Date

    @Column({
        type : "timestamptz",
        default: ()=>'CURRENT_TIMESTAMP',
    })
    updated_at:Date

    @ManyToOne(()=> Booking, (bookings)=> bookings.user)
    bookings:Booking
}



