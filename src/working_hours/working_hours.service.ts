import {BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkingHoursDto } from './dto/create-working_hour.dto';
import { UpdateWorkingHourDto } from './dto/update-working_hour.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkingHour } from './entities/working_hour.entity';
import { Repository } from 'typeorm';
import { Room } from 'src/rooms/entities/room.entity';
import { BookingService } from 'src/booking/booking.service';

@Injectable()
export class WorkingHoursService {

  constructor(
    @InjectRepository(WorkingHour)
    private readonly repo: Repository<WorkingHour>,

    @InjectRepository(Room)
    private readonly RoomRepo: Repository<Room>,

    private readonly bookingService: BookingService
  ){}


async create(dto: CreateWorkingHoursDto){
  const roomId = dto.roomId;

  let { weekday, start_time , end_time, date } = dto;

  // check room existence
  const room = await this.RoomRepo.findOne({ where: { id: roomId } });
  if (!room) {
    throw new NotFoundException(`There is no Room with this ID: ${roomId}`);
  }


  // 2. Count working hours for this room
  const workingHoursCount = await this.repo.count({
    where: {
       room: { id: roomId },
       date: date
      },
  });

  if (workingHoursCount > 0) {
    throw new BadRequestException(
      `Room with ID ${roomId} already has working hours`
    );
  }

  // convert the time and the date to time stamp
const startTime = dateAnd12hTimeToTimestamp(date, start_time);
const endTime = dateAnd12hTimeToTimestamp(date, end_time);


const workingHours:WorkingHour = this.repo.create({
  weekday,
   start_time:startTime,
    end_time:endTime,
     date,
      room
    });

if(!workingHours){
  throw new BadRequestException('Sorry, something bad happened while creating tge working hour!')
}
 return this.repo.save(workingHours);
}

async findAll() {
    const workingHours = await this.repo.find();
    const count = workingHours.length;

    return [count, workingHours]
  }

 async find_one(id: number) {
    const workingHours = await this.repo.findOne({
      where: {id},
       relations: ['room']
    });
    if(!workingHours){
      throw new NotFoundException('No such working hours!')
    }
    return workingHours; 
  }

async update(id: number, updateDto: UpdateWorkingHourDto) {

  const oldRecord = await this.find_one(id);

  if (!oldRecord) {
    throw new BadRequestException('No such working hours!');
  }

  const transformedDto = {
    ...updateDto,
    start_time: updateDto.start_time
      ? dateAnd12hTimeToTimestamp(oldRecord.date, updateDto.start_time)
      : oldRecord.start_time,
    end_time: updateDto.end_time
      ? dateAnd12hTimeToTimestamp(oldRecord.date, updateDto.end_time)
      : oldRecord.end_time,
    date: updateDto.date ?? oldRecord.date,
  };

  Object.assign(oldRecord, transformedDto);
  return this.repo.save(oldRecord);
}


async remove(id: number) {
      // get the workingHours 
        const workingHours = await this.find_one(id);

      // check if exists 
      if(!workingHours){
        throw new NotFoundException('No such working Hours')
      }
    return this.repo.remove(workingHours);
  }  
}

export function dateAnd12hTimeToTimestamp(
  dateStr: string,
  timeStr: string,
  nextDay = false, // use true if end time is past midnight
): number {
  if (!timeStr) {
    throw new BadRequestException('Time is required.');
  }

  const normalized = String(timeStr)
    .replace(/[\u00A0\r\n\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (!match) {
    throw new BadRequestException(
      `Invalid time format: "${timeStr}". Use 12-hour format like "10:00 am".`
    );
  }

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3];

  if (hours < 1 || hours > 12 || minutes > 59) {
    throw new BadRequestException('Invalid time values.');
  }

  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;

  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCHours(hours, minutes, 0, 0);

  if (nextDay) {
    date.setUTCDate(date.getUTCDate() + 1); // move to next day for end times past midnight
  }

  return date.getTime();
}

export function timestampToReadableTime(
  timestamp: number | string,
  locale = 'en-US',
  timeZone = 'UTC',
): string {
  const ts = typeof timestamp === 'string' ? Number(timestamp) : timestamp;
  if (!ts || isNaN(ts)) return 'Invalid Date';

  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone,
  }).format(ts);
}





 