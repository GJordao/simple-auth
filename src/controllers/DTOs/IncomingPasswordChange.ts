import { IsString } from 'class-validator';

export class IncomingPasswordChange {
    @IsString()
    password: string;

    @IsString()
    newPassword: string;
}