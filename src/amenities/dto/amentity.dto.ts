import { Expose } from 'class-transformer';

export class AmenityDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description: string;
}
