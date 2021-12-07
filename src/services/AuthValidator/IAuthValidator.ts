import { Request } from "express";

export default interface IAuthValidator {
    validateAndDecodeToken(request: Request): any;
}