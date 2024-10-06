import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {NEntity} from "../../src/db/n-entity.model";

@Entity()
export class Car extends NEntity {

    @Column()
    model!: string;

    @Column()
    wheels!: number;

    @Column({type: 'datetime'})
    releaseDate!: Date;

}