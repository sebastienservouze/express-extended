import {CarService} from "./car.service";
import {Car} from "../../db/car.entity";
import {EntityNotFoundError, Like} from "typeorm";
import {TestDataSource} from "../../db/test-data-source";
import {NotMatchingIdError} from "../../../src/error/not-matching-id.error";

describe('CrudService', () => {

    let service: CarService;

    beforeAll(async () => {
        await TestDataSource.initialize();
        service = new CarService(TestDataSource.Instance);
    });

    afterEach(async () => {
        await TestDataSource.Instance.getRepository(Car).clear();
    });

    it('should find cars', async () => {
        const cars: Car[] = [];
        for (let i = 0; i < 10; i++) {
            cars.push(getCar(`Fiesta ${i}`));
        }
        await TestDataSource.Instance.getRepository(Car).save(cars);

        const page = await service.search({}, 1, 5);

        expect(page).toBeDefined();
        expect(page.total).toBe(10);
        expect(page.page).toBe(1);
        expect(page.pageSize).toBe(5);
        expect(page.data).toMatchObject(cars.slice(0, 5));
    });

    it('should not find deleted cars', async () => {
        const cars: Car[] = [];
        for (let i = 0; i < 10; i++) {
            cars.push(getCar(`Fiesta ${i}`));
        }
        await TestDataSource.Instance.getRepository(Car).save(cars);

        const toDelete = cars[1];
        toDelete.deletedAt = new Date();
        await TestDataSource.Instance.getRepository(Car).save(toDelete);

        const page = await service.search({}, 1, 5);

        expect(page).toBeDefined();
        expect(page.total).toBe(9);
        expect(page.page).toBe(1);
        expect(page.pageSize).toBe(5);
        expect(page.data).not.toContainEqual(toDelete);
    });

    it('should find cars with criteria', async () => {
        const cars: Car[] = [];
        for (let i = 0; i < 5; i++) {
            cars.push(getCar(`Fiesta ${i}`));
            cars.push(getCar(`Focus ${i}`));
        }
        await TestDataSource.Instance.getRepository(Car).save(cars);

        const page = await service.search({model: Like(`%Fiesta%`)}, 1, 5);

        expect(page).toBeDefined();
        expect(page.total).toBe(5);
        expect(page.page).toBe(1);
        expect(page.pageSize).toBe(5);
        page.data.forEach((car, i) => {
            expect(car).toMatchObject(cars[i * 2])
            expect(car.createdAt).toBeDefined();
            expect(car.updatedAt).toBeDefined();
            expect(car.deletedAt).toBeNull();
        });
    });

    it('should consult a car', async () => {
        const car = getCar();
        const created = await TestDataSource.Instance.getRepository(Car).save(car);

        const consulted = await service.consult(created.id);

        expect(consulted).toBeDefined();
        expect(consulted).toMatchObject(created);
        expect(consulted!.createdAt).toBeDefined();
        expect(consulted!.updatedAt).toBeDefined();
        expect(consulted!.deletedAt).toBeNull();
    });

    it('should not consult a deleted car', async () => {
        const car = getCar();
        const created = await TestDataSource.Instance.getRepository(Car).save(car);

        created.deletedAt = new Date();
        await TestDataSource.Instance.getRepository(Car).save(created);

        const consulted = await service.consult(created.id);

        expect(consulted).toBeNull();
    });

    it('should create a car', async () => {
        const car = getCar();
        const created = await service.create(car);

        expect(created.id).toBeDefined();
        expect(created.model).toEqual(car.model);
        expect(created.wheels).toEqual(car.wheels);
        expect(created.releaseDate).toEqual(car.releaseDate);
        expect(created.createdAt).toBeDefined();
        expect(created.updatedAt).toBeDefined();
        expect(created.deletedAt).toBeNull();
    });

    it('should update a car', async () => {
        const car = getCar();
        const created = await TestDataSource.Instance.getRepository(Car).save(car);

        created.model = 'Focus';
        const updated = await service.update(created.id, created);

        expect(updated.id).toEqual(created.id);
        expect(updated.model).toEqual('Focus');
        expect(updated.wheels).toEqual(car.wheels);
        expect(updated.releaseDate).toEqual(car.releaseDate);
        expect(updated.createdAt).toBeDefined();
        expect(updated.updatedAt).toBeDefined();
        expect(updated.updatedAt).not.toEqual(updated.createdAt);
        expect(updated.deletedAt).toBeNull();
    });

    it('should throw error when updating a non-existing car', async () => {
        const car = getCar();
        car.id = 999;
        car.model = 'Focus';

        await expect(service.update(car.id, car))
            .rejects
            .toThrow(new EntityNotFoundError(Car, 999));
    });

    it('should throw error when updating with different id & entity id', async () => {
        const car = getCar();
        const created = await TestDataSource.Instance.getRepository(Car).save(car);

        created.model = 'Focus';

        await expect(service.update(999, created))
            .rejects
            .toThrow(new NotMatchingIdError(created.id, 999));
    });

    it('should delete a car', async () => {
        const car = getCar();
        const created = await TestDataSource.Instance.getRepository(Car).save(car);

        await service.delete(created.id);

        const deleted = await TestDataSource.Instance.getRepository(Car).findOneBy({id: created.id});
        expect(deleted).toBeDefined();
        expect(deleted!.deletedAt).toBeDefined();
    });

    it('should throw error when deleting a non-existing car', async () => {
        await expect(service.delete(999))
            .rejects
            .toThrow(new EntityNotFoundError(Car, 999));
    });

    afterAll(async () => {
        await TestDataSource.Instance.destroy();
    });

});

function getCar(model: string = 'Fiesta'): Car {
    const car = new Car();
    car.model = model;
    car.wheels = 4;
    car.releaseDate = new Date();
    return car;
}