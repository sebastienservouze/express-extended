import {DataSource, EntityNotFoundError, Like} from "typeorm";
import {NotMatchingIdError} from "../../src/error/not-matching-id.error";
import {Container} from "@nerisma/di";
import {Car} from "../../src/car.entity";
import {CarService} from "../../example/car.service";

describe('CrudService', () => {

    let service: CarService;
    let dataSource: DataSource;

    beforeAll(async () => {
        dataSource = await new DataSource({
            type: 'sqlite',
            database: ':memory:',
            entities: [Car],
            synchronize: true,
        }).initialize();
        Container.inject(dataSource, true);

        service = Container.resolve(CarService);
    });

    afterEach(async () => {
        await dataSource.getRepository(Car).clear();
    });

    /*
     * Search
     */

    it('should find cars', async () => {
        const cars: Car[] = [];
        for (let i = 0; i < 10; i++) {
            cars.push(getCar(`Fiesta ${i}`));
        }
        await dataSource.getRepository(Car).save(cars);

        const page = await service.search({}, 1, 5);

        expect(page).not.toBeNull();
        expect(page!.total).toEqual(10);
        expect(page!.page).toEqual(1);
        expect(page!.pageSize).toEqual(5);
        expect(page!.data).toMatchObject(cars.slice(0, 5));
    });

    it('should not find deleted cars', async () => {
        const cars: Car[] = [];
        for (let i = 0; i < 10; i++) {
            cars.push(getCar(`Fiesta ${i}`));
        }
        await dataSource.getRepository(Car).save(cars);

        const toDelete = cars[1];
        toDelete.deletedAt = new Date();
        await dataSource.getRepository(Car).save(toDelete);

        const page = await service.search({}, 1, 5);

        expect(page).not.toBeNull();
        expect(page!.total).toEqual(9);
        expect(page!.page).toEqual(1);
        expect(page!.pageSize).toEqual(5);
        expect(page!.data).not.toContainEqual(toDelete);
    });

    it('should return null if no results', async () => {
        const page = await service.search({model: 'DOES NOT EXISTS'}, 1, 5);

        expect(page).toBeNull();
    });

    it('should find cars with criteria', async () => {
        const cars: Car[] = [];
        for (let i = 0; i < 5; i++) {
            cars.push(getCar(`Fiesta ${i}`));
            cars.push(getCar(`Focus ${i}`));
        }
        await dataSource.getRepository(Car).save(cars);

        const page = await service.search({model: Like(`%Fiesta%`)}, 1, 5);

        expect(page).not.toBeNull();
        expect(page!.total).toEqual(5);
        expect(page!.page).toEqual(1);
        expect(page!.pageSize).toEqual(5);
        page!.data.forEach((car, i) => {
            expect(car).toMatchObject(cars[i * 2])
            expect(car.createdAt).toBeDefined();
            expect(car.updatedAt).toBeDefined();
            expect(car.deletedAt).toBeNull();
        });
    });

    /*
     * Consult
     */

    it('should consult a car', async () => {
        const car = getCar();
        const created = await dataSource.getRepository(Car).save(car);

        const consulted = await service.consult(created.id);

        expect(consulted).toBeDefined();
        expect(consulted).toMatchObject(created);
        expect(consulted!.createdAt).toBeDefined();
        expect(consulted!.updatedAt).toBeDefined();
        expect(consulted!.deletedAt).toBeNull();
    });

    it('should not find a deleted car', async () => {
        const car = getCar();
        const created = await dataSource.getRepository(Car).save(car);

        created.deletedAt = new Date();
        await dataSource.getRepository(Car).save(created);

        const consulted = await service.consult(created.id);

        expect(consulted).toBeNull();
    });

    /*
     * Create
     */

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

    /*
     * Update
     */

    it('should update a car', async () => {
        const car = getCar();
        const created = await dataSource.getRepository(Car).save(car);

        created.model = 'Focus';
        const updated = await service.update(created.id, created);

        expect(updated.id).toEqual(created.id);
        expect(updated.model).toEqual('Focus');
        expect(updated.wheels).toEqual(car.wheels);
        expect(updated.releaseDate).toEqual(car.releaseDate);
        expect(updated.createdAt).toBeDefined();
        expect(updated.updatedAt).toBeDefined();
        expect(updated.updatedAt).toBeDefined();
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
        const created = await dataSource.getRepository(Car).save(car);

        created.model = 'Focus';

        await expect(service.update(999, created))
            .rejects
            .toThrow(new NotMatchingIdError(created.id, 999));
    });

    /*
     * Delete
     */

    it('should delete a car', async () => {
        const car = getCar();
        const created = await dataSource.getRepository(Car).save(car);

        await service.delete(created.id);

        const deleted = await dataSource.getRepository(Car).findOne({ where: {id: created.id}, withDeleted: true});
        expect(deleted).toBeDefined();
        expect(deleted!.deletedAt).toBeDefined();
    });

    it('should throw error when deleting a non-existing car', async () => {
        await expect(service.delete(999))
            .rejects
            .toThrow(new EntityNotFoundError(Car, 999));
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

});

function getCar(model: string = 'Fiesta'): Car {
    const car = new Car();
    car.model = model;
    car.wheels = 4;
    car.releaseDate = new Date();
    return car;
}