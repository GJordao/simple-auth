import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ConfigServiceApi } from '../../Config';
import ILogger from "./ILogger";

@Injectable()
export class ConsoleLogger implements ILogger {
    constructor(
        private configApi: ConfigServiceApi
    ) {

    }

    log(message: string): void {
        console.log(message);
    }

    debug(message: string): void {
        if(this.configApi.MODE === "dev") {
            console.log(message);
        }
    }
    error(message: string): void {
        console.error(message);
    }
}