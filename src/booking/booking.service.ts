import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from 'src/rooms/entities/room.entity';

@Injectable()
export class BookingService {

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    private readonly roomRepo: Repository<Room>
  ){}


async  create(createBookingDto: CreateBookingDto ,currentUser: User){

  // get the input
  const {
    start_time,
    end_time,
    promo_code,
    date,
    roomId
  } = createBookingDto


  // check if there is a room with this ID 
//    const room = await this.roomRepo.findOne({
//    where: { id: roomId },
//    relations: ['working_hours'],
//  });
 
//     if(!room){
//        throw new NotFoundException(`there is no room with this ID: ${id}`);
//      }

  // check the availiability of the time slot  working hours 

  //check the duration 

  // caculate the room price 

  // update the satuts 

  //get the promocode if exists + validateand update it 

  // create the booking 
  // const booking =await this.bookingRepo.create();

  // save it
  //this.bookingRepo.save(booking)
    return 'vdfv' ;
  }



  findAll() {
    return `This action returns all booking`;
  }

  findOne(id: number) {
    return `This action returns a #${id} booking`;
  }

  update(id: number, updateBookingDto: UpdateBookingDto) {
    return `This action updates a #${id} booking`;
  }

  remove(id: number) {
    return `This action removes a #${id} booking`;
  }
}
