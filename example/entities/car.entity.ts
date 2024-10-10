import {Column, Entity} from "typeorm";
import {MetadataEntity} from "../../src/db/abstract-entity.model";

@Entity()
export class Car extends MetadataEntity {

    @Column()
    model!: string;

    @Column()
    wheels!: number;

    @Column({type: 'timestamptz'})
    releaseDate!: Date;

}