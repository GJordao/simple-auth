import { Injectable, Inject, forwardRef } from '@nestjs/common';
import IBlocklist from "./IBlocklist";
import { Token } from "./../Token";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MemoryBlocklist implements IBlocklist {
    private blocklist: Array<string>;

    constructor(
        @Inject(forwardRef(() => Token))
        private tokenService: Token,
        private configService: ConfigService
    ) {
        this.blocklist = [];
        setInterval(() => this.removeOldTokensFromList(), this.configService.get<number>('ACCESS_TOKEN_EXPIRE_TIME') * 1000);
    }

    add(value: string): void {
        if(!this.blocklist.find(valueInList => valueInList === value)) {
            this.blocklist.push(value);
        }
    }
    exists(value: string): boolean {
        return !!this.blocklist.find(valueInList => valueInList === value);
    }

    remove(value: string): void {
        this.blocklist = this.blocklist.filter(valueInList => valueInList !== value);
    }

    private removeOldTokensFromList(): void {
        this.blocklist = this.blocklist.filter(token => {
            try {
                this.tokenService.verify(token, this.configService.get<string>('TOKEN_ENCRYPTION_KEY'));
                return true;
            } catch (error) {
                return false;
            }
        });
    }
}