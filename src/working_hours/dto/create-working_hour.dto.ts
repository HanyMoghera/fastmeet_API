import { IsString, IsEnum, IsNumber, IsDate } from 'class-validator';
import { Weekday }from '../entities/working_hour.entity'
import { Room } from 'src/rooms/entities/room.entity';

export class CreateWorkingHourDto {
    @IsEnum(Weekday)
    weekday: Weekday;

    @IsString()
    start_time: string; 

    @IsString()
    end_time: string; 

    @IsNumber()
    roomId: number;

    @IsString()
    date: string

}