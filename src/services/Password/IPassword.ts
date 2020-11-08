export interface IPassword {
    compare(passwordToCompare: string, originalPassword: string) : Promise<any>
    hash(password) : Promise<string>
}