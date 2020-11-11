export interface IMail {
    isActive(): Promise<boolean>,
    send(to: string, subject: string, body: string): Promise<any>
}