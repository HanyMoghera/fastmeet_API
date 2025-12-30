import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { Amentity } from 'src/amenities/entities/amenity.entity';
import { WorkingHour } from 'src/working_hours/entities/working_hour.entity';

@Module({
   imports: [
    TypeOrmModule.forFeature([Room , Amentity, WorkingHour]),
  ],
  controllers: [RoomsController],
  providers: [RoomsService],
})
export class RoomsModule {}
