import {Column, PrimaryGeneratedColumn} from "typeorm";

export abstract class AbstractEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: 'timestamptz', default: () => 'NOW()'})
    createdAt!: Date;

    @Column({type: 'timestamptz', default: () => 'NOW()'})
    updatedAt!: Date;

    @Column({type: 'timestamptz', nullable: true})
    deletedAt?: Date;

}