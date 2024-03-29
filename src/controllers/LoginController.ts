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
import { 
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
// Services
import { Environment } from "../services/Environment";
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

@ApiTags('simple-auth')
@Controller()
export class LoginController {
    constructor(
        private readonly envService: Environment,
        private readonly logger: Logger,
        private readonly passwordService: Password,
        private readonly tokenService: Token,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(DbSession)
        private dbSessionRepository: Repository<DbSession>
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

        if(!user.accountActive) {
            throw inactiveAccountError;
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

        if(this.envService.DB_SESSIONS) {
            const dbSession = new DbSession();
            dbSession.token = accessToken;
            dbSession.user = user;
            await this.dbSessionRepository.save(dbSession);
        }

        return response;
    }
}