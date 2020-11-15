import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';


export class OutgoingErrorMessage {
    @ApiProperty()
    @IsNumber()
    statusCode: number;

    @ApiProperty()
    @IsString()
    message: string;
}