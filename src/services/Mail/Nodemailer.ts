// Packages
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import {Transporter} from "nodemailer";
import * as nodemailer from "nodemailer";
// Services
import { Environment } from "./../Environment";
import { Logger } from "./../Logger";
// Utils
import { IMail } from "./IMail";

@Injectable()
export class Nodemailer implements IMail {
    private transporter: Transporter;

    constructor(
        @Inject(forwardRef(() => Environment))
        private envService: Environment,
        @Inject(forwardRef(() => Logger))
        private logger: Logger,
    ) {
        this.transporter = nodemailer.createTransport({
            host: this.envService.SMTP_HOST,
            port: this.envService.SMTP_PORT,
            secure: this.envService.SMTP_SECURE,
            requireTLS: this.envService.SMTP_REQUIRE_TLS,
            ignoreTLS: this.envService.SMTP_IGNORE_TLS,
            tls: {
                ciphers:this.envService.SMTP_TLS_CIPHERS,
            },
            auth: {
                user: this.envService.SMTP_USER,
                pass: this.envService.SMTP_PASSWORD
            },
            debug: this.envService.SMTP_DEBUG,
            logger: this.envService.SMTP_DEBUG,
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
            this.logger.log('Email service is offline');
            return false;
        }
    }
}