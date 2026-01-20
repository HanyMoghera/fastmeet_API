import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { User } from 'src/users/entities/user.entity';
import { Room } from 'src/rooms/entities/room.entity';
import { SettingsModule } from 'src/settings/settings.module';
import { HolidaysModule } from 'src/holidays/holidays.module';
import { PromocodeModule } from 'src/promocode/promocode.module';
import { Promocode } from 'src/promocode/entities/promocode.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([Booking, User, Room, Promocode]),
    SettingsModule,
    HolidaysModule,
    PromocodeModule
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports:[BookingService]
})
export class BookingModule {}
