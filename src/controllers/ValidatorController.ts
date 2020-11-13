// Packages
import { 
    Controller,
    Get, 
    Headers,
    HttpException, 
    HttpStatus,
    UseGuards
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Configs
import {AuthGuard} from "../configs/AuthGuard";
// Entities
import { DbSession } from "../entities/DbSession";
// Services
import { Blocklist } from "./../services/Blocklist";
import { Environment } from "../services/Environment";
import { Token } from "../services/Token";

const invalidTokenError = new HttpException({
    status: HttpStatus.BAD_REQUEST,
    error: "Invalid token",
}, HttpStatus.BAD_REQUEST);

@Controller()
export class ValidatorController {
    constructor(
        private readonly blocklistService: Blocklist,
        private readonly envService: Environment,
        private readonly tokenService: Token,
        @InjectRepository(DbSession)
        private dbSessionRepository: Repository<DbSession>
    ) {
    }

    @Get("/auth/isValid")
    @UseGuards(AuthGuard)
    async validate(
        @Headers() headers
    ): Promise<any> {
        const token = headers.authorization.substr(7, headers.authorization.length - 7);
        try {
            this.tokenService.verify(token, this.envService.TOKEN_ENCRYPTION_KEY);            
        } catch (error) {
            throw invalidTokenError;
        }

        if(this.envService.DB_SESSIONS) {
            const exists = this.dbSessionRepository.find({
                token: token
            });

            if(!exists) {
                throw invalidTokenError;
            }
        }

        const isTokenInBlocklist = this.blocklistService.exists(token);
        if(isTokenInBlocklist) {
            throw invalidTokenError;
        }
    }
}