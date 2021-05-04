// Packages
import { 
    Body,
    Controller,
    Headers,
    HttpException,
    HttpStatus,
    Post,
    UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
// Configs
import {AuthGuard} from "../configs/AuthGuard";
// Entities
import { DbSession } from "../entities/DbSession";
import { User } from "./../entities/User";
// Services
import { Blocklist } from "./../services/Blocklist";
import { Logger } from "./../services/Logger";
import { Token } from "../services/Token";
// DTOs
import { IncomingRefreshToken }  from "./DTOs/IncomingRefreshToken";
import { OutgoingErrorMessage } from "./DTOs/OutgoingErrorMessage";
import { OutgoingTokens } from "./DTOs/OutgoingTokens";
import { ConfigService } from '@nestjs/config';

const invalidTokenError = new HttpException({
    statusCode: HttpStatus.BAD_REQUEST,
    message: "Invalid tokens sent through",
}, HttpStatus.BAD_REQUEST);

@Controller()
export class RefreshController {
    constructor(
        private readonly blocklistService: Blocklist,
        private readonly logger: Logger,
        private readonly tokenService: Token,
        @InjectRepository(DbSession)
        private dbSessionRepository: Repository<DbSession>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private configService: ConfigService
    ) {
    }

    @Post("/auth/refresh")
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Successful', type: OutgoingTokens})
    @ApiResponse({ status: 400, description: 'Invalid credentials sent through', type: OutgoingErrorMessage})
    @ApiResponse({ status: 500, description: 'Server error', type: OutgoingErrorMessage})
    async refresh(
        @Headers() headers,
            @Body()
            body: IncomingRefreshToken
    ): Promise<OutgoingTokens> {
        const token = headers.authorization.substr(7, headers.authorization.length - 7);
        const refreshToken = body.refreshToken;
        try {
            const decodedAccessToken = this.tokenService.verify(
                token,
                this.configService.get<string>('TOKEN_ENCRYPTION_KEY'),
                { ignoreExpiration: true }
            );

            if(this.configService.get<boolean>('DB_SESSIONS')) {
                const exists = this.dbSessionRepository.find({
                    token: token
                });

                if(!exists) {
                    throw invalidTokenError;
                }
            }

            // This will throw an exception if the token is expired
            const decodedRefreshToken = this.tokenService.verify(
                refreshToken,
                this.configService.get<string>('TOKEN_ENCRYPTION_KEY')
            );

            if(!decodedRefreshToken.isRefresh) {
                this.logger.error("/auth/refresh - Refresh token sent is not a refresh token");
                throw invalidTokenError;  
            }

            const isAccessTokenBlocklisted = this.blocklistService.exists(token);
            const isRefreshTokenBlocklisted = this.blocklistService.exists(refreshToken);
            if(isAccessTokenBlocklisted || isRefreshTokenBlocklisted) {
                this.blocklistService.add(token);
                this.blocklistService.add(refreshToken);
                this.logger.error("/auth/refresh - Tokens used are blocklisted");
                throw invalidTokenError;
            }
            
            if (decodedAccessToken.id !== decodedRefreshToken.id) {
                this.logger.error("/auth/refresh - Access token and Refresh token do not belong to same user");
                throw invalidTokenError;
            }

            const newAccessToken = this.tokenService.sign(
                { id: decodedAccessToken.id, email: decodedAccessToken.email },
                this.configService.get<string>('TOKEN_ENCRYPTION_KEY'),
                {
                    expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRE_TIME'),
                }
            );

            this.blocklistService.add(token);
            if(this.configService.get<boolean>('DB_SESSIONS')) {
                await this.dbSessionRepository.delete({
                    token:token
                });

                const user = await this.userRepository.findOne({
                    id: decodedAccessToken.id
                });

                const dbSession = new DbSession();
                dbSession.token = newAccessToken;
                dbSession.user = user;

                await this.dbSessionRepository.save(dbSession);
            }

            const response = new OutgoingTokens();
            response.bearer = { token: newAccessToken };
            response.refresh = {token: refreshToken };

            return response;
        } catch (error) {
            this.blocklistService.add(token);
            this.blocklistService.add(refreshToken);
            
            throw error;
        }
    }
}