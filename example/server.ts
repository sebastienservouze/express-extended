import "reflect-metadata";
import expressExtended from "../src/express.extended";
import {CarController} from "./car.controller";

async function server() {
    const app = expressExtended();
    await app.useDataSource({
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
    });
    app.useControllers([CarController]);

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
    const createResponse = await fetch('http://localhost:3000/cars', {
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
    const createdCar = await createResponse.json();
    console.log('Created car:', createdCar);

    // Consult the car
    const consultResponse = await fetch('http://localhost:3000/cars/1');
    const car = await consultResponse.json();
    console.log('Consulted car:', car);
}

server().catch(console.error);