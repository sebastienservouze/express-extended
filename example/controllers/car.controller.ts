import {CrudController} from "../../src/controller/crud/crud.controller";
import {Car} from "../entities/car.entity";
import {CarService} from "../services/car.service";
import {Controller} from "../../src/controller/controller.decorators";

@Controller('/cars')
export class CarController extends CrudController<Car> {

    constructor(readonly carService: CarService) {
        super(carService);
    }

}