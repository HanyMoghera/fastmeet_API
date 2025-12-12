import {
   Controller, 
   Get,
    Post,
     Body,
      Patch, 
       Param, 
         Delete 
        } from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/Login-user.dto';

@Controller('auth')
export class UsersController {
  constructor(
    private readonly usersService: UsersService, 
    private readonly authService: AuthService
  ) {}


  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Post('/signup')
    async signup(@Body() body:CreateUserDto){
      const user = await this.authService.signup(body.first_name, body.last_name, body.email, body.password,body.role);
      return user;
    }


    @Post('/signin')
    async signin(@Body() body:LoginUserDto){
    const user  = await this.authService.signin(body.email, body.password)
    return user;
    }

  // @Get()
  // findAll() {
  //   return this.usersService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.usersService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
  
}
