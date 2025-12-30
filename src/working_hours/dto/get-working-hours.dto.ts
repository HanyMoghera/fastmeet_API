import { Expose } from "class-transformer";
import { Weekday } from "../entities/working_hour.entity";

export class WorkingHoursResponseDto {
  @Expose()
  id: number;

  @Expose()
  weekday: Weekday;

  @Expose()
  start_time: string;

  @Expose()
  end_time: string;

  @Expose()
  date: string;
}
