
import http from "node:http";
import {CarController} from "./car.controller";
import {CarService} from "../../service/crud/car.service";
import {Repository} from "typeorm";
import {Car} from "../../db/car.entity";
import express, {Express} from "express";
import {ControllerUtils} from "../../../src/controller/controller.utils";
import {TestDataSource} from "../../db/test-data-source";

const repository = {
    metadata() {
        return {
            columns: [
                {
                    propertyName: 'id',
                    isPrimary: true,
                    isNullable: false,
                },
                {
                    propertyName: 'model',
                    isPrimary: false,
                    isNullable: false,
                },
                {
                    propertyName: 'wheels',
                    isPrimary: false,
                    isNullable: false,
                },
                {
                    propertyName: 'releaseDate',
                    isPrimary: false,
                    isNullable: false,
                }
            ]
        }
    }
}

const carService = {
    getRepository(): Repository<Car> {
        return repository as unknown as Repository<Car>;
    }
}

describe('CrudController', () => {

    const app: Express = express();
    let server: http.Server;

    beforeAll(async () => {
        await TestDataSource.initialize();
        const carController = new CarController(new CarService(TestDataSource.Instance));
        ControllerUtils.register(app, carController);
        server = app.listen(3000);
    });

    it('should return cars', async () => {
        const response = await fetch('http://localhost:3000/car');
        const body = await response.json();
        expect(body).toEqual([]);
    });

    afterAll(() => {
        server.close();
    })
});