import { IsString, IsEmail } from 'class-validator';

export class IncomingCrendetials {
    @IsEmail()
    email: string;
    
    @IsString()
    password: string;
}