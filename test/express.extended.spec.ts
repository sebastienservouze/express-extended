import {CarController} from "../example/car.controller";
import {Car} from "../example/car.entity";
import {Container} from "@nerisma/di";
import {CarService} from "../example/car.service";
import {Server} from "node:http";
import expressExtended from "../src/express.extended";
import path from "path";
import {TestsUtils} from "./tests.utils";

describe("Express API DB IT", () => {

    let api: Server;

    it('should setup the API DB successfully', async () => {
        const app = expressExtended();
        await app.useDataSource(TestsUtils.dataSourceOptions);

        app.useControllers([CarController]);

        await new Promise((resolve) => {
            api = app.listen(3001, () => resolve(api))
        });

        // Create a car via service to confirm service layer & database are injected correctly
        const carService = Container.resolve<CarService>(CarService);
        const toCreate = new Car();
        toCreate.model = 'Toyota';
        toCreate.wheels = 4;
        toCreate.releaseDate = new Date();
        const createdCar = await carService.create(toCreate);

        // Consult the car via http request to confirm controller layer is injected correctly
        const response = await fetch('http://localhost:3001/cars/1');
        const consulted = await response.json() as Car;

        // Check the car returned from the API is the same as the one created
        expect(consulted.id).toEqual(createdCar.id);
        expect(consulted.model).toEqual(createdCar.model);
        expect(consulted.wheels).toEqual(createdCar.wheels);
        expect(consulted.releaseDate).toEqual(createdCar.releaseDate.toISOString());
        expect(consulted!.createdAt).toEqual(createdCar.createdAt.toISOString());
        expect(consulted!.updatedAt).toEqual(createdCar.updatedAt.toISOString());
        expect(consulted!.deletedAt).toBeNull();

        await new Promise((resolve) => {
            api.close(() => resolve(api))
        });
    });

});