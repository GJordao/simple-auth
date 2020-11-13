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
export class DbSession {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    token: string;

    @ManyToOne(() => User, user => user.dbSessions)
    user: User;

    @CreateDateColumn()
    addedDate: Date;
}
