// Packages
import { 
    Controller,
    Delete,
    Headers,
    HttpException,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { 
    ApiBearerAuth,
    ApiResponse
} from '@nestjs/swagger';
// Configs
import {AuthGuard} from "../configs/AuthGuard";
// Entities
import { DbSession } from "../entities/DbSession";
import { User } from "./../entities/User";
// Services
import { Blocklist } from "./../services/Blocklist";
import { Environment } from "../services/Environment";
import { Logger } from "./../services/Logger";
import { Token } from "../services/Token";
// DTOs
import { OutgoingErrorMessage } from "./DTOs/OutgoingErrorMessage";

const invalidTokenError = new HttpException({
    statusCode: HttpStatus.BAD_REQUEST,
    message: "Invalid tokens sent through",
}, HttpStatus.BAD_REQUEST);

@Controller()
export class AccountController {
    constructor(
        private readonly blocklistService: Blocklist,
        private readonly envService: Environment,
        private readonly logger: Logger,
        private readonly tokenService: Token,
        @InjectRepository(DbSession)
        private dbSessionRepository: Repository<DbSession>,
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) {
    }

    @Delete("/auth/account")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'The account was deleted'})
    @ApiResponse({ status: 400, description: 'Invalid tokens sent through', type: OutgoingErrorMessage})
    @ApiResponse({ status: 500, description: 'Server error', type: OutgoingErrorMessage})
    async refresh(
        @Headers() headers
    ): Promise<any> {
        const token = headers.authorization.substr(7, headers.authorization.length - 7);
        const decodedAccessToken = this.validateAndDecodeToken(token);

        const user = await this.userRepository.findOne({
            id: decodedAccessToken.id
        });

        if(!user) {
            throw invalidTokenError;
        }

        await this.dbSessionRepository.delete({
            user: user
        });

        await this.userRepository.delete(user);
    }

    // TODO: This seems to be useful in more than one place, place it somewhere accessible
    private validateAndDecodeToken(token: string): any{
        let decodedToken = {};
        try {
            decodedToken = this.tokenService.verify(token, this.envService.TOKEN_ENCRYPTION_KEY);            
        } catch (error) {
            this.blocklistService.add(token);
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

        return decodedToken;
    } 
}