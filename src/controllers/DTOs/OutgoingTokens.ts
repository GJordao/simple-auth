import { IsString } from 'class-validator';



class BearerToken {
    @IsString()
    token: string

    static token_type = "bearer";
}

class RefreshToken {
    @IsString()
    token: string

    static token_type = "refresh";
}

export class OutgoingTokens {
    bearer: BearerToken;

    refresh: RefreshToken;
}