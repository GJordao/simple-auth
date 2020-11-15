import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsEmail, IsNumber } from 'class-validator';

@Exclude()
export class OutgoingUser {
    @ApiProperty()
    @Expose() 
    @IsNumber()
    id: number;

    @ApiProperty()
    @Expose()
    @IsEmail()
    email: string;
    
    @ApiProperty()
    @Expose()
    @IsBoolean()
    accountActive: boolean;

    password: string;

    addedDate: Date;
}