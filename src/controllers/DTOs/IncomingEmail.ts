import { IsEmail } from 'class-validator';

export class IncomingEmail {
    @IsEmail()
    email: string;
}