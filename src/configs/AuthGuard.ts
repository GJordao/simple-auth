import { 
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from "express";

// Services
import { AuthValidator } from "./../services/AuthValidator";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        @Inject(AuthValidator) private readonly authValidatorService: AuthValidator,
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
        return this.authValidatorService.validateAndDecodeToken(request);
    } 
}