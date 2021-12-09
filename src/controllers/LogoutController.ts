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
import {
    ApiBearerAuth,
    ApiResponse,
    ApiTags
} from '@nestjs/swagger';
// Configs
import {AuthGuard} from "../configs/AuthGuard";
// Entities
import { DbSession } from "../entities/DbSession";
// Services
import { Blocklist } from "./../services/Blocklist";
import { Environment } from "../services/Environment";
import { Token } from "../services/Token";
// DTOs
import { OutgoingErrorMessage } from "./DTOs/OutgoingErrorMessage";
import { IncomingRefreshToken }  from "./DTOs/IncomingRefreshToken";

const invalidTokenError = new HttpException({
    statusCode: HttpStatus.BAD_REQUEST,
    message: "Invalid tokens sent through",
}, HttpStatus.BAD_REQUEST);

@ApiTags("simple-auth")
@Controller()
export class LogoutController {
    constructor(
        private readonly blocklistService: Blocklist,
        private readonly envService: Environment,
        private readonly tokenService: Token,
        @InjectRepository(DbSession)
        private dbSessionRepository: Repository<DbSession>
    ) {
    }

    @Post("/auth/logout")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Successful'})
    @ApiResponse({ status: 400, description: 'Invalid credentials sent through', type: OutgoingErrorMessage})
    @ApiResponse({ status: 500, description: 'Server error', type: OutgoingErrorMessage})
    async logout(
        @Headers() headers,
            @Body()
            body: IncomingRefreshToken
    ): Promise<any> {
        const token = headers.authorization.substr(7, headers.authorization.length - 7);
        const refreshToken = body.refreshToken;

        try {
            const decodedAccessToken = this.tokenService.verify(
                token,
                this.envService.TOKEN_ENCRYPTION_KEY
            );
            
            const decodedRefreshToken = this.tokenService.verify(
                refreshToken,
                this.envService.TOKEN_ENCRYPTION_KEY
            );

            if(!decodedRefreshToken.isRefresh) {
                throw invalidTokenError;
            }

            if (decodedAccessToken.id !== decodedRefreshToken.id) {
                throw invalidTokenError;
            }

            this.blocklistService.add(token);
            this.blocklistService.add(refreshToken);

            if(this.envService.DB_SESSIONS) {
                await this.dbSessionRepository.delete({
                    token:token
                });
            }
        } catch (error) {
            this.blocklistService.add(token);
            this.blocklistService.add(refreshToken);
            if(this.envService.DB_SESSIONS) {
                await this.dbSessionRepository.delete({
                    token:token
                });
            }

            throw error;
        }
    }
}