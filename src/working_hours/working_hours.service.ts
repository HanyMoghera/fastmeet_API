import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkingHourDto } from './dto/create-working_hour.dto';
import { UpdateWorkingHourDto } from './dto/update-working_hour.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkingHour } from './entities/working_hour.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WorkingHoursService {

  constructor(
    @InjectRepository(WorkingHour)
    private readonly repo: Repository<WorkingHour>
  ){}

 create(createWorkingHourDto:CreateWorkingHourDto) {
    const {weekday, start_time, end_time, room} = createWorkingHourDto;
    const workingHours = this.repo.create({
      weekday,
       start_time, 
         end_time,
           room
        });
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






 