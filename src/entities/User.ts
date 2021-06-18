// Packages
import {
    Column, 
    CreateDateColumn, 
    Entity, 
    OneToMany,
    PrimaryGeneratedColumn, 
} from "typeorm";
// Entities
import { DbSession } from "./DbSession";
import { LoginLogs } from "./LoginLogs";

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

    @Column({
        default: ""
    })
    passwordResetId?: string;

    @CreateDateColumn()
    addedDate: Date;

    @OneToMany(() => DbSession, dbSession => dbSession.user)
    dbSessions: DbSession[];

    @OneToMany(() => LoginLogs, loginLogs => loginLogs.user)
    loginLogs: LoginLogs[];
}
