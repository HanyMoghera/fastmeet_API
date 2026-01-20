import { Module } from '@nestjs/common';
import { WorkingHoursService } from './working_hours.service';
import { WorkingHoursController } from './working_hours.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkingHour } from './entities/working_hour.entity';
import { Room } from 'src/rooms/entities/room.entity';
import { BookingModule } from 'src/booking/booking.module';

@Module({
  imports:[
      TypeOrmModule.forFeature([WorkingHour,Room]),
      BookingModule
  ],
  controllers: [WorkingHoursController],
  providers: [WorkingHoursService],
  exports:[WorkingHoursService]
})
export class WorkingHoursModule {}
