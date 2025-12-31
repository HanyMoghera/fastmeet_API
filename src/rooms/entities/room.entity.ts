import {
    Column,
    Entity,
    Index,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn 
} from "typeorm"
import { Amentity } from "../../amenities/entities/amenity.entity";
import { WorkingHour  } from "../../working_hours/entities/working_hour.entity";
import { Booking } from "src/booking/entities/booking.entity";


@Index(['id'])
@Entity()
export class Room {

    @PrimaryGeneratedColumn()
    id: number

    @Column({unique:true})
    name: string;

    @Column()
    capacity: number;

    @Column({ default: 'UTC' })
    timezone: string;

    @Column({default: true})
     is_active: boolean;

    @Column({
        type : "timestamptz",
        default: ()=>'CURRENT_TIMESTAMP',
    })
        created_at:Date

    @Column({
        type : "timestamptz",
        default: ()=>'CURRENT_TIMESTAMP',
    })
    updated_at:Date

    // define the relationship room and amentities 
    @ManyToMany(()=> Amentity, (amentity)=> amentity.rooms , { cascade: true })
    @JoinTable()
    amenities: Amentity[] // it is a list of the ids to reference to the amentity objet in the other schema. 

    // define the relationship between room and working hours 
    @OneToMany(()=>WorkingHour, (working_hours)=> working_hours.room)
    working_hours:WorkingHour[]; // list of a lists 

    // wetween the room and the booking. 
    @OneToMany(()=> Booking, (bookings)=> bookings.room)
    bookings:Booking

}


