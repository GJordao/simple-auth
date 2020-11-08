export interface IToken {
    sign(...args: any[]): string
    verify(...args: any[]): any
}