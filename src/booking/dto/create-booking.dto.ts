import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString, Matches } from 'class-validator';
import { Weekday } from 'src/working_hours/entities/working_hour.entity';

export class CreateBookingDto {

@IsNotEmpty()
  @IsString()
  @Matches(/^(0?[1-9]|1[0-2]):([0-5]\d) (AM|PM)$/, {
    message: 'start_time must be in HH:MM AM/PM format',
  })
  start_time: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(0?[1-9]|1[0-2]):([0-5]\d) (AM|PM)$/, {
    message: 'end_time must be in HH:MM AM/PM format',
  })
  end_time: string;

  @IsOptional()
  @IsString()
  promo_code: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be in YYYY-MM-DD format',
  })
  date: string;
  

  @IsNotEmpty()
  @IsNumber()
  roomId: Number; 

  @IsNotEmpty()
  @IsString()
  weekday:Weekday

}
