import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { Amentity } from 'src/amenities/entities/amenity.entity';
import { WorkingHour } from 'src/working_hours/entities/working_hour.entity';
import { WorkingHoursModule } from 'src/working_hours/working_hours.module';

@Module({
   imports: [
    TypeOrmModule.forFeature([Room , Amentity, WorkingHour]),
    WorkingHoursModule
  ],
  controllers: [RoomsController],
  providers: [RoomsService],
})
export class RoomsModule {}
