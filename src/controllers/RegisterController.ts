// Packages
import { 
    Body, 
    Controller,
    Get,
    HttpException, 
    HttpStatus,
    Post,
    Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from "uuid";
// Services
import { Environment } from "../services/Environment";
import { Password } from '../services/Password';
import { Mail } from "./../services/Mail";
// Entities
import { User } from "../entities/User";
// DTOs
import { IncomingCrendetials } from "./DTOs/IncomingCredentials";
import { OutgoingUser } from "./DTOs/OutgoingUser";
import { plainToClass } from 'class-transformer';

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
    async register(
        @Body()
            credentials: IncomingCrendetials
    ): Promise<OutgoingUser> {
        const user = await this.usersRepository.findOne({ email: credentials.email });

        if (user) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: "E-mail already registered",
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

            const redirectUrl = `${this.envService.AUTH_URL}/auth/register?activationId=${newUser.activationId}`;

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
    async confirm(
        @Query("activationId")
            activationId: string
    ): Promise<any> {
        // TODO: Get redirect email from env var, this makes more sense
        const user = await this.usersRepository.findOne({ activationId: activationId });
        if(!user) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: "No account found for activation token",
            }, HttpStatus.BAD_REQUEST);
        }

        if(user.accountActive) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: "Account already active",
            }, HttpStatus.BAD_REQUEST);
        }

        user.accountActive = true;
        await this.usersRepository.update({id: user.id}, user);
    }

    /**
     * Requests a new confirmation e-mail to be sent. This will revoke the previous activation ID
     * @param email the user email
     */
    @Get("/auth/register/confirmation")
    async getConfirmationEmail(
        @Query("email")
            email: string
    ): Promise<any> {
        const isMailServiceActive = await this.mailService.isActive();
        if(!isMailServiceActive) {
            throw new HttpException({
                status: HttpStatus.SERVICE_UNAVAILABLE,
                error: "E-mail serice is not available",
            }, HttpStatus.SERVICE_UNAVAILABLE);
        }

        const user = await this.usersRepository.findOne({ email: email });
        if(!user) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: "No account found for activation token",
            }, HttpStatus.BAD_REQUEST);
        }

        if(user.accountActive) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: "Account already active",
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
