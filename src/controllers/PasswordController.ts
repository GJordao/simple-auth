// Packages
import { 
    Body,
    Controller,
    Get,
    Headers,
    HttpException,
    HttpStatus,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from "uuid";
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
// Configs
import {AuthGuard} from "../configs/AuthGuard";
// Entities
import { DbSession } from "../entities/DbSession";
import { User } from "./../entities/User";
// Services
import { Blocklist } from "./../services/Blocklist";
import { Environment } from "../services/Environment";
import { Logger } from "./../services/Logger";
import { Mail } from "./../services/Mail";
import { Password } from "./../services/Password";
import { Token } from "../services/Token";
// DTOs
import { IncomingEmail }  from "./DTOs/IncomingEmail";
import { IncomingPasswordChange }  from "./DTOs/IncomingPasswordChange";
import { IncomingPasswordReset }  from "./DTOs/IncomingPasswordReset";
import { OutgoingErrorMessage } from "./DTOs/OutgoingErrorMessage";

const invalidTokenError = new HttpException({
    statusCode: HttpStatus.BAD_REQUEST,
    message: "Invalid tokens sent through",
}, HttpStatus.BAD_REQUEST);

const invalidCredentialsError = new HttpException({
    statusCode: HttpStatus.BAD_REQUEST,
    message: "Wrong credentials sent through",
}, HttpStatus.BAD_REQUEST);

@Controller()
export class PasswordController {
    constructor(
        private readonly blocklistService: Blocklist,
        private readonly envService: Environment,
        private readonly logger: Logger,
        private readonly mailService: Mail,
        private readonly passwordService: Password,
        private readonly tokenService: Token,
        @InjectRepository(DbSession)
        private dbSessionRepository: Repository<DbSession>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {
    }

    @Put("/auth/password")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Successful'})
    @ApiResponse({ status: 400, description: 'Invalid credentials sent through', type: OutgoingErrorMessage})
    @ApiResponse({ status: 500, description: 'Server error', type: OutgoingErrorMessage})
    async changePassword(
        @Headers() headers,
            @Body()
            body: IncomingPasswordChange
    ): Promise<void> {
        const token = headers.authorization.substr(7, headers.authorization.length - 7);
        const decodedToken = this.validateAndDecodeToken(token);

        const user = await this.usersRepository.findOne({ email: decodedToken.email });
        if (!user) {
            throw invalidTokenError;
        }

        const PASSWORD_PEPPER = this.envService.PASSWORD_PEPPER;
        const doesPasswordMatch = await this.passwordService.compare(
            PASSWORD_PEPPER + body.password,
            user.password
        )

        if (!doesPasswordMatch) {
            throw invalidCredentialsError;
        }

        const newPassword = PASSWORD_PEPPER + body.newPassword;
        const passwordHash = await this.passwordService.hash(newPassword);
        user.password = passwordHash;
        await this.usersRepository.save(user);
    }

    @Get("/auth/password/reset")
    @ApiResponse({ status: 200, description: 'Successful'})
    @ApiResponse({ status: 400, description: 'Invalid credentials sent through', type: OutgoingErrorMessage})
    @ApiResponse({ status: 500, description: 'Server error', type: OutgoingErrorMessage})
    @ApiResponse({ status: 501, description: 'E-mail service not active, it is required for this endpoint to work', type: OutgoingErrorMessage})
    async requestPasswordReset(
        @Query()
            query: IncomingEmail
    ): Promise<void> {
        const isMailServiceActive = await this.mailService.isActive();
        if(!isMailServiceActive) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_IMPLEMENTED,
                message: "E-mail service not active",
            }, HttpStatus.NOT_IMPLEMENTED);
        }

        const user = await this.usersRepository.findOne({ email: query.email });

        if (!user) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Invalid e-mail address",
            }, HttpStatus.BAD_REQUEST);
        }
    
        user.passwordResetId = uuidv4();
        await this.usersRepository.save(user);

        const redirectUrl = `${this.envService.PASSWORD_RESET_URL}?passwordResetId=${user.passwordResetId}`;
        this.mailService.send(
            user.email,
            "Password reset",
            `A password reset was requested for your user, click the link below to reset your password <br/><a href="${redirectUrl}">${redirectUrl}</a>`
        );

    }

    @Put("/auth/password/reset")
    @ApiResponse({ status: 200, description: 'Successful'})
    @ApiResponse({ status: 400, description: 'Invalid credentials sent through', type: OutgoingErrorMessage})
    @ApiResponse({ status: 500, description: 'Server error', type: OutgoingErrorMessage})
    async resetPassword(
        @Body()
            body: IncomingPasswordReset
    ): Promise<void> {
        const user = await this.usersRepository.findOne({
            passwordResetId: body.passwordResetId
        });

        if (!user) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Invalid reset ID",
            }, HttpStatus.BAD_REQUEST);
        }

        const PASSWORD_PEPPER = this.envService.PASSWORD_PEPPER;
        const newPassword = PASSWORD_PEPPER + body.password;
        const passwordHash = await this.passwordService.hash(newPassword);
        user.password = passwordHash;
        user.passwordResetId = "";
        await this.usersRepository.save(user);

    }

    private validateAndDecodeToken(token: string): any{
        let decodedToken = {};
        try {
            decodedToken = this.tokenService.verify(token, this.envService.TOKEN_ENCRYPTION_KEY);            
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

        return decodedToken;
    } 
}