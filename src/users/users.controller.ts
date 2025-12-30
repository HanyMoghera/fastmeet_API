import {
  Controller,
  Post,
  Body,
  Session,
  Get,
  UseGuards,
  Patch,
  Param,
  ParseIntPipe,
  Delete
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/Login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from './auth.service';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { AuthGuard } from 'src/guards/auth.guard';
import { AdminGuard } from 'src/guards/admin.guard';
import { UsersService } from './users.service';
import { Serialize } from 'src/interceptors/serialization.interceptor';
import { UserDto } from './dto/user.dto';

@Controller('auth')
export class UsersController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService
  ) {}
  
  @Serialize(UserDto)
  @Post('/signup')
  async signup(
    @Session() session: any,
    @Body() body: CreateUserDto,
  ) {
    const user = await this.authService.signup(
      body.first_name,
      body.last_name,
      body.email,
      body.password,
      body.isAdmin,
    );
      
    session.userId = user.id; 

    return user;
  }
  @Serialize(UserDto)
  @Post('/signin')
  async signin(
    @Session() session: any,
    @Body() body: LoginUserDto,
  ) {
    const user = await this.authService.signin(
      body.email,
      body.password,
    );

    session.userId = user.id; 

    return user;
  }

  @Post('/signout')
    signout(@Session() session: any){
        session.userId = null;
    }
 


  // get user info
  @Serialize(UserDto)
  @UseGuards(AuthGuard)
  @Get('/me')
  whoAmI(@CurrentUser() user: User){
      return user; 
  }

  
  // get all users 
  @Serialize(UserDto)
  @UseGuards(AdminGuard)
  @Get('/findAll')
  async findAll(){
    const users = await this.userService.findAll();
    return users;
  }

  // update a user for admin 
  @UseGuards(AdminGuard)
  @Patch('/:id')
    updateUser(
      @Param('id', ParseIntPipe) id: number,
      @Body() body: UpdateUserDto
  ){
    return this.userService.update(id, body); 
  }


  // delete a user 
  @Delete('/:id')
  removeUser(@Param('id') id: string){
      return this.userService.remove(parseInt(id));  
  }

}
