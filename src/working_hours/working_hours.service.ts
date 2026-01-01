import {Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkingHourDto, CreateWorkingHoursDto, WorkingHourItemDto } from './dto/create-working_hour.dto';
import { UpdateWorkingHourDto } from './dto/update-working_hour.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkingHour } from './entities/working_hour.entity';
import { Repository } from 'typeorm';
import { Room } from 'src/rooms/entities/room.entity';

@Injectable()
export class WorkingHoursService {

  constructor(
    @InjectRepository(WorkingHour)
    private readonly repo: Repository<WorkingHour>,

    @InjectRepository(Room)
    private readonly RoomRepo: Repository<WorkingHour>
  ){}

async create(
  dto: CreateWorkingHourDto | CreateWorkingHoursDto,
): Promise<WorkingHour[]> {

  const roomId = dto.roomId;
  let workingHoursData: WorkingHourItemDto[];

  // normalize input (single or multiple)
  if (Array.isArray((dto as CreateWorkingHoursDto).working_hours)) {
    workingHoursData = (dto as CreateWorkingHoursDto).working_hours;
  } else {
    const { weekday, start_time, end_time, date } =
      dto as CreateWorkingHourDto;

    workingHoursData = [{ weekday, start_time, end_time, date }];
  }

  // check room existence
  const room = await this.RoomRepo.findOne({ where: { id: roomId } });
  if (!room) {
    throw new NotFoundException(`There is no Room with this ID: ${roomId}`);
  }

  // create entities
  const workingHours = workingHoursData.map((wh) =>
    this.repo.create({
      ...wh,
      room,
    }),
  );

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






 