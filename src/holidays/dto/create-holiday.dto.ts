import { IsNotEmpty, IsString, IsDateString } from 'class-validator';
import { Weekday } from 'src/working_hours/entities/working_hour.entity';

export class CreateHolidayDto {
  @IsNotEmpty()
  @IsString()
  day: Weekday;

  @IsNotEmpty()
  @IsDateString()
  date: string; 
}
