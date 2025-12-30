import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WorkingHoursService } from './working_hours.service';
import { CreateWorkingHourDto } from './dto/create-working_hour.dto';
import { UpdateWorkingHourDto } from './dto/update-working_hour.dto';
import { Serialize } from 'src/interceptors/serialization.interceptor';


@Controller('working-hours')
export class WorkingHoursController {
  constructor(private readonly workingHoursService: WorkingHoursService) {}

  @Post()
  create(@Body() createWorkingHourDto: CreateWorkingHourDto) {
    return this.workingHoursService.create(createWorkingHourDto);
  }

  @Get()
  findAll() {
    return this.workingHoursService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workingHoursService.find_one(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkingHourDto: UpdateWorkingHourDto) {
    return this.workingHoursService.update(+id, updateWorkingHourDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workingHoursService.remove(+id);
  }
}
