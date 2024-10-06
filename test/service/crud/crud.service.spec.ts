import {beforeEach} from "node:test";
import {CarService} from "../car.service";
import {TestDataSource} from "../../db/test-data-source";
import {Car} from "../../db/car.entity";

describe('CrudService', () => {

    let service: CarService;

    beforeAll(async () => {
        await TestDataSource.initialize();
        service = new CarService();
    });

    beforeEach(async () => {
        await TestDataSource.getRepository(Car).clear();
    });

    it('should create a car', async () => {
        const car = new Car();
        car.model = 'Fiesta';
        car.wheels = 4;
        car.releaseDate = new Date();
        const created = await service.create(car);

        expect(created.id).toBeDefined();
        expect(created.model).toEqual(car.model);
        expect(created.wheels).toEqual(car.wheels);
        expect(created.releaseDate).toEqual(car.releaseDate);
        expect(created.metadata.created).toBeDefined();
        expect(created.metadata.updated).toBeDefined();
        expect(created.metadata.deleted).toBeNull();
    });

    afterAll(async () => {
        await TestDataSource.destroy();
    });

});