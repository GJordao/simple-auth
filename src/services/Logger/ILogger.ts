export default interface Logger {
    log(message: string): void;
    debug(message: string): void;
    error(message: string): void;
};