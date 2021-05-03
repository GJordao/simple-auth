import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ILogger from "./ILogger";

@Injectable()
export class ConsoleLogger implements ILogger {
    constructor(
        private configService: ConfigService
    ) {

    }

    log(message: string): void {
        console.log(message);
    }

    debug(message: string): void {
        if(this.configService.get<string>('MODE') === "dev") {
            console.log(message);
        }
    }
    error(message: string): void {
        console.error(message);
    }
}