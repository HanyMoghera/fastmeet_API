import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { In, IsNull, Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Amentity } from 'src/amenities/entities/amenity.entity';
import { WorkingHour } from 'src/working_hours/entities/working_hour.entity';
import { WorkingHoursService } from 'src/working_hours/working_hours.service';
import { CreateWorkingHoursDto} from 'src/working_hours/dto/create-working_hour.dto';
import { Booking } from 'src/booking/entities/booking.entity';
import { BookingResponseDto } from 'src/booking/dto/booking-times.dto';
import { Holiday } from 'src/holidays/entities/holiday.entity';
import { CreateHolidayDto } from 'src/holidays/dto/create-holiday.dto';


interface SlotsResponse {
  working_hours: {
    start: string;
    end: string;
  };
  reserved_periods: BookingResponseDto[];
  holidays: CreateHolidayDto[];
}


@Injectable()
export class RoomsService {

  constructor(

    @InjectRepository(Room)
    private readonly roomRepo: Repository <Room>,

    @InjectRepository(Amentity)
    private readonly amentityRepo: Repository <Amentity>,

    @InjectRepository(WorkingHour)
    private readonly whRepo: Repository <WorkingHour>,

    @InjectRepository(Booking)
    private readonly bookingRepo: Repository <Booking>,

    @InjectRepository(Holiday)
    private readonly hollidaysRepo: Repository <Holiday>,

    private readonly workingHoursService:WorkingHoursService

  ){}
  
async create(createRoomDto: CreateRoomDto): Promise<Room> {
  const { name, capacity, is_active, amenities, timezone, working_hours } = createRoomDto;

  // create room (without relations)
  const room = this.roomRepo.create({ name, capacity, is_active, timezone });

  // attach amenities if exist
  if (amenities?.length) {
    const foundAmenities = await this.amentityRepo.find({
      where: { id: In(amenities) },
    });

    if (foundAmenities.length !== amenities.length) {
      throw new NotFoundException('One or more amenities not found!');
    }

    room.amenities = foundAmenities;
  }

  // save room first
  const savedRoom = await this.roomRepo.save(room);

  // create working hours (single)
  if (working_hours) {
    const { date, weekday, start_time, end_time } = working_hours;

    const workingHoursObject: CreateWorkingHoursDto = {
      roomId: savedRoom.id,
      date,
      weekday,
      start_time,
      end_time,
    };

    const workingHours = await this.workingHoursService.create(workingHoursObject);

    // ensure working_hours array exists before pushing
    savedRoom.working_hours = savedRoom.working_hours || [];
    savedRoom.working_hours.push(workingHours);
  }

  return savedRoom;
}
async findAll() {
      const rooms =await this.roomRepo.find({relations: ['working_hours']});
        if(!rooms.length){
          throw new BadRequestException('Sorry, there is no rooms!')
        }
  return rooms;
}
// find a room 
async find_one(id: number) {
const room = await this.roomRepo.findOne({
where: { id },
relations: ['working_hours'],
});
  if(!room){
    throw new NotFoundException(`there is no room with this ID: ${id}`);
  }
  return room;
}
// update a room
async update(id: number, updateRoomDto: UpdateRoomDto): Promise<Room> {
  // get the input data
  const { name, capacity, is_active, amenities, timezone, working_hours } = updateRoomDto;

  // find the room first
  const room = await this.roomRepo.findOne({
    where: { id },
    relations: ['amenities', 'working_hours'], 
  });

  if (!room) {
    throw new NotFoundException(`Room with ID ${id} not found`);
  }

  // update basic fields
  if (name !== undefined) room.name = name;
  if (capacity !== undefined) room.capacity = capacity;
  if (is_active !== undefined) room.is_active = is_active;
  if (timezone !== undefined) room.timezone = timezone;

  // update amenities if provided
    if (amenities?.length) {
      const existingAmenities = await this.amentityRepo.find({
        where: { id: In(amenities) },
      });

      if (existingAmenities.length !== amenities.length) {
        throw new NotFoundException('One or more amenities not found!');
      }

      room.amenities = existingAmenities;  
  }

  // save the updated room first to keep relations consistent
  const savedRoom = await this.roomRepo.save(room);


  // update working hours if provided
  if (working_hours) {
    // delete old working hours
    await this.whRepo.delete({ room: { id: savedRoom.id } });

      const newWorkingHours = await this.workingHoursService.create(working_hours);
      await this.whRepo.save(newWorkingHours);
      savedRoom.working_hours.push(newWorkingHours);
  }
  
  return savedRoom;
}
async remove(id: number): Promise<void> {
  // find the room first
  const room = await this.roomRepo.findOne({
    where: { id, deletedAt: IsNull() },
  });

  if (!room) {
    throw new NotFoundException(`Room with ID ${id} not found or already deleted`);
  }

  // check if room has any bookings
  const bookingsCount = await this.bookingRepo.count({
    where: { room: { id: room.id } },
  });

  if (bookingsCount > 0) {
    throw new BadRequestException(
      'Cannot delete room. There are existing bookings for this room.'
    );
  }
  // soft delete the room
  await this.roomRepo.softDelete(id);
}
// This function returns availability data for a specific room and date
async getAvailability(id: number, date: string) {
  // 1. Get room (validate existence)
  const room = await this.roomRepo.findOne({
    where: { id },
  });

  if (!room) {
    throw new NotFoundException(`Room with ID ${id} not found`);
  }
  console.log('We got the room!');

  // 2. Get working hours for this room & date
  const workingHour = await this.whRepo.findOne({
    where: {
      room: { id: room.id },
      date: date,
    },
  });

  if (!workingHour) {
    throw new NotFoundException(`Working hours for room ${id} on ${date} not found`);
  }
  console.log('We got the working hours!');

  const start_time = Number(workingHour.start_time);
  const end_time = Number(workingHour.end_time);

  // 3. Working hours formatted for UI
  const startWorkingTime = this.minutesTo12HourTime(start_time);
  const endWorkingTime = this.minutesTo12HourTime(end_time);

  // 4. Get bookings for this room on this date
  const bookings = await this.bookingRepo.find({
    select: ['start_time', 'end_time'],
    where: {
      room: { id: room.id },
      date: date,
    },
  });

  console.log('Bookings fetched:', bookings);

  // 5. Convert bookings into reserved periods formatted for UI
  const reservedPeriods: BookingResponseDto[] = bookings.map((booking) => ({
    start_time: this.minutesTo12HourTime(booking.start_time),
    end_time: this.minutesTo12HourTime(booking.end_time),
  }));

  // 6. Get holidays for this date
  const holidays: CreateHolidayDto[] = await this.hollidaysRepo.find({
    where: { date: date },
  });
  console.log('We got the holidays!');

  // 7. Return final availability response
  return {
    working_hours: {
      start: startWorkingTime,
      end: endWorkingTime,
    },
    reserved_periods: reservedPeriods,
    holidays: holidays,
  };
}
public minutesTo12HourTime(totalMinutes: number) {
  // normalize in case minutes > 1440 or < 0
  totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const period = hours24 >= 12 ? 'PM' : 'AM';

  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;

  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

}
