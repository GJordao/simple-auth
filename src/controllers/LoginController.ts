// Packages
import { 
    Body, 
    Controller, 
    HttpException, 
    HttpStatus,
    Post, 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Services
import { Environment } from "../services/Environment";
import { Logger } from "../services/Logger";
import { Password } from '../services/Password';
import { Token } from "../services/Token";
// Entities
import { User } from "../entities/User";
// DTOs
import { IncomingCrendetials } from "./DTOs/IncomingCredentials";
import { OutgoingTokens } from "./DTOs/OutgoingTokens";

const invalidCredentialsError = new HttpException({
    status: HttpStatus.BAD_REQUEST,
    error: "Invalid credentials",
}, HttpStatus.BAD_REQUEST);

@Controller()
export class LoginController {
    constructor(
        private readonly envService: Environment,
        private readonly logger: Logger,
        private readonly passwordService: Password,
        private readonly tokenService: Token,
        @InjectRepository(User)
        private usersRepository: Repository<User>
    ) {
    }

    @Post("/auth/login")
    async login(
        @Body()
            credentials: IncomingCrendetials
    ): Promise<OutgoingTokens> {
        // TODO: Store token in DB if env flag is active perhaps
        const PASSWORD_PEPPER = this.envService.PASSWORD_PEPPER;
        const user = await this.usersRepository.findOne({ email: credentials.email });
        if (!user) {
            throw invalidCredentialsError;
        }

        const doesPasswordMatch = await this.passwordService.compare(
            PASSWORD_PEPPER + credentials.password,
            user.password
        )

        if (!doesPasswordMatch) {
            throw invalidCredentialsError;
        }

        const accessToken = this.tokenService.sign(
            { id: user.id, email: user.email },
            this.envService.TOKEN_ENCRYPTION_KEY,
            {
                expiresIn: this.envService.ACCESS_TOKEN_EXPIRE_TIME,
            }
        );

        const refreshToken = this.tokenService.sign(
            { id: user.id, email: user.email, isRefresh: true },
            this.envService.TOKEN_ENCRYPTION_KEY,
            {
                expiresIn: this.envService.ACCESS_TOKEN_EXPIRE_TIME,
            }
        );
        
        const response = new OutgoingTokens();
        response.bearer = { token: accessToken };
        response.refresh = {token: refreshToken };

        return response;
    }
}