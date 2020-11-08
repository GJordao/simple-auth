import { Injectable } from '@nestjs/common';
import { IPassword } from "./IPassword";
import * as bcrypt from "bcrypt";

@Injectable()
export class Bcrypt implements IPassword {
    compare(passwordToCompare: string, originalPassword: string): Promise<any> {
        return bcrypt.compare(passwordToCompare, originalPassword);
    }
    
    async hash(password: any): Promise<string> {
        const salt = await bcrypt.genSalt();
        
        return bcrypt.hash(password, salt);
    }
}