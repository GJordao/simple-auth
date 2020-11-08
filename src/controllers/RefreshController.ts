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
// Configs
import {AuthGuard} from "../configs/AuthGuard";
// Services
import { Blocklist } from "./../services/Blocklist";
import { Environment } from "../services/Environment";
import { Logger } from "./../services/Logger";
import { Token } from "../services/Token";
// DTOs
import { IncomingRefreshToken }  from "./DTOs/IncomingRefreshToken";
import { OutgoingTokens } from "./DTOs/OutgoingTokens";

const invalidTokenError = new HttpException({
    status: HttpStatus.BAD_REQUEST,
    error: "Invalid tokens sent through",
}, HttpStatus.BAD_REQUEST);

@Controller()
export class RefreshController {
    constructor(
        private readonly blocklistService: Blocklist,
        private readonly envService: Environment,
        private readonly logger: Logger,
        private readonly tokenService: Token,
    ) {
    }

    @Post("/auth/refresh")
    @UseGuards(AuthGuard)
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
                this.envService.TOKEN_ENCRYPTION_KEY,
                { ignoreExpiration: true }
            );

            // This will throw an exception if the token is expired
            const decodedRefreshToken = this.tokenService.verify(
                refreshToken,
                this.envService.TOKEN_ENCRYPTION_KEY
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
                this.envService.TOKEN_ENCRYPTION_KEY,
                {
                    expiresIn: this.envService.ACCESS_TOKEN_EXPIRE_TIME,
                }
            );

            this.blocklistService.add(token);

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