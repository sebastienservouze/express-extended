import {Dependency} from "../../../di";
import {DataSourceOptions} from "typeorm/data-source/DataSourceOptions";
import {DataSource} from "typeorm";

/**
 * This is just a wrapper to allow dependency injection
 */
@Dependency()
export class DIDataSource extends DataSource {

    constructor(options: DataSourceOptions) {
        super(options);
    }

}