import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsEmail, IsNumber } from 'class-validator';

@Exclude()
export class OutgoingUser {
    @Expose() 
    @IsNumber()
    id: number;

    @Expose()
    @IsEmail()
    email: string;
    
    @Expose()
    @IsBoolean()
    accountActive: boolean;

    password: string;

    addedDate: Date;
}