import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateWorkingHourDto } from '../../working_hours/dto/create-working_hour.dto';

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
    @Type(() => CreateWorkingHourDto)
    working_hours?: CreateWorkingHourDto[];

}


