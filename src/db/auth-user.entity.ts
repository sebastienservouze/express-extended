import {Column, Entity} from "typeorm";
import {MetadataEntity} from "./metadata-entity.model";
import {AuthRole} from "../service/auth/auth-role.enum";

@Entity()
export class AuthUser extends MetadataEntity {

    @Column()
    username!: string;

    @Column()
    password!: string;

    @Column({default: AuthRole.GUEST})
    role!: string;

}