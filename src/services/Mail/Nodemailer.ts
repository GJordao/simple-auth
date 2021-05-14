// Packages
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Transporter } from 'nodemailer';
import * as nodemailer from 'nodemailer';
// Services
import { LoggerWinstonService } from '../../logger/LoggerWinstonService';
import { ConfigServiceApi } from '../../Config';
// Utils
import { IMail } from './IMail';


@Injectable()
export class Nodemailer implements IMail {
    private transporter: Transporter;

    constructor(
        private logger: LoggerWinstonService,
        private configApi: ConfigServiceApi
    ) {
        this.logger.setContext('Nodemailer');

        this.transporter = nodemailer.createTransport({
            host: this.configApi.SMTP_HOST,
            port: this.configApi.SMTP_PORT,
            secure: this.configApi.SMTP_SECURE,
            auth: {
                user: this.configApi.SMTP_USER,
                pass: this.configApi.SMTP_PASSWORD
            }
        });
    }

    send(to: string, subject: string, body: string): Promise<any> {
        return this.transporter.sendMail({
            from: 'testfornow@mydomain.com',
            to,
            subject,
            html: body
        });
    }

    async isActive(): Promise<boolean> {
        try {
            await this.transporter.verify();
            return true;
        } catch (error) {
            this.logger.warn(`Email service is offline`);
            return false;
        }
    }
}
