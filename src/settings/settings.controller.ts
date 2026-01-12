import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Controller('admin/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  create(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.create(createSettingDto);
  }

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Patch(':key')
  update(@Param('key') key: string, @Body() updateSettingDto: UpdateSettingDto) {
    return this.settingsService.update(key, updateSettingDto);
  }

}
