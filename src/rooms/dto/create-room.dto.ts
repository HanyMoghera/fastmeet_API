import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import {WorkingHourItemDto } from '../../working_hours/dto/create-working_hour.dto';

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

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => WorkingHourItemDto)
    working_hours?: WorkingHourItemDto[];

}


