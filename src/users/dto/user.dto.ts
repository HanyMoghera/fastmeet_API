import { Expose } from "class-transformer";

export class UserDto {
    @Expose()
    id: number

    @Expose()
    email:string

    @Expose()
    first_name:string

    @Expose()
    last_name:string

    @Expose()
    isAdmin:boolean
}
