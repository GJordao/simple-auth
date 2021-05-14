// Packages
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Transporter } from 'nodemailer';
import * as nodemailer from 'nodemailer';
// Services
import { Logger } from './../Logger';
// Utils
import { IMail } from './IMail';
import { ConfigServiceApi } from '../../Config';

@Injectable()
export class Nodemailer implements IMail {
    private transporter: Transporter;

    constructor(
        @Inject(forwardRef(() => Logger))
        private logger: Logger,
        private configApi: ConfigServiceApi
    ) {
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
            this.logger.log(`Email service is offiline`);
            return false;
        }
    }
}
