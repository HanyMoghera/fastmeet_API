import { Module } from '@nestjs/common';
import { AmenitiesService } from './amenities.service';
import { AmenitiesController } from './amenities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Amentity } from './entities/amenity.entity';

@Module({
      imports: [
      TypeOrmModule.forFeature([Amentity]),
    ],

  controllers: [AmenitiesController],
  providers: [AmenitiesService],
  exports:[AmenitiesService]

})
export class AmenitiesModule {}
