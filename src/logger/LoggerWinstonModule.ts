import { Module } from '@nestjs/common';
import { ConfigModule } from '../Config';
import { LoggerWinstonService } from './LoggerWinstonService';

@Module({
    imports: [ConfigModule],
    providers: [LoggerWinstonService],
    exports: [LoggerWinstonService]
})
export class LoggerWinstonModule {}
