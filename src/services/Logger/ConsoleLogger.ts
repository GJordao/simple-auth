import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Environment } from "./../Environment";
import ILogger from "./ILogger";

@Injectable()
export class ConsoleLogger implements ILogger {
    constructor(
        @Inject(forwardRef(() => Environment))
        private envService: Environment,
    ) {

    }

    log(message: string): void {
        console.log(message);
    }

    debug(message: string): void {
        if(this.envService.MODE === "dev") {
            console.log(message);
        }
    }
    error(message: string): void {
        console.error(message);
    }
}