import {CreateDateColumn, DeleteDateColumn, UpdateDateColumn} from "typeorm";

export class Metadata {

    @CreateDateColumn()
    created!: Date;

    @UpdateDateColumn()
    updated!: Date;

    @DeleteDateColumn()
    deleted?: Date;
}