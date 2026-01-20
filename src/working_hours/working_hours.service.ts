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

const startTime =this.bookingService.convertTimeToMinutes(start_time);
const endTime =this.bookingService.convertTimeToMinutes(end_time);

const workingHours:WorkingHour = await this.repo.create({weekday, start_time:startTime, end_time:endTime, date, room});

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
    const workingHours = await this.repo.findOne({where: {id}});
    if(!workingHours){
      throw new NotFoundException('No such working hours!')
    }
    return workingHours;
  }


  async  update(id: number, updateWorkingHourDto: UpdateWorkingHourDto) {

    // get the entity 
     const workingHours = await this.find_one(id);

    //check if exist 
      if(!workingHours){
        throw new NotFoundException('no such workingHours')
      }

      // check the changes in the old user and the new one and assign the new in the old one 
     Object.assign(workingHours, UpdateWorkingHourDto)

     // save it 
    return this.repo.save(workingHours);
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






 