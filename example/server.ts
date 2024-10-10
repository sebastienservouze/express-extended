import "reflect-metadata";
import {ExpressApiTypeorm} from "../src/express-api-typeorm";
import {Car} from "./entities/car.entity";
import {CarController} from "./controllers/car.controller";

async function server() {
    const app = await ExpressApiTypeorm.setup([Car], [CarController], {
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'test',
    });

    // Start the server
    const server = app.listen(3000, async () => {
        console.log('Server is running on port 3000');

        // Simulate a client
        await client();

        server.close(() => {
            console.log('Server closed');
        });
    });
}

async function client() {
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
}

server().catch(console.error);