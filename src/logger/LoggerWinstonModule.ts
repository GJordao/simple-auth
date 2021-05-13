import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerWinstonService } from './LoggerWinstonService';

@Module({
    imports: [ConfigModule],
    providers: [LoggerWinstonService],
    exports: [LoggerWinstonService]
})
export class LoggerWinstonModule {}
