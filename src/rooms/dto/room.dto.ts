import { Expose, Type, Transform } from 'class-transformer';
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
  @Transform(({ value }) => value?.toISOString())
  created_at: string;

  @Expose()
  @Transform(({ value }) => value?.toISOString())
  updated_at: string;

  @Expose()
  @Type(() => AmenityDto)
  amenities: AmenityDto[];

  @Expose()
  @Type(() => WorkingHoursResponseDto)
  working_hours: WorkingHoursResponseDto[];
}
