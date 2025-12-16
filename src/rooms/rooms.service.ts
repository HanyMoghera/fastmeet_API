import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RoomsService {

  constructor(
    @InjectRepository(Room)
    private readonly roomRepo: Repository <Room>
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
      
// attach the working hours in the future 
        return this.roomRepo.save(room);
      }


  findAll() {
    return this.roomRepo.find();
  }

  async find_one(id: number) {
    const room = await this.roomRepo.findOne({where: {id}});
    if(!room){
      throw new NotFoundException(`there is no room with this ID: ${id}`);
    }
    return room;
  }


  update(id: number, updateRoomDto: UpdateRoomDto) {
    return `This action updates a #${id} room`;
  }

  remove(id: number) {
    return `This action removes a #${id} room`;
  }
}
