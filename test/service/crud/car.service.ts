import {CrudService} from "../../../src/service/crud/crud.service";
import {Car} from "../../db/car.entity";
import {DIDataSource} from "../../../src/db/di-data-source";
import {Dependency} from "@nerisma/di";

@Dependency()
export class CarService extends CrudService<Car> {

    constructor(readonly dataSource: DIDataSource) {
        super(dataSource.get().getRepository(Car));
    }

}