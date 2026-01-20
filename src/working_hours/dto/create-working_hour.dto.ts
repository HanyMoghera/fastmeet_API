import { IsEnum, IsNumber, IsString, Matches } from 'class-validator';
import { Weekday } from '../entities/working_hour.entity';

export class CreateWorkingHoursDto {

  @IsEnum(Weekday)
  weekday: Weekday;

  // Accepts: 1:40 pm, 01:40 pm, 12:30 AM
  @IsString()
  @Matches(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(am|pm)$/i, {
    message: 'start_time must be in 12-hour format like "1:40 pm" or "01:40 pm"',
  })
  start_time: string;

  // Accepts: 1:40 pm, 01:40 pm, 12:30 AM
  @IsString()
  @Matches(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(am|pm)$/i, {
    message: 'end_time must be in 12-hour format like "12:30 am"',
  })
  end_time: string;

  // Strict YYYY-MM-DD only
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
    message: 'date must be in format YYYY-MM-DD',
  })
  date: string;

  @IsNumber()
  roomId: number;
}
