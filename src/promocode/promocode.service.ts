import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { UpdatePromocodeDto } from './dto/update-promocode.dto';
import { Repository } from 'typeorm';
import { Promocode } from './entities/promocode.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PromocodeService {

  constructor(
    @InjectRepository(Promocode)
    private readonly repo: Repository<Promocode>
  ){}
  
 async create(createPromocodeDto: CreatePromocodeDto) {

  // get user input data
  const {
    code,
    discount_type,
    discount_value,
    valid_from,
    valid_to,
    per_user_limit,
    usage_limit
  } = createPromocodeDto; 

// cretate it.
    const promocode = await this.repo.create({
    code,
    discount_type,
    discount_value,
    valid_from,
    valid_to,
    per_user_limit,
    usage_limit
  });

// check the creation 
if(!promocode){
  throw new BadRequestException('failed to create new promocode')
}

// save it
    return this.repo.save(promocode);
  }

 async findAll() {
    const promocodes = await this.repo.find();
    if(!promocodes){
      throw new NotFoundException('There is no Promocodes exist :(' )
    }
    return {
      "Count: ": promocodes.length,
      "Promocodes ": promocodes
    };
  }


  async findOne(code: string) {
    const promocode = await this.repo.findOne({where: {code}});
    if(!promocode){
      throw new NotFoundException(`There is no code :: ${code} does not exists :(` )
    }
    return promocode;
  }


  async update(id: number, updatePromocodeDto: UpdatePromocodeDto) {
    const promocode =await this.repo.findOne({where:{id}});
    if(!promocode){
      throw new NotFoundException(`There is no Promocode with this ID: ${id} exists :(` )
    }
    Object.assign(promocode, updatePromocodeDto);

    return this.repo.save(promocode);
  }


 async remove(id: number) {
    const promocode =await this.repo.findOne({where:{id}});
    if(!promocode){
      throw new NotFoundException(`There is no Promocode with this ID: ${id} exists :(` )
    }

    return this.repo.remove(promocode);
  }
}
