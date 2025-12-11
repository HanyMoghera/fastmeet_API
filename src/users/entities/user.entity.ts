import {
    Column,
    Entity,
    PrimaryGeneratedColumn 
} from "typeorm"

export enum roles {
  admin = "admin",
  user = "user",
}

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
        type:'enum',
        enum:roles,
        default: roles.user,
     })
    role:roles

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
}



