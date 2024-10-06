import {DataSource} from "typeorm";
import {Car} from "./car.entity";

export const TestDataSource = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    synchronize: true,
    logging: false,
    entities: [Car]
});