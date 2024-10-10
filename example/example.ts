import "reflect-metadata";
import {ExpressApiDb} from "../src/express-api-db";
import {Car} from "../test/entity/car.entity";
import {CarController} from "../test/controller/crud/car.controller";

async function server() {
    const app = await ExpressApiDb.setup([Car], [CarController]);

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