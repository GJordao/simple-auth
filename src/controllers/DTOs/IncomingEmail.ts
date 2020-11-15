import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class IncomingEmail {
    @ApiProperty()
    @IsEmail()
    email: string;
}