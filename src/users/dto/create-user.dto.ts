import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';


export class CreateUserDto {
  
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  first_name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  last_name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsBoolean()
  isAdmin:boolean;
}
