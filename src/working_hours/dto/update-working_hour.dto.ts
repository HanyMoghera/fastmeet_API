import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkingHoursDto } from './create-working_hour.dto';

export class UpdateWorkingHourDto extends PartialType(CreateWorkingHoursDto) {}
