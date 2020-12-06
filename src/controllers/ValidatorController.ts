// Packages
import { 
    Controller,
    Get, 
    Headers,
    HttpException, 
    HttpStatus,
    UseGuards
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
// Configs
import {AuthGuard} from "../configs/AuthGuard";
// Entities
import { DbSession } from "../entities/DbSession";
// Services
import { Blocklist } from "./../services/Blocklist";
import { Environment } from "../services/Environment";
import { Token } from "../services/Token";
// DTOs
import { OutgoingErrorMessage } from "./DTOs/OutgoingErrorMessage";

@Controller()
export class ValidatorController {
    constructor(
        private readonly blocklistService: Blocklist,
        private readonly envService: Environment,
        private readonly tokenService: Token,
        @InjectRepository(DbSession)
        private dbSessionRepository: Repository<DbSession>
    ) {
    }

    @Get("/auth/isValid")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Successful'})
    @ApiResponse({ status: 400, description: 'Invalid credentials sent through', type: OutgoingErrorMessage})
    @ApiResponse({ status: 500, description: 'Server error', type: OutgoingErrorMessage})
    async validate(): Promise<any> {
        // The auth guard does all the job, this endpoint exists only to trigger the function of the auth guard
    }
}