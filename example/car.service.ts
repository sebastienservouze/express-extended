import {CrudService} from "../src/service/crud/crud.service";
import {Dependency} from "@nerisma/di";
import {DataSource} from "typeorm";
import {Car} from "./car.entity";

@Dependency()
export class CarService extends CrudService<Car> {

    constructor(dataSource: DataSource) {
        super(dataSource, Car);
    }

}