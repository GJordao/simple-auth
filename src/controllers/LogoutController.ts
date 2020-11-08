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
import { Token } from "../services/Token";
// DTOs
import { IncomingRefreshToken }  from "./DTOs/IncomingRefreshToken";

const invalidTokenError = new HttpException({
    status: HttpStatus.BAD_REQUEST,
    error: "Invalid tokens sent through",
}, HttpStatus.BAD_REQUEST);

@Controller()
export class LogoutController {
    constructor(
        private readonly blocklistService: Blocklist,
        private readonly envService: Environment,
        private readonly tokenService: Token,
    ) {
    }

    @Post("/auth/logout")
    @UseGuards(AuthGuard)
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
            // TODO: remove sessions from DB if env flag is enabled
        } catch (error) {
            this.blocklistService.add(token);
            this.blocklistService.add(refreshToken);
            throw error;
        }
    }
}