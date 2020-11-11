import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true
    })
    email: string;

    @Column()
    password: string;

    @Column()
    accountActive: boolean;

    @Column({
        default: ""
    })
    activationId?: string;

    @CreateDateColumn()
    addedDate: Date;
}
