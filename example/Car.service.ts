import {CrudService} from "../src/service/Crud.service";
import {Dependency} from "@nerisma/di";
import {DataSource} from "typeorm";
import {Car} from "./Car.entity";

@Dependency()
export class CarService extends CrudService<Car> {

    constructor(dataSource: DataSource) {
        super(dataSource, Car);
    }

}