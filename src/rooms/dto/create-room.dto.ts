import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {CreateWorkingHoursDto } from '../../working_hours/dto/create-working_hour.dto';

export class CreateRoomDto {
    @IsString()
    name: string;

    @IsNumber()
    capacity: number;

    @IsString()
    @IsOptional()
    timezone?: string;

    @IsBoolean()
    @IsOptional()
    is_active?: boolean;

    @IsArray()
    @IsOptional()
    @IsNumber({}, { each: true })
    amenities?: number[]; // array of the anentities ids 

    @IsOptional()
    @Type(() => CreateWorkingHoursDto)
    working_hours?: CreateWorkingHoursDto;

}


