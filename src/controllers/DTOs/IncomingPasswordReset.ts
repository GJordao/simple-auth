import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class IncomingPasswordReset {
    @ApiProperty()
    @IsString()
    password: string;

    @ApiProperty()
    @IsUUID()
    passwordResetId: string;
}