import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class IncomingPasswordChange {
    @ApiProperty()
    @IsString()
    password: string;

    @ApiProperty()
    @IsString()
    newPassword: string;
}