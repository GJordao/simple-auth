// Packages
import {
    Column, 
    CreateDateColumn, 
    Entity, 
    ManyToOne,
    PrimaryGeneratedColumn, 
} from "typeorm";
// Entities
import { User } from "./User";

@Entity()
export class LoginLogs {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    ip: string;

    @Column()
    successful: boolean;

    @CreateDateColumn()
    date: Date;

    @ManyToOne(() => User, user => user.loginLogs)
    user: User;
}
