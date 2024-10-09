import {DataType, newDb} from "pg-mem";
import {Container, MetadataKeys} from "@nerisma/di";
import {DataSource} from "typeorm";

export class TestUtils {

    public static async initializeDataSource(...entities: any[]): Promise<void> {
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

        const dataSource = db.adapters.createTypeormDataSource({
            type: 'postgres',
            entities: entities,
            synchronize: true,
        });

        await dataSource.initialize();

        // Allow the container to resolve the DataSource
        Reflect.defineMetadata(MetadataKeys.IsDependency, true, DataSource);

        // Register the DataSource in the container
        Container.set(dataSource);
    }
}