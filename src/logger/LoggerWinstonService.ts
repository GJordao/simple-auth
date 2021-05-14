import { Injectable, Logger } from '@nestjs/common';
import * as winston from 'winston';
import { mkdtemp, mkdir } from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { ConfigServiceApi } from '../Config';

const ERROR_LOG = 'error.log';
const COMBINED_LOG = 'combined.log';

const LOG_LEVELS = {
    // silly: 5,
    debug: 4,
    verbose: 3,
    // http: 3,
    // log: 2,
    info: 2,
    warn: 1,
    error: 0
};

const LOG_COLORS = {
    debug: 'magenta blackBG',
    verbose: 'blue blackBG',
    info: 'green blackBG',
    warn: 'yellow blackBG',
    error: 'red blackBG'
};

winston.addColors(LOG_COLORS);

@Injectable()
export class LoggerWinstonService extends Logger {
    winstonLogger: winston.Logger;
    logFolder: string;
    logPrefix: string;

    constructor(private configApi: ConfigServiceApi) {
        super('', true);
        this.logPrefix = configApi.LOG_FOLDER_PREFIX;
        this.setContext('Logger');

        this.winstonLogger = winston.createLogger({
            level: 'debug',
            levels: LOG_LEVELS
        });

        if (this.configApi.MODE === 'dev') {
            this.winstonLogger.add(
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    )
                })
            );
        }
    }

    async asyncSetup(): Promise<LoggerWinstonService> {
        if (this.configApi.FILE_LOGGING) {
            try {
                const targetfolder = path.join(
                    os.tmpdir(),
                    'simple-auth',
                    'logs'
                );
                await mkdir(targetfolder, { recursive: true });
                this.logFolder = await mkdtemp(
                    path.join(targetfolder, this.logPrefix)
                );
            } catch (err) {
                console.log(
                    'ERROR: Unable to create logging temp folder {"context": "Logger"}'
                );
                this.winstonLogger.error(
                    `Unable to create temp folder: ${err}`,
                    {
                        context: 'Logger'
                    }
                );
            }

            this.winstonLogger.add(
                new winston.transports.File({
                    filename: path.join(this.logFolder, ERROR_LOG),
                    level: 'error',
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.json()
                    )
                })
            );
            this.winstonLogger.add(
                new winston.transports.File({
                    filename: path.join(this.logFolder, COMBINED_LOG),
                    level: 'debug',
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.json()
                    )
                })
            );

            const fileLoggingLocationMsg = `File logging enabled: ${this.logFolder}`;
            this.info(fileLoggingLocationMsg, 'Logger');
        }

        return this;
    }

    _isLogLevelEnabled(level): boolean {
        return (
            LOG_LEVELS[level] <= LOG_LEVELS[this.configApi.LOG_LEVEL]
        );
    }

    verbose(message: any, context?: string): void {
        const _context = context ? context : this.context;
        this._isLogLevelEnabled('verbose') &&
            this.winstonLogger.verbose({ message, context: _context });
    }

    debug(message: any, context?: string): void {
        const _context = context ? context : this.context;
        this._isLogLevelEnabled('debug') &&
            this.winstonLogger.debug({ message, context: _context });
    }

    info(message: any, context?: string): void {
        this.log(message, context);
    }

    log(message: any, context?: string): void {
        const _context = context ? context : this.context;
        this._isLogLevelEnabled('info') &&
            this.winstonLogger.info({ message, context: _context });
    }

    warn(message: any, context?: string): void {
        const _context = context ? context : this.context;
        this._isLogLevelEnabled('warn') &&
            this.winstonLogger.warn({ message, context: _context });
    }

    error(message: any, context?: string): void {
        const _context = context ? context : this.context;
        this._isLogLevelEnabled('error') &&
            this.winstonLogger.error({ message, context: _context });
    }
}
