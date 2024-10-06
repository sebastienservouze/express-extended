import {Column, PrimaryGeneratedColumn} from "typeorm";
import {Metadata} from "./metadata.model";

export abstract class NEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column(() => Metadata)
    metadata!: Metadata;

}