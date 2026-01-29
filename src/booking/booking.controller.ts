import { Controller, Get, Post, Body, Patch, Param, Delete , Headers, Query, BadRequestException} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { BookingStatus } from './entities/booking.entity';


@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  create(
    @Body() createBookingDto: CreateBookingDto,
    @CurrentUser() currentUser: User,
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    return this.bookingService.create(createBookingDto, currentUser ,idempotencyKey);
  }

  @Get()
  findAll() {
    return this.bookingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingService.update(+id, updateBookingDto);
  }

  @Delete()
  removeAll() {
    return this.bookingService.removeAll();
  }

  // to cancel the bookings by the user
  @Patch('cancel-booking/:id')
  cancelBookings(@Param('id') id: string){
   return this.bookingService.cancelBooking(+id)
  }

@Patch('admin-update-status/:id')
async adminUpdateBookingStatus(
  @Param('id') id: string,
  @Query('status') status: string
) {
  // Validate that the status is one of the enum values
  if (!Object.values(BookingStatus).includes(status as BookingStatus)) {
    throw new BadRequestException({
      message: 'Invalid status',
      details: `Status must be one of: ${Object.values(BookingStatus).join(', ')}`,
    });
  }

  // Call service with numeric id and validated status
  return this.bookingService.adminUpdateBookingStatus(+id, status as BookingStatus);
}



}
