// Packages
import { 
    Body, 
    Controller, 
    HttpException, 
    HttpStatus,
    Post, 
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { 
    ApiResponse
} from '@nestjs/swagger';
// Services
import { Logger } from "../services/Logger";
import { Password } from '../services/Password';
import { Token } from "../services/Token";
// Entities
import { DbSession } from "../entities/DbSession";
import { User } from "../entities/User";
// DTOs
import { IncomingCrendetials } from "./DTOs/IncomingCredentials";
import { OutgoingErrorMessage } from "./DTOs/OutgoingErrorMessage";
import { OutgoingTokens } from "./DTOs/OutgoingTokens";


const invalidCredentialsError = new HttpException({
    statusCode: HttpStatus.BAD_REQUEST,
    message: "Invalid credentials",
}, HttpStatus.BAD_REQUEST);

const inactiveAccountError = new HttpException({
    statusCode: HttpStatus.BAD_REQUEST,
    message: "Account is not active",
}, HttpStatus.BAD_REQUEST);

@Controller()
export class LoginController {
    constructor(
        private readonly logger: Logger,
        private readonly passwordService: Password,
        private readonly tokenService: Token,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(DbSession)
        private dbSessionRepository: Repository<DbSession>,
        private configService: ConfigService
    ) {
    }

    @Post("/auth/login")
    @ApiResponse({ status: 200, description: 'Authentication successful', type: OutgoingTokens})
    @ApiResponse({ status: 400, description: 'Invalid credentials sent through', type: OutgoingErrorMessage})
    @ApiResponse({ status: 500, description: 'Server error', type: OutgoingErrorMessage})
    async login(
        @Body()
            credentials: IncomingCrendetials
    ): Promise<OutgoingTokens> {
        const PASSWORD_PEPPER = this.configService.get<string>('PASSWORD_PEPPER');
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

        if(!user.accountActive) {
            throw inactiveAccountError;
        }

        const accessToken = this.tokenService.sign(
            { id: user.id, email: user.email },
            this.configService.get<string>('TOKEN_ENCRYPTION_KEY'),
            {
                expiresIn: this.configService.get<number>('ACCESS_TOKEN_EXPIRE_TIME'),
            }
        );

        const refreshToken = this.tokenService.sign(
            { id: user.id, email: user.email, isRefresh: true },
            this.configService.get<string>('TOKEN_ENCRYPTION_KEY'),
            {
                expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRE_TIME'),
            }
        );
        
        const response = new OutgoingTokens();
        response.bearer = { token: accessToken };
        response.refresh = {token: refreshToken };

        if(this.configService.get<string>('DB_SESSIONS')) {
            const dbSession = new DbSession();
            dbSession.token = accessToken;
            dbSession.user = user;
            await this.dbSessionRepository.save(dbSession);
        }

        return response;
    }
}