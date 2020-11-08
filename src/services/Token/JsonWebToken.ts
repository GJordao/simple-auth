import { Injectable } from '@nestjs/common';
import { IToken } from "./IToken";
import { sign, verify } from "jsonwebtoken";

@Injectable()
export class JsonWebToken implements IToken {
    sign(...args: any[]): string {
        return sign(...args);
    }

    verify(...args: any[]): any {
        return verify(...args);
    }
    
}