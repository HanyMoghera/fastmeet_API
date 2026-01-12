import { IsEnum, IsString } from "class-validator";
import { settingKey } from "../entities/setting.entity";


export class CreateSettingDto {

    @IsEnum(settingKey)
    key: settingKey;

    @IsString()
    value:string

}
