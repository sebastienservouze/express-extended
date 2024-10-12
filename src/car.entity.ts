import {Column, Entity} from "typeorm";
import {MetadataEntity} from "./db/metadata-entity.model";

@Entity()
export class Car extends MetadataEntity {

    @Column()
    model!: string;

    @Column()
    wheels!: number;

    @Column()
    releaseDate!: Date;

}