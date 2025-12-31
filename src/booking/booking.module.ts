import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { User } from 'src/users/entities/user.entity';
import { Room } from 'src/rooms/entities/room.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([Booking, User, Room])
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
