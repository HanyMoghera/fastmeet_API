import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { In, Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Amentity } from 'src/amenities/entities/amenity.entity';
import { WorkingHour } from 'src/working_hours/entities/working_hour.entity';
import { WorkingHoursService } from 'src/working_hours/working_hours.service';
import { CreateWorkingHourDto, CreateWorkingHoursDto, WorkingHourItemDto } from 'src/working_hours/dto/create-working_hour.dto';

@Injectable()
export class RoomsService {

  constructor(

    @InjectRepository(Room)
    private readonly roomRepo: Repository <Room>,

    @InjectRepository(Amentity)
    private readonly amentityRepo: Repository <Amentity>,

    @InjectRepository(WorkingHour)
    private readonly whRepo: Repository <WorkingHour>,

    private readonly workingHoursService:WorkingHoursService


  ){}
  
// create a room
async create(createRoomDto: CreateRoomDto): Promise<Room> {

  const {
    name,
    capacity,
    is_active,
    amenities,
    timezone,
    working_hours,
  } = createRoomDto;

  // create room (without relations)
  const room = this.roomRepo.create({
    name,
    capacity,
    is_active,
    timezone,
  });

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

  // create working hours (single or multiple)
  if (working_hours !== undefined) {
    const roomId = savedRoom.id;

    let workingHoursObject: CreateWorkingHourDto | CreateWorkingHoursDto;

    if (Array.isArray(working_hours)) {
      // multiple working hours
      workingHoursObject = {
        roomId,
        working_hours,
      };
    } else {
      // single working hour
      const { date, weekday, start_time, end_time } = working_hours;
      workingHoursObject = {
        roomId,
        date,
        weekday,
        start_time,
        end_time,
      };
    }

    const workingHours =
      await this.workingHoursService.create(workingHoursObject);

    savedRoom.working_hours = workingHours;
  }

  return savedRoom;
}


findAll() {
  return this.roomRepo.find({relations: ['working_hours']});
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
  if (working_hours?.length) {
    // delete old working hours
    await this.whRepo.delete({ room: { id: savedRoom.id } });
      const newWorkingHours = working_hours.map((wh) =>
        this.whRepo.create({
          ...wh,
          room: savedRoom,
        }),
      );
      await this.whRepo.save(newWorkingHours);
      savedRoom.working_hours = newWorkingHours as WorkingHour[];
  }
  
  return savedRoom;
}

async remove(id: number): Promise<void> {
  // find the room first
  const room = await this.roomRepo.findOne({
    where: { id },
  });

  if (!room) {
    throw new NotFoundException(`Room with ID ${id} not found`);
  }

  // remove the room
  await this.roomRepo.remove(room);
}


// this function will be used to get the aviable slots for a dat in a certain date! 
async slotGeneration(workingHours: WorkingHour[], roomId:number){

// 1- get the booking for this room in that day

// 2- generate the availiable slots from the reservide slots and the availiable one from the working hours

// 3- return the values. 

const slots =  workingHours.map((val)=>{
  return {
    start_time: val.start_time ,
    end_time:val.end_time
  }
}
);

return slots;
}

async getAvailability(id: number, date: string) {

  const room = await this.roomRepo.findOne({ where: { id } });
  if (!room) {
    throw new NotFoundException(`Room with ID ${id} not found`);
  }

  // get the working hours. 
  const workingHours = await this.whRepo.find({
    where: {
      room: { id: room.id },
      date: date,
    },
    select: ['weekday', 'start_time', 'end_time', 'date'],
  });

  if (!workingHours.length) {
    throw new NotFoundException(`No working hours found for date: ${date}`);
  }

  const slotsGeneration= await this.slotGeneration(workingHours, id); 

  return slotsGeneration;
}



}
