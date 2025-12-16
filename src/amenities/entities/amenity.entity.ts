import {
    Column,
    Entity,
    ManyToMany,
    PrimaryGeneratedColumn 
} from "typeorm"
import { Room } from '../../rooms/entities/room.entity' ;

@Entity()
export class Amentity{

    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    name:string

    @Column({type: 'text'})
    description:string

    @ManyToMany(() => Room, (room) => room.amenities)
    rooms: Room[];
}
