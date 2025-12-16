import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkingHourDto } from './create-working_hour.dto';

export class UpdateWorkingHourDto extends PartialType(CreateWorkingHourDto) {}
