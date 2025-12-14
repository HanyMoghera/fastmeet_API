import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { UsersService } from "./users.service";
import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
  ) {}

  async signup(
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    isAdmin: boolean
  ) {
    const [existingUser] = await this.userService.find(email);
    if (existingUser) {
      throw new BadRequestException('Email in use!');
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const hashedPassword = `${salt}.${hash.toString('hex')}`;

    const user = await this.userService.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      isAdmin,
    });

    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.userService.find(email);
    if (!user) {
      throw new NotFoundException('email does not exist!');
    }

    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('incorrect password!');
    }

    return user;
  }
}
