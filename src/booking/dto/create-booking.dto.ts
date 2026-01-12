import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { BookingStatus } from '../entities/booking.entity';
import { Room } from 'src/rooms/entities/room.entity';
import { Weekday } from 'src/working_hours/entities/working_hour.entity';

export class CreateBookingDto {

  @IsNotEmpty()
  @IsString()
  start_time: string;

  @IsNotEmpty()
  @IsString()
  end_time: string;

  @IsOptional()
  @IsString()
  promo_code: string;

  @IsNotEmpty()
  @IsDateString()
  date: string; 

  @IsNotEmpty()
  @IsNumber()
  roomId: Number; 

  @IsNotEmpty()
  @IsString()
  weekday:Weekday

}
