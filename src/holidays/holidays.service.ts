import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { Holiday } from './entities/holiday.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class HolidaysService {

  constructor(
    @InjectRepository(Holiday)
    private readonly holidayRepository:Repository<Holiday>)
    {}

  async create(createHolidayDto: CreateHolidayDto): Promise<Holiday>  {
    const holiday = await this.holidayRepository.create(createHolidayDto);
    if (!holiday) {
    throw new BadRequestException('Somthing bad happend while creating your holiday!');
  }
    return await this.holidayRepository.save(holiday);
  }

  async findAll() {
    const holidays = await this.holidayRepository.find();
    if (!holidays) {
    throw new NotFoundException(`there is no Holidays!`);
  }
    return {
      "count": holidays.length,
      "holidays": holidays
    };
  }

  async findOne(id: number) {
     const holiday =await this.holidayRepository.findOne({where: {id}});
     if (!holiday) {
    throw new NotFoundException(`there is no Holiday with this ID: ${id}`);
  }
    return holiday;
  }


 async update(id: number, updateHolidayDto: UpdateHolidayDto) {
    const holiday = await this.findOne(id);

  if (!holiday) {
    throw new NotFoundException(`Holiday with id ${id} not found`);
  }
    Object.assign(holiday, updateHolidayDto)
    return this.holidayRepository.save(holiday);
  }

async remove(id: number): Promise<void> {
  const holiday = await this.findOne(id);
  if (!holiday) {
    throw new NotFoundException(`Holiday with id ${id} not found`);
  }
  await this.holidayRepository.remove(holiday);
}
}
