import {CrudService} from "../../../src/service/crud/crud.service";
import {Car} from "../../db/car.entity";
import {Dependency} from "@nerisma/di"
import {DIDataSource} from "../../../src/db/di-data-source";

@Dependency()
export class CarService extends CrudService<Car> {

    constructor(private readonly dataSource: DIDataSource) {
        super(dataSource.getRepository(Car));
    }

}