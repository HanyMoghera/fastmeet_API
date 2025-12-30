import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn 
} from "typeorm"
import { Amentity } from "../../amenities/entities/amenity.entity";
import { WorkingHour  } from "../../working_hours/entities/working_hour.entity";




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

    // define the relationship between
    @ManyToMany(()=> Amentity, (amentity)=> amentity.rooms , { cascade: true })
    @JoinTable()
    amenities: Amentity[] // it is a list of the ids to reference to the amentity objet in the other schema. 

    @OneToMany(()=>WorkingHour, (working_hours)=> working_hours.room)
    working_hours:WorkingHour[]; // list of a lists 

}
