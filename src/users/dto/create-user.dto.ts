import { IsBoolean, IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';


export class CreateUserDto {
  
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @MinLength(2)
  first_name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @MinLength(2)
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
