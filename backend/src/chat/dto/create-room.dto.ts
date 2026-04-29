import { IsString, IsOptional, IsEnum } from 'class-validator'

export enum RoomType {
    PUBLIC = 'PUBLIC',
    PRIVATE = 'PRIVATE',
}

export class CreateRoomDto {
    @IsString()
    name!: string;

    @IsOptional()
    @IsEnum(RoomType)
    type?: RoomType;
}