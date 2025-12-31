import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { In, Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Amentity } from 'src/amenities/entities/amenity.entity';
import { WorkingHour } from 'src/working_hours/entities/working_hour.entity';
import type { Cache } from 'cache-manager';

@Injectable()
export class RoomsService {

  constructor(

    @InjectRepository(Room)
    private readonly roomRepo: Repository <Room>,

    @InjectRepository(Amentity)
    private readonly amentityRepo: Repository <Amentity>,

    @InjectRepository(WorkingHour)
    private readonly whRepo: Repository <WorkingHour>,


  ){}

  
  // create a room 
  async create(createRoomDto: CreateRoomDto): Promise<Room> {

    // get the input data
    const {
      name,
      capacity,
       is_active,
        amenities, 
         timezone,
          working_hours
         }= createRoomDto;

// create the room without the amentities and the working hours
    const room = this.roomRepo.create ({
       name,
        capacity, 
          is_active,
            timezone,
            });

// attach the amentities (ids) if existis in the futute 
            if(amenities?.length){
              // check if these amentities exist
              const amentities = await this.amentityRepo.find({
                where: {id: In(amenities)},
              });

              if(amentities.length !== amenities.length){
                throw new NotFoundException('One or more amentities not found!')
              }
                 room.amenities= amentities;      
            }
      
          // save the room 
      const savedRoom = await this.roomRepo.save(room);


 // create working hours
    if (working_hours?.length) {
      const workingHours = working_hours.map((wh) =>
        this.whRepo.create({
          ...wh,
          room: savedRoom,
        }),
      );

      await this.whRepo.save(workingHours);
      savedRoom.working_hours = workingHours as WorkingHour[];
    }

    return savedRoom;
      
  }

  findAll() {
    return this.roomRepo.find();
  }

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

}
