import {
     BadRequestException, 
     Injectable,
     NotFoundException,
     UnauthorizedException 
    } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";
import { roles } from "./entities/user.entity";
import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";
import { JwtService } from '@nestjs/jwt';


// to run the scryot to return a promise 
const scrypt = promisify(_scrypt); 


@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService
    ){}


    async signup(first_name: string , last_name: string, email:string, password:string, role: roles){

        let token:string;
        // check the existence of the user
        const users =  await this.userService.find(email);

        if(users.length){
            throw new BadRequestException('Email in use!')
        }

        const salt = randomBytes(8).toString('hex');

        const hash = await scrypt(password, salt, 32) as Buffer;
        // hash the password 

        const result = salt + '.' + hash.toString('hex');


        // create the user
        const user =await  this.userService.create({first_name, last_name,password:result, email, role});
            if(user){
           // create a token for this user. 
             const payload = {sub : user.id, username: user.first_name};
                   token = await this.jwtService.signAsync(payload);

             if(!token){
                throw new UnauthorizedException('Error happens while creating the Token!');
             }
             }else {
                 throw new BadRequestException('User not created!')
             }

        // return the user 
       return [user, token]; 

    }


    async signin(email: string, password: string){
        let token;
        // check is the user exist
        const [user] =await this.userService.find(email);
        if(!user){
            throw new NotFoundException('email does not exist!')
        }

        // compare the password 

        const [ salt, storedHash ] = user.password.split('.');

        const hash = await scrypt(password, salt, 32) as Buffer;

        if(storedHash !== hash.toString('hex')){
            throw new BadRequestException('incorrect password!')
        }


            if(user){
              // create a token for this user. 
            const payload = {sub : user.id, username: user.first_name};
                token = await this.jwtService.signAsync(payload);
            if(!token){
                throw new UnauthorizedException('Error happens while creating the Token!');
            }
            }else {
                throw new BadRequestException('User not created!')
            }

        // return the user 
          return [user, token]; 
    }

}