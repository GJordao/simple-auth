import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

class BearerToken {
    @ApiProperty()
    @IsString()
    token: string

    @ApiProperty()
    static token_type = "bearer";
}

class RefreshToken {
    @ApiProperty()
    @IsString()
    token: string

    @ApiProperty()
    static token_type = "refresh";
}

export class OutgoingTokens {
    @ApiProperty()
    bearer: BearerToken;

    @ApiProperty()
    refresh: RefreshToken;
}