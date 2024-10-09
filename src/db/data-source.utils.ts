import {DataSource} from "typeorm";
import {DataType, newDb} from "pg-mem";
import {Type} from "@nerisma/di";

export class DataSourceUtils {

    public static getInMemoryPostgresDataSource(entities: Type<any>[]): DataSource {
        const db = newDb({
            autoCreateForeignKeyIndices: true,
        });

        db.public.registerFunction({
            name: 'current_database',
            implementation: () => 'test',
        });

        db.public.registerFunction({
            name: 'version',
            implementation: () => '13.4',
        });

        db.public.registerFunction({
            name: "obj_description",
            args: [DataType.text, DataType.text],
            returns: DataType.text,
            implementation: () => "test",
        });

        return db.adapters.createTypeormDataSource({
            type: 'postgres',
            entities: entities,
            synchronize: true,
        });
    }

}