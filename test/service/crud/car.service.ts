import {CrudService} from "../../../src/service/crud/crud.service";
import {Car} from "../../db/car.entity";
import {Dependency} from "@nerisma/di"
import {TestDataSource} from "../../db/test-data-source";

@Dependency()
export class CarService extends CrudService<Car> {

    constructor() {
        super(TestDataSource.Instance.getRepository(Car));
    }

}