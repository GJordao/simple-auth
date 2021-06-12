import { 
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { Request } from "express";
// Entities
import { DbSession } from "../entities/DbSession";
// Services
import { Blocklist } from "./../services/Blocklist";
import { Token } from "./../services/Token";
import { ConfigServiceApi } from '../Config';

const invalidTokenError = new HttpException({
    statusCode: HttpStatus.BAD_REQUEST,
    message: "Invalid tokens sent through",
}, HttpStatus.BAD_REQUEST);

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        @Inject(Blocklist) private readonly blocklistService: Blocklist,
        @Inject(Token) private readonly tokenService: Token,
        @InjectRepository(DbSession)
        private dbSessionRepository: Repository<DbSession>,
        private configApi: ConfigServiceApi
    ) {}

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request: any = context.switchToHttp().getRequest();
        const decodedToken = this.validateAndDecodeToken(request);

        request.user = decodedToken;
        return true;
    }

    private validateAndDecodeToken(request: Request): any{
        let token = "";
        try {
            const authorizationHeader = request.headers.authorization || "";
            token = authorizationHeader.substr(7, authorizationHeader.length - 7);
            if(!token) {
                throw new UnauthorizedException();
            }
        } catch (error) {
            throw new UnauthorizedException();
        }

        let decodedToken = {};
        try {
            decodedToken = this.tokenService.verify(token, this.configApi.TOKEN_ENCRYPTION_KEY);
        } catch (error) {
            this.blocklistService.add(token);
            throw invalidTokenError;
        }
    
        if(this.configApi.DB_SESSIONS) {
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