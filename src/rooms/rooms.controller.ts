import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Serialize } from 'src/interceptors/serialization.interceptor';
import { RoomResponseDto } from './dto/room.dto';

@Serialize(RoomResponseDto)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}


  @Post()
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  @Get(':id')
  find_one(@Param('id') id: string) {
    return this.roomsService.find_one(+id);
  }

  @Serialize(RoomResponseDto)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomsService.update(+id, updateRoomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomsService.remove(+id);
  }

  @Get(':id/availability')
    getAvailability( 
      @Param('id') id: string, 
      @Query('date') date: string){
        return this.roomsService.getAvailability(+id, date)
    }


}
