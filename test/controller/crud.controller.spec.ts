import {CarService} from "../../example/car.service";
import {EntityNotFoundError} from "typeorm";
import {Server} from "node:http";
import {Container} from "@nerisma/di";
import {Car} from "../../example/car.entity";
import {CarController} from "../../example/car.controller";
import {Page} from "../../src/service/crud/page.type";
import expressExtended from "../../src/express.extended";
import {TestsUtils} from "../tests.utils";

describe('CrudController', () => {

    let api: Server;
    let carService: CarService;

    beforeAll(async () => {
        const app = expressExtended();
        await app.useDataSource(TestsUtils.dataSourceOptions);

        app.useControllers([CarController]);

        carService = Container.resolve(CarService);

        await new Promise((resolve) => {
            api = app.listen(3002, () => resolve(api))
        });
    });

    /*
     * Search
     */

    it('should return OK if entities found', async () => {
        const expectedData: Car[] = Array(10).fill(0).map((_, i) => getExpectedCar(i + 1));
        jest.spyOn(carService, 'search').mockResolvedValue({
            total: expectedData.length,
            page: 1,
            pageSize: expectedData.length,
            data: expectedData
        });

        const response = await fetch('http://localhost:3002/cars');
        const body = await response.json() as Page<Car>;

        expect(response.status).toEqual(200);
        expect(body.total).toEqual(expectedData.length);
        expect(body.page).toEqual(1);
        expect(body.pageSize).toEqual(expectedData.length);
        for (let i = 0; i < expectedData.length; i++) {
            expect(body.data[i].id).toEqual(expectedData[i].id);
            expect(body.data[i].model).toEqual(expectedData[i].model);
            expect(body.data[i].wheels).toEqual(expectedData[i].wheels);
            expect(body.data[i].releaseDate).toEqual(expectedData[i].releaseDate.toISOString());
            expect(body.data[i].createdAt).toEqual(expectedData[i].createdAt.toISOString());
            expect(body.data[i].updatedAt).toEqual(expectedData[i].updatedAt.toISOString());
        }
    });

    it('should return NO CONTENT if entities not found', async () => {
        jest.spyOn(carService, 'search').mockResolvedValue(null);

        const response = await fetch('http://localhost:3002/cars');

        expect(response.status).toEqual(204);
        expect(response.body).toBeNull();
    });

    it('should call search with good query parameters', async () => {
        const searchSpy = jest.spyOn(carService, 'search').mockResolvedValue(null);

        await fetch('http://localhost:3002/cars?model=foo&wheels=4&releaseDate=2021-01-01&page=2&pageSize=20');

        expect(searchSpy).toHaveBeenCalledWith({
            model: 'foo',
            wheels: '4',
            releaseDate: '2021-01-01'
        }, 2, 20);
    });

    it('should ignore unknown query parameters', async () => {
        const searchSpy = jest.spyOn(carService, 'search').mockResolvedValue(null);

        await fetch('http://localhost:3002/cars?foo=bar&page=2&pageSize=20');

        expect(searchSpy).toHaveBeenCalledWith({}, 2, 20);
    });

    it('should use default page size & page if not provided', async () => {
        const searchSpy = jest.spyOn(carService, 'search').mockResolvedValue(null);

        await fetch('http://localhost:3002/cars');

        expect(searchSpy).toHaveBeenCalledWith({}, 1, 10);
    });

    /*
     * Consult
     */

    it('should return OK if entity is found', async () => {
        const expectedData = getExpectedCar(1);
        jest.spyOn(carService, 'consult').mockResolvedValue(expectedData);

        const response = await fetch('http://localhost:3002/cars/1');
        const body = await response.json() as Car;

        expect(response.status).toEqual(200);
        expect(body.id).toEqual(expectedData.id);
        expect(body.model).toEqual(expectedData.model);
        expect(body.wheels).toEqual(expectedData.wheels);
        expect(body.releaseDate).toEqual(expectedData.releaseDate.toISOString());
        expect(body.createdAt).toEqual(expectedData.createdAt.toISOString());
        expect(body.updatedAt).toEqual(expectedData.updatedAt.toISOString());
    })

    it('should return NOT FOUND if entity is not found', async () => {
        jest.spyOn(carService, 'consult').mockResolvedValue(null);

        const response = await fetch('http://localhost:3002/cars/1');
        const body = await response.json();

        expect(response.status).toEqual(404);
        expect(body).toEqual({message: 'Entity not found'});
    });

    it('should return BAD REQUEST if ID is not a number', async () => {
        const response = await fetch('http://localhost:3002/cars/foo');
        const body = await response.json();

        expect(response.status).toEqual(400);
        expect(body).toEqual({message: 'Invalid ID'});
    });

    /*
     * Create
     */

    it('should return CREATED if entity is created', async () => {
        const car = getCar('model');
        const expectedCar = getExpectedCar(1);
        jest.spyOn(carService, 'create').mockResolvedValue(expectedCar);

        const response = await fetch('http://localhost:3002/cars', {
            method: 'POST',
            body: JSON.stringify(car),
            headers: {'Content-Type': 'application/json'}
        });
        const body = await response.json() as Car;

        expect(response.status).toEqual(201);
        expect(body.id).toEqual(expectedCar.id);
        expect(body.model).toEqual(expectedCar.model);
        expect(body.wheels).toEqual(expectedCar.wheels);
        expect(body.releaseDate).toEqual(expectedCar.releaseDate.toISOString());
        expect(body.createdAt).toEqual(expectedCar.createdAt.toISOString());
        expect(body.updatedAt).toEqual(expectedCar.updatedAt.toISOString());
    });

    it('should return BAD REQUEST if body is invalid', async () => {
        const response = await fetch('http://localhost:3002/cars', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        });
        const body = await response.json();

        expect(response.status).toEqual(400);
        expect(body).toEqual({
            message: 'Invalid body:\n' +
                '- model is required\n' +
                '- wheels is required\n' +
                '- releaseDate is required'
        });
    });

    /*
     * Update
     */

    it('should return OK if entity is updated', async () => {
        const car = getCar('model');
        car.id = 1;
        const expectedCar = getExpectedCar(car.id);
        jest.spyOn(carService, 'update').mockResolvedValue(expectedCar);

        const response = await fetch('http://localhost:3002/cars/1', {
            method: 'PUT',
            body: JSON.stringify(car),
            headers: {'Content-Type': 'application/json'}
        });
        const body = await response.json() as Car;

        expect(response.status).toEqual(200);
        expect(body.id).toEqual(expectedCar.id);
        expect(body.model).toEqual(expectedCar.model);
        expect(body.wheels).toEqual(expectedCar.wheels);
        expect(body.releaseDate).toEqual(expectedCar.releaseDate.toISOString());
        expect(body.createdAt).toEqual(expectedCar.createdAt.toISOString());
        expect(body.updatedAt).toEqual(expectedCar.updatedAt.toISOString());
    });

    it('should return BAD REQUEST if ID is not a number', async () => {
        const response = await fetch('http://localhost:3002/cars/foo', {
            method: 'PUT',
            body: JSON.stringify(getCar('model')),
            headers: {'Content-Type': 'application/json'}
        });
        const body = await response.json();

        expect(response.status).toEqual(400);
        expect(body).toEqual({message: 'Invalid ID'});
    });

    it('should return BAD REQUEST if ID in path does not match ID in body', async () => {
        const car = getCar('model');
        car.id = 1;

        const response = await fetch('http://localhost:3002/cars/2', {
            method: 'PUT',
            body: JSON.stringify(car),
            headers: {'Content-Type': 'application/json'}
        });
        const body = await response.json();

        expect(response.status).toEqual(400);
        expect(body).toEqual({message: 'ID in path does not match ID in body'});
    });

    it('should return BAD REQUEST if body is invalid', async () => {
        const response = await fetch('http://localhost:3002/cars/1', {
            method: 'PUT',
            body: JSON.stringify({
                id: 1,
                wheels: 4,
                releaseDate: '2021-01-01'
            }),
            headers: {'Content-Type': 'application/json'}
        });
        const body = await response.json();

        expect(response.status).toEqual(400);
        expect(body).toEqual({
            message: 'Invalid body:\n' +
                '- model is required'
        });
    });

    it('should return NOT FOUND if entity is not found', async () => {
        const car = getCar('model');
        car.id = 1;
        jest.spyOn(carService, 'update').mockImplementation(() => {
            throw new EntityNotFoundError(Car, 1)
        });

        const response = await fetch('http://localhost:3002/cars/1', {
            method: 'PUT',
            body: JSON.stringify(car),
            headers: {'Content-Type': 'application/json'}
        });
        const body = await response.json();

        expect(response.status).toEqual(404);
        expect(body).toEqual({message: `Could not find any entity of type "Car" matching: 1`});
    });

    /*
     * Patch
     */

    it('should return OK if entity is patched', async () => {
        const car = getCar('model');
        const expectedCar = getExpectedCar(car.id);
        jest.spyOn(carService, 'patch').mockResolvedValue(expectedCar);

        const response = await fetch('http://localhost:3002/cars/1', {
            method: 'PATCH',
            body: JSON.stringify(car),
            headers: {'Content-Type': 'application/json'}
        });
        const body = await response.json() as Car;

        expect(response.status).toEqual(200);
        expect(body.id).toEqual(expectedCar.id);
        expect(body.model).toEqual(expectedCar.model);
        expect(body.wheels).toEqual(expectedCar.wheels);
        expect(body.releaseDate).toEqual(expectedCar.releaseDate.toISOString());
        expect(body.createdAt).toEqual(expectedCar.createdAt.toISOString());
        expect(body.updatedAt).toEqual(expectedCar.updatedAt.toISOString());
    });

    it('should return BAD REQUEST if ID is not a number', async () => {
        const response = await fetch('http://localhost:3002/cars/foo', {
            method: 'PATCH',
            body: JSON.stringify(getCar('model')),
            headers: {'Content-Type': 'application/json'}
        });
        const body = await response.json();

        expect(response.status).toEqual(400);
        expect(body).toEqual({message: 'Invalid ID'});
    });

    it('should return BAD REQUEST if ID is provided in body', async () => {
        const car = getExpectedCar(1);
        const response = await fetch('http://localhost:3002/cars/1', {
            method: 'PATCH',
            body: JSON.stringify(car),
            headers: {'Content-Type': 'application/json'}
        });
        const body = await response.json();

        expect(response.status).toEqual(400);
        expect(body).toEqual({message: 'ID cannot be updated'});
    });

    it('should return BAD REQUEST if fields do not exists', async () => {
        const car = getExpectedCar(1);
        jest.spyOn(carService, 'patch').mockResolvedValue(car);
        const response = await fetch('http://localhost:3002/cars/1', {
            method: 'PATCH',
            body: JSON.stringify({
                notAField: 'foo',
                notAnotherField: 'bar'
            }),
            headers: {'Content-Type': 'application/json'}
        });
        const body = await response.json();

        expect(response.status).toEqual(400);
        expect(body).toEqual({
            message: 'Invalid body:\n' +
                '- notAField is not a valid property\n' +
                '- notAnotherField is not a valid property'
        });
    });

    it('should return NOT FOUND if entity is not found', async () => {
        const car = getCar('model');
        jest.spyOn(carService, 'patch').mockImplementation(() => {
            throw new EntityNotFoundError(Car, 1)
        });

        const response = await fetch('http://localhost:3002/cars/1', {
            method: 'PATCH',
            body: JSON.stringify(car),
            headers: {'Content-Type': 'application/json'}
        });
        const body = await response.json();

        expect(response.status).toEqual(404);
        expect(body).toEqual({message: `Could not find any entity of type "Car" matching: 1`});
    });

    /*
     * Delete
     */

    it('should return NO CONTENT if entity is deleted', async () => {
        jest.spyOn(carService, 'delete').mockResolvedValue();

        const response = await fetch('http://localhost:3002/cars/1', {
            method: 'DELETE'
        });

        expect(response.status).toEqual(204);
        expect(response.body).toBeNull();
    });

    it('should return BAD REQUEST if ID is not a number', async () => {
        const response = await fetch('http://localhost:3002/cars/foo', {
            method: 'DELETE'
        });
        const body = await response.json();

        expect(response.status).toEqual(400);
        expect(body).toEqual({message: 'Invalid ID'});
    });

    it('should return NOT FOUND if entity is not found', async () => {
        jest.spyOn(carService, 'delete').mockImplementation(() => {
            throw new EntityNotFoundError(Car, 1)
        });

        const response = await fetch('http://localhost:3002/cars/1', {
            method: 'DELETE'
        });
        const body = await response.json();

        expect(response.status).toEqual(404);
        expect(body).toEqual({message: `Could not find any entity of type "Car" matching: 1`});
    });

    afterEach(async () => {
        jest.restoreAllMocks();
    });

    afterAll((done) => {
        api.close(done);
    });
});

function getExpectedCar(id: number): Car {
    const car = new Car();
    car.id = id;
    car.model = 'model';
    car.wheels = 4;
    car.releaseDate = new Date('2021-01-01');
    car.createdAt = new Date('2021-01-02');
    car.updatedAt = new Date('2021-01-03');
    return car;
}

function getCar(model: string): Car {
    const car = new Car();
    car.model = model;
    car.wheels = 4;
    car.releaseDate = new Date('2021-01-01');
    return car;
}