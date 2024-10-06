import {CrudService} from "../../src/service/crud/crud.service";
import {Car} from "../db/car.entity";
import {TestDataSource} from "../db/test-data-source";
import {Dependency} from "@nerisma/di"

@Dependency()
export class CarService extends CrudService<Car> {

    constructor() {
        super(TestDataSource.getRepository(Car));
    }

}