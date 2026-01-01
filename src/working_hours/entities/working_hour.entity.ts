import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn 
} from "typeorm"
import { Room } from "../../rooms/entities/room.entity";

export enum Weekday {
    Monday = 'Monday',
    Tuesday = 'Tuesday',
    Wednesday = 'Wednesday',
    Thursday = 'Thursday',
    Friday = 'Friday',
    Saturday = 'Saturday',
    Sunday = 'Sunday',
}


@Entity()
export class WorkingHour{

    @PrimaryGeneratedColumn()
    id:number;

    @Column({
        type:'enum',
        enum:Weekday
    })
    weekday: Weekday;

    @Column()
    start_time:string;

    @Column()
    end_time:string;

    @Column({type: 'date'})
    date:string;

    @ManyToOne(()=>Room, (room)=>room.working_hours,
    {onDelete: 'CASCADE'})
    room:Room;

}