import { ApiProperty } from '@nestjs/swagger';
import { IsJWT } from 'class-validator';

export class IncomingRefreshToken {
    @ApiProperty()
    @IsJWT()
    refreshToken: string;
}