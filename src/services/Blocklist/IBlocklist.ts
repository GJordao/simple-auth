export default interface IBlocklist {
    add(value: string): void;
    exists(value: string): boolean;
    remove(value: string): void;
}