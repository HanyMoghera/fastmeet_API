import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import  session from 'express-session';
import  cookieParser from 'cookie-parser';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RoomsModule } from './rooms/rooms.module';
import { APP_PIPE } from '@nestjs/core';
import { AmenitiesModule } from './amenities/amenities.module';
import { WorkingHoursModule } from './working_hours/working_hours.module';
import { HolidaysModule } from './holidays/holidays.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true, // important
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: Number(config.get('DB_PORT')),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
        entities: [join(process.cwd(), 'dist/**/*.entity.js')],
      }),
    }),

    UsersModule,
    RoomsModule,
    AmenitiesModule,
    WorkingHoursModule,
    HolidaysModule,
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      // to be able to apply and validations in DTos
      provide: APP_PIPE,
      useValue: new ValidationPipe({
      whitelist: true,
      transform: true,
      }),
    }

  ],
})


export class AppModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieParser(),
        session({
          name: 'fastmeet.sid',
          secret: this.configService.get<string>('SESSION_SECRET')!,
          resave: false,
          saveUninitialized: false,
          cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 1000 * 60 * 60 * 24,
          },
        }),
      )
      .forRoutes('*');
  }
}
