import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from 'src/rooms/entities/room.entity';
import { SettingsService } from 'src/settings/settings.service';
import { HolidaysService } from 'src/holidays/holidays.service';
import { Promocode } from 'src/promocode/entities/promocode.entity';
import { WorkingHour } from 'src/working_hours/entities/working_hour.entity';


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

  ){}

async create(createBookingDto: CreateBookingDto, currentUser: User) {

  if (!currentUser) {
    throw new BadRequestException('Please login first to book a room!');
  }

  const { start_time, end_time, weekday, promo_code, date, roomId } = createBookingDto;

  // get the room
  const room = await this.roomRepo.findOne({
    where: { id: +roomId },
    relations: ['working_hours'],
  });
  if (!room) {
    throw new NotFoundException(`No room found with ID: ${roomId}`);
  }

 // Convert times to minutes
const newStart = this.convertTimeToMinutes(start_time); 
const newEnd = this.convertTimeToMinutes(end_time); 

const workingHoursArray: WorkingHour[] = room.working_hours; 

// Get the working hours for the given date
const workingHours = workingHoursArray.find(wh => wh.date === date);

if (!workingHours) {
  throw new BadRequestException('No working hours set for this room on this date');
}

const startWorkingTime = workingHours.start_time; // 810
const endWorkingTime = workingHours.end_time;     // 1080

// Check if the entered period is outside working hours
if (newStart < startWorkingTime || newEnd > endWorkingTime) {
  throw new BadRequestException('Sorry, this entered period is not available');
}

  if (newEnd <= newStart) {
    throw new BadRequestException('End time must be after start time');
  }

  const duration = newEnd - newStart;
  if (duration < 30 || duration > 240) {
    throw new BadRequestException('Duration must be between 30 minutes and 4 hours');
  }

  // Check user booking limit per day. 
  const bookingsCount = await this.bookingRepo
    .createQueryBuilder('booking')
    .where('booking.userId = :userId', { userId: currentUser.id })
    .andWhere('booking.date = :date', { date })
    .getCount();

  const maxLimit = await this.settingsService.getBookingMaxNumberPerUser('max_active_bookings_per_user_per_day');
  if (bookingsCount >= maxLimit) {
    throw new BadRequestException('You have exceeded the maximum number of bookings for today');
  }

  // Check holidays
const holidays = await this.holidayService.findAll();
// will just return ex'2026-10-25' user input. 
const normalize = (d: string) => new Date(d).toISOString().split('T')[0];

// I used (for of) to check if the date the user wanna book in is one of the holiday dates or not. 
for (const h of holidays.holidays) {
  if (normalize(h.date) === normalize(date)) {
    throw new BadRequestException(`Sorry, ${weekday} on ${date} is a holiday`);
  }
}

// Check overlapping bookings directly in DB
const overlappingBooking = await this.bookingRepo
  .createQueryBuilder('booking')
  .where('booking.roomId = :roomId', { roomId: room.id })
  .andWhere('booking.date = :date', { date })
  .andWhere('booking.start_time < :newEnd AND booking.end_time > :newStart', { 
    newStart, 
    newEnd 
  })
  .getOne();

if (overlappingBooking) {
  throw new BadRequestException('The selected time overlaps with an existing booking');
}


  // Calculate room price
  let roomPrice: number = await this.settingsService.getHourlyPrice('hour_price_global');
  if (!roomPrice) {
    throw new BadRequestException('No room price found at the moment!');
  }

  // Apply promo code if exists
  if (promo_code) {
    const promo = await this.promocodeRepo
      .createQueryBuilder('promo')
      .where('promo.code = :code', { code: promo_code })
      .andWhere('promo.valid_from <= :now', { now: new Date() })
      .andWhere('promo.valid_to >= :now', { now: new Date() })
      .getOne();

    if (!promo) throw new BadRequestException('Invalid or expired promo code');

    if (promo.used_count >= promo.usage_limit) {
      throw new BadRequestException('Promo code has reached its usage limit');
    }

    const userUsage = await this.bookingRepo
      .createQueryBuilder('booking')
      .where('booking.userId = :userId', { userId: currentUser.id })
      .andWhere('booking.promo_code = :code', { code: promo_code })
      .getCount();

    if (userUsage >= promo.per_user_limit) {
      throw new BadRequestException('You have reached the promo code usage limit');
    }

    if (promo.discount_type === 'percentage') {
      roomPrice *= 1 - promo.discount_value / 100;
    } else {
      roomPrice -= promo.discount_value;
    }

    // increment promo usage
    promo.used_count += 1;
    await this.promocodeRepo.save(promo);
  }

  // Create and save booking
  const booking = this.bookingRepo.create({
   start_time:newStart,
   end_time:newEnd,
    date,
    weekday,
    room,
    user: { id: currentUser.id },
    price: roomPrice,
    promo_code: promo_code || undefined,
    status: BookingStatus.CONFIRMED,
  });

  return this.bookingRepo.save(booking);
}

// Convert "hh:mm AM/PM" to total minutes // eg "04:30 am" 
public convertTimeToMinutes(timeStr: string): number {
  if (!timeStr) throw new BadRequestException('Invalid time provided');

  const parts = timeStr.trim().split(' ');
  const time = parts[0];
  const period = parts[1]?.toLowerCase(); // ? => to check first if it is not undefine then appy the next function to avoide the app crach.

  let [hours, minutes] = time.split(':').map(Number); // .map(Number) to cast the strings to numbers and map cz it is an arry.  

  // to get the all in 24h sys not 12h  
  if (period === 'pm' && hours !== 12) hours += 12; 
  if (period === 'am' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

  async findAll() {
    const allBookings =await this.bookingRepo.find();
    if(!allBookings.length || allBookings === undefined){
      throw new BadRequestException('Sorry, there is no bookings exists!')
    }
    return allBookings;
  }

 async findOne(id: number) {
    const booking = await this.bookingRepo.findOne({where:{id}});

     if(!booking){
      throw new BadRequestException(`Sorry, there is no booking with this ID ${id} exists!`)
    }

    return booking;
  }

  async update(id: number, updateBookingDto: UpdateBookingDto) {
    // get the booking 
    const booking = await this.findOne(id);

    // update it 
    Object.assign(booking, updateBookingDto);

    // save it 
    return this.bookingRepo.save(booking);
  }

  async removeAll() {
    const bookings =await this.findAll()

    if(!bookings){
      throw new BadRequestException('Sorry, no bookings!')
    }
    return this.bookingRepo.remove(bookings);
  }

  async removeOne(id:number){
        const booking = await this.findOne(id);
        return this.bookingRepo.remove(booking);
  }

}
