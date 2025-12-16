import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { UpdateAmenityDto } from './dto/update-amenity.dto';
import { Repository } from 'typeorm';
import { Amentity } from './entities/amenity.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AmenitiesService {

  constructor(
    @InjectRepository(Amentity)
    private readonly repo:Repository<Amentity>
  ){}
  create(createAmenityDto: CreateAmenityDto) {
    const {name, description} = createAmenityDto;
    const amentity = this.repo.create({name, description});
    return this.repo.save(amentity);
  }

  findAll(){
    return this.repo.find();
  }

  async findOne(id: number) {
    const amentity = await this.repo.findOne({where: {id}});
    return amentity;
  }

  async remove(id: number) {
      // get the amentitiy 
        const amentity = await this.findOne(id);

      // check if exists 
      if(!amentity){
        throw new NotFoundException('no such amentity')
      }
    return this.repo.remove(amentity);
  }


   async  update(id: number, updateAmenityDto: UpdateAmenityDto) {

    // get the entity 
     const amentity = await this.findOne(id);

    //check if exist 
      if(!amentity){
        throw new NotFoundException('no such amentity')
      }

      // check the changes in the old user and the new one and assign the new in the old one 
     Object.assign(amentity, updateAmenityDto)

     // save it 
    return this.repo.save(amentity);
  }

}
