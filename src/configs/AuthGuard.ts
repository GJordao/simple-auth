import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import {Request} from "express";

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request: Request = context.switchToHttp().getRequest();
        const authorizationHeader = request.headers.authorization || "";
        const token = authorizationHeader.substr(7, authorizationHeader.length - 7);
        if(token !== "") {
            return true;
        }

        return false;
    }
}