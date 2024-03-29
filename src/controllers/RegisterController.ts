// Packages
import { 
    Body, 
    Controller,
    Get,
    HttpException, 
    HttpStatus,
    Post,
    Redirect,
    Req,
    Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from "express";
import { v4 as uuidv4 } from "uuid";
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
// Services
import { Environment } from "../services/Environment";
import { Password } from '../services/Password';
import { Mail } from "./../services/Mail";
// Entities
import { User } from "../entities/User";
// DTOs
import { IncomingCrendetials } from "./DTOs/IncomingCredentials";
import { OutgoingErrorMessage } from "./DTOs/OutgoingErrorMessage";
import { OutgoingUser } from "./DTOs/OutgoingUser";

@ApiTags('simple-auth')
@Controller()
export class RegisterController {
    constructor(
        private readonly envService: Environment,
        private readonly passwordService: Password,
        private readonly mailService: Mail,
        @InjectRepository(User)
        private usersRepository: Repository<User>
    ) {
    }

    @Post("/auth/register")
    @ApiResponse({ status: 200, description: 'Successful', type: OutgoingUser})
    @ApiResponse({ status: 400, description: 'E-mail already registered', type: OutgoingErrorMessage})
    @ApiResponse({ status: 500, description: 'Server error', type: OutgoingErrorMessage})
    async register(
        @Body()
            credentials: IncomingCrendetials
    ): Promise<OutgoingUser> {
        const user = await this.usersRepository.findOne({ email: credentials.email });

        if (user) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "E-mail already registered",
            }, HttpStatus.BAD_REQUEST);
        }
    
        const PASSWORD_PEPPER = this.envService.PASSWORD_PEPPER;
        const password = PASSWORD_PEPPER + credentials.password;
        const passwordHash = await this.passwordService.hash(password);
    
        const newUser = new User();
        newUser.email = credentials.email;
        newUser.password = passwordHash;

        if(await this.mailService.isActive()) {
            newUser.accountActive = false;
            newUser.activationId = uuidv4();
            await this.usersRepository.save(newUser);

            const redirectUrl = `${this.envService.AUTH_URL}/auth/register/activation?activationId=${newUser.activationId}`;

            this.mailService.send(
                newUser.email,
                "Registration confirmation",
                `Welcome to our platform, to conclude your registration please click the link below: <br/><a href="${redirectUrl}">${redirectUrl}</a>`
            );
        } else {
            newUser.accountActive = true;
            await this.usersRepository.save(newUser);
        }
    
        return plainToClass(OutgoingUser, newUser);
    }

    /**
     * This will activate an account
     * @param activationId the activation ID send by mail
     */
    @Get("/auth/register/activation")
    @Redirect()
    @ApiResponse({ status: 303, description: 'Successful redirect for configured URL'})
    @ApiResponse({ status: 400, description: 'Invalid credentials sent through', type: OutgoingErrorMessage})
    @ApiResponse({ status: 500, description: 'Server error', type: OutgoingErrorMessage})
    async confirm(
        @Req() request: Request,
            @Query("activationId") activationId: string
    ): Promise<any> {
        const user = await this.usersRepository.findOne({ activationId: activationId });
        if(!user) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "No account found for activation token",
            }, HttpStatus.BAD_REQUEST);
        }

        if(user.accountActive) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Account already active",
            }, HttpStatus.BAD_REQUEST);
        }

        user.accountActive = true;
        await this.usersRepository.update({id: user.id}, user);

        let redirectUrl = this.envService.ACCOUNT_CONFIRMATION_REDIRECT_URL;
        if(redirectUrl.length === 0) {
            redirectUrl = `${request.protocol}://${request.headers.host}`;
        }

        return {
            url: redirectUrl,
            statusCode: 303
        };
    }

    /**
     * Requests a new confirmation e-mail to be sent. This will revoke the previous activation ID
     * @param email the user email
     */
    @Get("/auth/register/confirmation")
    @ApiResponse({ status: 200, description: 'Successful'})
    @ApiResponse({ status: 400, description: 'Either the token is invalid or the account is already active', type: OutgoingErrorMessage})
    @ApiResponse({ status: 500, description: 'Server error', type: OutgoingErrorMessage})
    @ApiResponse({ status: 501, description: 'E-mail service not active, it is required for this endpoint to work', type: OutgoingErrorMessage})
    async getConfirmationEmail(
        @Query("email")
            email: string
    ): Promise<any> {
        const isMailServiceActive = await this.mailService.isActive();
        if(!isMailServiceActive) {
            throw new HttpException({
                statusCode: HttpStatus.SERVICE_UNAVAILABLE,
                message: "E-mail serice is not available",
            }, HttpStatus.SERVICE_UNAVAILABLE);
        }

        const user = await this.usersRepository.findOne({ email: email });
        if(!user) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "No account found for activation token",
            }, HttpStatus.BAD_REQUEST);
        }

        if(user.accountActive) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Account already active",
            }, HttpStatus.BAD_REQUEST);
        }

        user.activationId = uuidv4();
        await this.usersRepository.update({id: user.id}, user);

        const redirectUrl = `${this.envService.AUTH_URL}/auth/register?activationId=${user.activationId}`;

        this.mailService.send(
            user.email,
            "Registration confirmation",
            `Welcome to our platform, to conclude your registration please click the link below: <br/><a href="${redirectUrl}">${redirectUrl}</a>`
        );
    
    }
}
