import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import {Request} from "express";

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        try {
            const request: Request = context.switchToHttp().getRequest();
            const authorizationHeader = request.headers.authorization || "";
            const token = authorizationHeader.substr(7, authorizationHeader.length - 7);
            if(token !== "") {
                return true;
            }

            throw new UnauthorizedException();
        } catch (error) {
            throw new UnauthorizedException();
        }
    }
}