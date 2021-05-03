// Packages
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import {Transporter} from "nodemailer";
import * as nodemailer from "nodemailer";
// Services
import { Logger } from "./../Logger";
// Utils
import { IMail } from "./IMail";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Nodemailer implements IMail {
    private transporter: Transporter;

    constructor(
        @Inject(forwardRef(() => Logger))
        private logger: Logger,
        private configService: ConfigService
    ) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('SMTP_HOST'),
            port: this.configService.get<number>('SMTP_PORT'),
            secure: this.configService.get<boolean>('SMTP_SECURE'),
            auth: {
                user: this.configService.get<string>('SMTP_USER'),
                pass: this.configService.get<string>('SMTP_PASSWORD')
            },
        });
    }

    send(to: string, subject: string, body: string): Promise<any> {
        return this.transporter.sendMail({
            from: "testfornow@mydomain.com",
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