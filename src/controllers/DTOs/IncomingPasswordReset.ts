import { IsString, IsUUID } from 'class-validator';

export class IncomingPasswordReset {
    @IsString()
    password: string;

    @IsUUID()
    passwordResetId: string;
}