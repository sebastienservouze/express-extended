import {Column, Entity} from "typeorm";
import {AbstractEntity} from "../../src/db/abstract-entity.model";

@Entity()
export class Car extends AbstractEntity {

    @Column()
    model!: string;

    @Column()
    wheels!: number;

    @Column({type: 'timestamptz'})
    releaseDate!: Date;

}