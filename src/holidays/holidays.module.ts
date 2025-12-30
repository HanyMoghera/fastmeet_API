import { Module } from '@nestjs/common';
import { HolidaysService } from './holidays.service';
import { HolidaysController } from './holidays.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Holiday } from './entities/holiday.entity';

@Module({
  imports: [
      TypeOrmModule.forFeature([Holiday]),
      ConfigModule,
    ],
  controllers: [HolidaysController],
  providers: [HolidaysService],
})
export class HolidaysModule {}
