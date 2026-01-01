import { IsArray, IsDateString, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Weekday }from '../entities/working_hour.entity'
// import { Room } from 'src/rooms/entities/room.entity';

export class WorkingHourItemDto {

    @IsEnum(Weekday)
    weekday: Weekday;

    @IsString()
    start_time: string; 

    @IsString()
    end_time: string; 


    @IsDateString()
    date: string;

}

// for more than one working hours 
export class CreateWorkingHoursDto{
    
   @IsNumber()
   roomId: number;


   @IsArray()
   @ValidateNested({each: true})
   @Type(()=> WorkingHourItemDto)
   working_hours:WorkingHourItemDto[];

}


// for just one working hours 
export class CreateWorkingHourDto extends WorkingHourItemDto {
  @IsNumber()
  roomId: number;
}


