import { Injectable } from '@nestjs/common';

@Injectable()
export class Environment {
    public DATABASE_TYPE: any;
    public DATABASE_HOST: string;
    public DATABASE_PORT: number;
    public DATABASE_USERNAME: string;
    public DATABASE_PASSWORD: string;
    public DATABASE_NAME: string;
    public PASSWORD_PEPPER: string;
    public PORT: number;
    public TOKEN_ENCRYPTION_KEY: string;
    public ACCESS_TOKEN_EXPIRE_TIME: number;
    public REFRESH_TOKEN_EXPIRE_TIME: number;
    public MODE: string;
    public SMTP_HOST: string;
    public SMTP_PORT: number;
    public SMTP_SECURE: boolean;
    public SMTP_USER: string;
    public SMTP_PASSWORD: string;
    public SMTP_MAIL_FROM: string;
    public AUTH_URL: string;

    constructor() {
        this.DATABASE_TYPE = this.required(process.env.DATABASE_TYPE);
        this.DATABASE_HOST = this.required(process.env.DATABASE_HOST);
        this.DATABASE_PORT = this.required(process.env.DATABASE_PORT);
        this.DATABASE_USERNAME = this.required(process.env.DATABASE_USERNAME);
        this.DATABASE_PASSWORD = this.required(process.env.DATABASE_PASSWORD);
        this.DATABASE_NAME = this.required(process.env.DATABASE_NAME);
        this.PASSWORD_PEPPER = this.defaultIfNotEmpty(process.env.PASSWORD_PEPPER, "");
        this.PORT = this.defaultIfNotEmpty(this.number(process.env.PORT), 5000);
        this.TOKEN_ENCRYPTION_KEY = this.required(process.env.TOKEN_ENCRYPTION_KEY);
        this.ACCESS_TOKEN_EXPIRE_TIME = this.defaultIfNotEmpty(this.number(process.env.ACCESS_TOKEN_EXPIRE_TIME), 600);
        this.REFRESH_TOKEN_EXPIRE_TIME = this.defaultIfNotEmpty(this.number(process.env.REFRESH_TOKEN_EXPIRE_TIME), 2629743);
        this.MODE = this.defaultIfNotEmpty(process.env.MODE, "prod");
        this.SMTP_HOST = this.defaultIfNotEmpty(process.env.SMTP_HOST, "");
        this.SMTP_PORT = this.defaultIfNotEmpty(this.number(process.env.SMTP_PORT), undefined);
        this.SMTP_SECURE = this.boolean(process.env.SMTP_SECURE);
        this.SMTP_USER = this.defaultIfNotEmpty(process.env.SMTP_USER, "");
        this.SMTP_PASSWORD = this.defaultIfNotEmpty(process.env.SMTP_PASSWORD, "");
        this.SMTP_MAIL_FROM = this.defaultIfNotEmpty(process.env.SMTP_MAIL_FROM, "");
        this.AUTH_URL = this.defaultIfNotEmpty(process.env.AUTH_URL, "");
    }

    private defaultIfNotEmpty(field, defaultValue) {
        if(field !== "" && field !== null && field !== undefined) {
            return field;
        }

        return defaultValue;
    }

    private required(field): any {
        if(field !== "" && field !== null && field !== undefined) {
            return field;
        }

        throw new Error("Missing required environment variables");
    }

    private number(field): number {
        const parsedField = parseInt(field);
        if(!isNaN(parsedField)) {
            return parsedField;
        }

        return field;
    }

    private boolean(field): boolean {
        const parsedField = Boolean(field);
        if(typeof parsedField === "boolean") {
            return parsedField;
        }

        return false;
    }
}