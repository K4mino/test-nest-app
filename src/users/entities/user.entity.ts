import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
  } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column('text')
    name: string;
    @Column('text')
    email: string;
    @Column('text')
    password: string;
    @Column('boolean')
    status: boolean;
}
