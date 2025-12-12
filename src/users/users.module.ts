import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule.forRoot({envFilePath: '.env'}),
    
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (config: ConfigService)=>({  
       secret:config.get('JWT_SECRET'),
       signOptions: {expiresIn: (config.get<number>('JWT_EXPIRE_IN'))}
      })
    })
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthService,ConfigService ],
})
export class UsersModule {}
