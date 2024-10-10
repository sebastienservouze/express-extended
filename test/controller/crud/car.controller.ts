import {CrudController} from "../../../src/controller/crud/crud.controller";
import {Car} from "../../entity/car.entity";
import {CarService} from "../../service/crud/car.service";
import {Controller} from "../../../src/controller/controller.decorators";

@Controller('/car')
export class CarController extends CrudController<Car> {

    constructor(readonly carService: CarService) {
        super(carService);
    }

}