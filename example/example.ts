import express from "express";
import {Controllers} from "../src/controller/controllers";
import {CarController} from "../test/controller/crud/car.controller";
import {MetadataEntity} from "../src/db/abstract-entity.model";
import {Type} from "@nerisma/di";
import {Car} from "../test/entity/car.entity";
import {DataSourceUtils} from "../src/db/data-source.utils";

// List controllers & entities
const entities: Type<MetadataEntity>[] = [Car]
const controllers: Type<any>[] = [CarController]

async function main() {
    // Setup express
    const app = express();
    app.use(express.json());

    // Initialize datasource
    await DataSourceUtils.getInMemoryPostgresDataSource(entities).initialize();

    // Bind controllers to express routes
    Controllers.use(app, controllers);

    // Start the server
    app.listen(3000, async () => {
        console.log('Server is running on port 3000');

        // Create a car
        await fetch('http://localhost:3000/car', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'Toyota',
                wheels: 4,
                releaseDate: new Date(),
            }),
        });

        // Consult the car
        const response = await fetch('http://localhost:3000/car/1');
        const car = await response.json();
        console.log(car);
    });
}

main().catch(console.error);