// Packages
import { 
    Body, 
    Controller,
    HttpException, 
    HttpStatus,
    Post
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Configs
// Services
import { Environment } from "../services/Environment";
import { Password } from '../services/Password';
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
        @InjectRepository(User)
        private usersRepository: Repository<User>
    ) {
    }

    @Post("/auth/register")
    async register(
        @Body()
            credentials: IncomingCrendetials
    ): Promise<OutgoingUser> {
        // TODO: Email validation if email server is present in env var
        // TODO: Authentication on register if env var is set
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
        // Until email validations come into place
        newUser.accountActive = true;
        newUser.email = credentials.email;
        newUser.password = passwordHash;
        await this.usersRepository.save(newUser);
    
        return plainToClass(OutgoingUser, newUser);
    }
}
