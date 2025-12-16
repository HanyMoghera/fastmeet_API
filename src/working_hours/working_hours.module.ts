import { Module } from '@nestjs/common';
import { WorkingHoursService } from './working_hours.service';
import { WorkingHoursController } from './working_hours.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkingHour } from './entities/working_hour.entity';

@Module({
  imports:[
      TypeOrmModule.forFeature([WorkingHour]),
  ],
  controllers: [WorkingHoursController],
  providers: [WorkingHoursService],
})
export class WorkingHoursModule {}
