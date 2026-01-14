import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { User } from 'src/users/entities/user.entity';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from 'src/rooms/entities/room.entity';
import { SettingsService } from 'src/settings/settings.service';
import { HolidaysService } from 'src/holidays/holidays.service';
import { Promocode } from 'src/promocode/entities/promocode.entity';
import { PromocodeService } from 'src/promocode/promocode.service';

@Injectable()
export class BookingService {

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,

    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>, 

    @InjectRepository(Promocode)
    private readonly promocodeRepo: Repository<Promocode>, 

    private readonly settingsService: SettingsService,

    private readonly holidayService: HolidaysService,

    private readonly promocodeService: PromocodeService,


  ){}


async  create(createBookingDto: CreateBookingDto ,currentUser: User){

  if(!currentUser){
    throw new BadRequestException('Please login first to be alble to book a room!')
  }

  // get the input
  const {
    start_time,
    end_time,
    weekday,
    promo_code,
    date,
    roomId
  } = createBookingDto

  // check if there is a room with this ID 
   const room = await this.roomRepo.findOne({
   where: { id: +roomId },
   relations: ['working_hours'],
 });

    if(!room){
       throw new NotFoundException(`there is no room with this ID: ${roomId}`);
     }

console.log("pass the room")


 const [startTime, startPeriod] = start_time.split(' ');
const [endTime, endPeriod] = end_time.split(' ');

let [startHours, startMinutes] = startTime.split(':').map(Number);
let [endHours, endMinutes] = endTime.split(':').map(Number);

if (startPeriod.toLowerCase() === 'pm' && startHours !== 12) startHours += 12;
if (startPeriod.toLowerCase() === 'am' && startHours === 12) startHours = 0;

if (endPeriod.toLowerCase() === 'pm' && endHours !== 12) endHours += 12;
if (endPeriod.toLowerCase() === 'am' && endHours === 12) endHours = 0;

const startTimeInMinutes = startHours * 60 + startMinutes;
const endTimeInMinutes = endHours * 60 + endMinutes;

if (endTimeInMinutes <= startTimeInMinutes) {
  throw new BadRequestException('End time must be after start time');
}

const duration = endTimeInMinutes - startTimeInMinutes;

if (!(duration >= 30 && duration <= 240)) {
  throw new BadRequestException(
    'Please enter a valid duration between 30 minutes and 4 hours'
  );
}
console.log("pass the duration!")

// check the number of the booking per user! 
await this.getUserBookings(currentUser, date);

// cehck the hollydays first! 
const holidays = await this.holidayService.findAll();

if(holidays.count>0){
  holidays.holidays.map((val)=>{
    if(date === val.date){
      throw new BadRequestException(`Sorry this ${weekday} on ${date} is a holliday! no bookings!`)
    }
  })
}
  console.log('Hollidays passed!'); 

// check the availiability of the time slot  working hours 

//get the the whole booking for this room in this date 
const bookingsForaDay = await this.bookingRepo.find({where:{room ,date}});

if(bookingsForaDay.length){
   const isOverlap = bookingsForaDay.some( (val) =>
      start_time < val.end_time && end_time > val.start_time
  );

  if (isOverlap) {
    throw new BadRequestException(
      'The selected time overlaps with an existing booking!'
    );
  }

}
console.log('checking the overlaps passed!'); 


  //Promocodes 
  // get the promocode and check the validity "date"

  // caculate the room price 

  let roomPrice:number = await this.settingsService.getHourlyPrice('hour_price_global');

  if(!roomPrice){
      throw new BadRequestException('Sorry, there is no room price at the moment!')
  }


const promo = await this.promocodeRepo.findOne({
  where: {
    code:promo_code,
    valid_from: LessThanOrEqual(new Date()),
    valid_to: MoreThanOrEqual(new Date()),
  },
});



if(promo){
  const {usage_limit, per_user_limit, used_count,discount_type , discount_value} = promo;

  if( used_count > usage_limit){
    throw new BadRequestException('Sorry this promocode has reached the limit!')
  }


    const numOfUsedPromocodeforUser:number = await this.bookingRepo.count({
      where:{
        user:currentUser,
        promo_code
      }
    });
    if(numOfUsedPromocodeforUser > per_user_limit){
          throw new BadRequestException('Sorry, You have reached the promocode usage limit!')
    }

    if(discount_type=="percentage"){
      roomPrice = roomPrice*(1-discount_value/100);
    }else{
      roomPrice = roomPrice-discount_value;
    }

    // update the promocode usage_count
     promo.used_count += 1;
  await  this.promocodeRepo.save(promo);

}

  // create the booking 
  const booking = this.bookingRepo.create({
    start_time,
    end_time,
    price:roomPrice,
    promo_code: promo?.code,
    date,
    weekday,
    room,
    user: { id: currentUser.id }
  });

    // update the satuts 
  if(booking){
    booking.status=BookingStatus.CONFIRMED; 
  }else{
        throw new BadRequestException('Sorry, something bad happend while saving the booking!')

  }
  // save it
    return this.bookingRepo.save(booking) ;
  }


  // get the bookings number per user
  async getUserBookings(currentUser: User , date:string){
    // check the existence of the user and get its data 
    const bookingsNumber = await this.bookingRepo.count({
      where:{
        user:currentUser,
        date
      }
    });
   // check the max num of booking for the user per day 
    const maxUserBookingLimit =await this.settingsService.getBookingMaxNumberPerUser("max_active_bookings_per_user_per_day");

    if(bookingsNumber >= maxUserBookingLimit){
          throw new BadRequestException('Sorry you have exceeded the number of booking for today!')
    }
    console.log('booking limit passed!')
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
