import { Injectable } from '@nestjs/common';
import { ConfigService } from './ConfigService';
import { EnvironmentVariables } from './validation';

@Injectable()
export class ConfigServiceApi extends EnvironmentVariables {
    constructor(private configService: ConfigService) {
        super();
        const confServ = this.configService;
        return new Proxy({} as any, {
            get(target, p) {
                return p in target
                    ? Reflect.get(target, p)
                    : confServ.get(p as string);
            }
        });
    }
}
