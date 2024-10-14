import {Column, Entity} from "typeorm";
import {MetadataEntity} from "../src/db/MetadataEntity";

@Entity()
export class Car extends MetadataEntity {

    @Column()
    model!: string;

    @Column()
    wheels!: number;

    @Column()
    releaseDate!: Date;

}