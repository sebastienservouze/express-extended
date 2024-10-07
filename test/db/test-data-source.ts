import {DataType, newDb} from "pg-mem";
import {Car} from "./car.entity";
import {DataSource} from "typeorm";

export class TestDataSource {

    static Instance: DataSource;

    static async initialize(): Promise<void> {
        if (TestDataSource.Instance) {
            throw new Error('Data source already initialized');
        }

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

        TestDataSource.Instance = await db.adapters.createTypeormDataSource({
            type: 'postgres',
            entities: [Car],
            synchronize: true,
        });

        await TestDataSource.Instance.initialize()
    }

}