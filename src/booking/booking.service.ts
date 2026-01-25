import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { User } from 'src/users/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from 'src/rooms/entities/room.entity';
import { SettingsService } from 'src/settings/settings.service';
import { HolidaysService } from 'src/holidays/holidays.service';
import { Promocode } from 'src/promocode/entities/promocode.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,

    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,

    @InjectRepository(Promocode)
    private readonly promocodeRepo: Repository<Promocode>,

    private readonly settingsService: SettingsService,
    private readonly holidayService: HolidaysService,
    private readonly dataSource: DataSource,
  ) {}

async create(
  createBookingDto: CreateBookingDto,
  currentUser: User,
  idempotencyKey: string,
) {
  if (!idempotencyKey) {
    throw new BadRequestException('Idempotency key is required');
  }

  if (!currentUser) {
    throw new BadRequestException('Please login first to book a room!');
  }

  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    await queryRunner.startTransaction();

    const roomId = Number(createBookingDto.roomId);

    // Advisory lock per room
    await queryRunner.query(
      'SELECT pg_advisory_lock($1)',
      [roomId],
    );

    // Idempotency check (inside transaction)
    const existingBooking = await queryRunner.manager.findOne(Booking, {
      where: { idempotencyKey },
    });

    if (existingBooking) {
      return existingBooking;
    }

    const {
      start_time,
      end_time,
      weekday,
      promo_code,
      date,
    } = createBookingDto;

    const room = await queryRunner.manager.findOne(Room, {
      where: { id: roomId },
      relations: ['working_hours'],
    });

    if (!room) {
      throw new NotFoundException(`No room found with ID: ${roomId}`);
    }

    const newStart = this.convertTimeToMinutes(start_time);
    const newEnd = this.convertTimeToMinutes(end_time);

    if (newEnd <= newStart) {
      throw new BadRequestException('End time must be after start time');
    }

    const duration = newEnd - newStart;
    if (duration < 30 || duration > 240) {
      throw new BadRequestException('Duration must be between 30 minutes and 4 hours');
    }

    const workingHours = room.working_hours.find(
      wh => wh.date === date,
    );

    if (!workingHours) {
      throw new BadRequestException('No working hours set for this room on this date');
    }

    if (
      newStart < workingHours.start_time ||
      newEnd > workingHours.end_time
    ) {
      throw new BadRequestException('This period is outside working hours');
    }

    // Holidays check
    const holidays = await this.holidayService.findAll();
    const normalize = (d: string) =>
      new Date(d).toISOString().split('T')[0];

    for (const h of holidays.holidays) {
      if (normalize(h.date) === normalize(date)) {
        throw new BadRequestException(
          `Sorry, ${weekday} on ${date} is a holiday`,
        );
      }
    }

    // User daily booking limit
    const bookingsCount = await queryRunner.manager
      .createQueryBuilder(Booking, 'booking')
      .where('booking.userId = :userId', { userId: currentUser.id })
      .andWhere('booking.date = :date', { date })
      .getCount();

    const maxLimit =
      await this.settingsService.getBookingMaxNumberPerUser(
        'max_active_bookings_per_user_per_day',
      );

    if (bookingsCount >= maxLimit) {
      throw new BadRequestException(
        'You have exceeded the maximum number of bookings for today',
      );
    }

    // Price calculation
    let roomPrice = await this.settingsService.getHourlyPrice(
      'hour_price_global',
    );

    if (!roomPrice) {
      throw new BadRequestException('No room price found at the moment');
    }

    // Promo code
    if (promo_code) {
      const promo = await queryRunner.manager
        .createQueryBuilder(Promocode, 'promo')
        .where('promo.code = :code', { code: promo_code })
        .andWhere('promo.valid_from <= :now', { now: new Date() })
        .andWhere('promo.valid_to >= :now', { now: new Date() })
        .getOne();

      if (!promo) {
        throw new BadRequestException('Invalid or expired promo code');
      }

      if (promo.used_count >= promo.usage_limit) {
        throw new BadRequestException('Promo code usage limit reached');
      }

      const userUsage = await queryRunner.manager
        .createQueryBuilder(Booking, 'booking')
        .where('booking.userId = :userId', { userId: currentUser.id })
        .andWhere('booking.promo_code = :code', { code: promo_code })
        .getCount();

      if (userUsage >= promo.per_user_limit) {
        throw new BadRequestException(
          'You have reached the promo code usage limit',
        );
      }

      if (promo.discount_type === 'percentage') {
        roomPrice *= 1 - promo.discount_value / 100;
      } else {
        roomPrice -= promo.discount_value;
      }

      promo.used_count += 1;
      await queryRunner.manager.save(promo);
    }

    const booking = queryRunner.manager.create(Booking, {
      start_time: newStart,
      end_time: newEnd,
      date,
      weekday,
      room,
      user: { id: currentUser.id },
      price: roomPrice,
      promo_code: promo_code || undefined,
      status: BookingStatus.CONFIRMED,
      idempotencyKey,
    });

    let savedBooking: Booking;

    try {
      savedBooking = await queryRunner.manager.save(booking);
    } catch (e) {
      // Exclusion constraint violation
      if (e.code === '23P01') {
        throw new BadRequestException(
          'The selected time overlaps with an existing booking',
        );
      }
      throw e;
    }

    await queryRunner.commitTransaction();
    return savedBooking;

  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.query(
      'SELECT pg_advisory_unlock($1)',
      [Number(createBookingDto.roomId)],
    );
    await queryRunner.release();
  }
}

  public convertTimeToMinutes(timeStr: string): number {
    if (!timeStr) {
      throw new BadRequestException('Invalid time provided');
    }

    const parts = timeStr.trim().split(' ');
    const time = parts[0];
    const period = parts[1]?.toLowerCase();

    let [hours, minutes] = time.split(':').map(Number);

    if (period === 'pm' && hours !== 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  async findAll() {
    const allBookings = await this.bookingRepo.find();
    if (!allBookings.length) {
      throw new BadRequestException(
        'Sorry, there is no bookings exists!',
      );
    }
    return allBookings;
  }

  async findOne(id: number) {
    const booking = await this.bookingRepo.findOne({ where: { id } });

    if (!booking) {
      throw new BadRequestException(
        `Sorry, there is no booking with this ID ${id} exists!`,
      );
    }

    return booking;
  }

  async update(id: number, updateBookingDto: UpdateBookingDto) {
    const booking = await this.findOne(id);
    Object.assign(booking, updateBookingDto);
    return this.bookingRepo.save(booking);
  }

  async removeAll() {
    const bookings = await this.findAll();
    return this.bookingRepo.remove(bookings);
  }

  async removeOne(id: number) {
    const booking = await this.findOne(id);
    return this.bookingRepo.remove(booking);
  }
}
