import {Dependency} from "@nerisma/di";
import {DataSourceOptions} from "typeorm/data-source/DataSourceOptions";
import {DataSource} from "typeorm";

/**
 * This is just a wrapper to allow dependency injection
 */
@Dependency()
export class DIDataSource {

    constructor(private readonly dataSource: DataSource) {
        this.dataSource = dataSource;
    }

    public get(): DataSource {
        return this.dataSource;
    }

}