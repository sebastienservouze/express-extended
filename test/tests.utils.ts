import {DataSourceOptions} from "typeorm";
import path from "path";

export abstract class TestsUtils {

    public static dataSourceOptions: DataSourceOptions = {
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        entities: [path.resolve(__dirname, '..') + '/**/*.entity{.ts,.js}'],
    };
}