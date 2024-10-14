import {CrudController} from "../src/web/Crud.controller";
import {Car} from "./Car.entity";
import {CarService} from "./Car.service";
import {Controller} from "../src/web/Controller.decorators";

@Controller('/cars')
export class CarController extends CrudController<Car> {

    constructor(readonly carService: CarService) {
        super(carService);
    }

}