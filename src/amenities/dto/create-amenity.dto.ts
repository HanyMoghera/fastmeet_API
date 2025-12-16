import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateAmenityDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    @MinLength(2)
    name:string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    description:string;
}