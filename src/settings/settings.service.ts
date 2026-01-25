import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SettingsService {

  constructor(
    @InjectRepository(Setting)
    private readonly settingsRepo: Repository<Setting>
  ){}

 async create(createSettingDto: CreateSettingDto) {
    // check if the key already exists 
    const key = createSettingDto.key;
    const exists =await this.settingsRepo.findOne(
      {where: {key}}
    )

    if(exists){
        throw new ConflictException(`${key} already exists!`)
    }

    // create it 
    const setting = this.settingsRepo.create(createSettingDto);

    if(!setting){
      throw new InternalServerErrorException('Faild to create a new setting!')
    }

    // save it
        const savedSetting = this.settingsRepo.save(setting);

    return savedSetting;
  }

  async findAll() {
    const settings =await this.settingsRepo.find();
    if(!settings.length){
      throw new NotFoundException('Sorry there is any settings!')
    }
    return settings;
  }

  async update(key: string, updateSettingDto: UpdateSettingDto) {
    // check if the key exists 
    const existingKey =await this.settingsRepo.find({where:{key}});
    if(!existingKey){
      throw new NotFoundException('Sorry there is no such a key!')
    }
    Object.assign(updateSettingDto, existingKey);

    return this.settingsRepo.save(existingKey);
  }

 async getBookingMaxNumberPerUser(key: string): Promise<number>{

    const bookingLimit =await this.settingsRepo.findOne({where:{key}});

    if(!bookingLimit){
      throw new NotFoundException(`sorry, there is No value for ${key}.`)
    }
    return Number(bookingLimit.value);
  }

   async getHourlyPrice(key: string): Promise<number>{

    const hourlyPrice =await this.settingsRepo.findOne({where:{key}});

    if(!hourlyPrice){
      throw new NotFoundException(`sorry, there is No value for ${key}.`)
    }
    return Number(hourlyPrice.value);
  }

}
