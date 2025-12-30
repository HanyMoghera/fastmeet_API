import { Expose, Type } from 'class-transformer';
import { WorkingHoursResponseDto } from '../../working_hours/dto/get-working-hours.dto';
import { AmenityDto } from '../../amenities/dto/amentity.dto';

export class RoomResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  capacity: number;

  @Expose()
  timezone: string;

  @Expose()
  is_active: boolean;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;

  @Expose()
  @Type(() => AmenityDto)
  amenities: AmenityDto[];

  @Expose()
  @Type(() => WorkingHoursResponseDto)
  working_hours: WorkingHoursResponseDto[];
}
