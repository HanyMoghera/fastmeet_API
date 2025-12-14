import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
     private readonly repo:Repository<User>){}


  create({first_name, last_name, password, email, isAdmin}: CreateUserDto) {
    const user = this.repo.create({first_name, last_name, password, email, isAdmin})
    return this.repo.save(user);
  }

  find(email: string){
    return this.repo.find({where:{email}}) 
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOne({where:{id}});
  }


  async update(id: number, attrs: Partial<User>){
    // get the user 
    const user = await this.findOne(id)
    if(!user){
        throw new NotFoundException('User not found!')
    }
    // check the changes in the old user and the new one and assign the new in the old one 
    Object.assign(user, attrs)
    // save the new data to the database 
    return this.repo.save(user)
    
}


  async remove(id: number){
        // get the user 
      const user = await this.findOne(id)

    if(!user){
          throw new NotFoundException('User not found!')
      }
      // save the Entity with the deleted user 
      return this.repo.remove(user)

  }
}
