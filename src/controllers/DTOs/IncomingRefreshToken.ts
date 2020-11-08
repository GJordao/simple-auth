
import { IsJWT } from 'class-validator';

export class IncomingRefreshToken {
    @IsJWT()
    refreshToken: string;
}