import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from './ConfigService';
import { ConfigServiceApi } from './ConfigServiceApi';

@Module({
    providers: [ConfigService, ConfigServiceApi],
    exports: [ConfigService, ConfigServiceApi]
})
export class ConfigModule extends NestConfigModule {}
