import {CrudService} from "../../../src/service/crud/crud.service";
import {Car} from "../../db/car.entity";
import {Dependency} from "@nerisma/di";
import {DataSource} from "typeorm";

@Dependency()
export class CarService extends CrudService<Car> {

    constructor(readonly dataSource: DataSource) {
        super(dataSource.getRepository(Car));
    }

}