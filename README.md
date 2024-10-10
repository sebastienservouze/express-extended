# @nerisma/express-api-typeorm

[![npm version](https://badge.fury.io/js/%40nerisma%2Fexpress-api-typeorm.svg)](https://badge.fury.io/js/%40nerisma%2Fexpress-api-typeorm)

This library provides a simple way to create an Express API with TypeORM integration in TypeScript.

It uses the `@nerisma/di` package for dependency injection and some decorators to define the routes
via injected controllers.

It also provides a simple way to create a RESTful API with TypeORM integration in TypeScript by
providing CrudController and CrudService classes that can be extended to create CRUD operations for
a given entity all the way from the controller to the database.

## Features

### Simple Express API & TypeORM integration

This package provides a simple way to create an Express API with TypeORM integration in TypeScript.

> In this example, we will create a simple API with a `Car` entity and a `CarController`. We will use
> an in-memory PostgreSQL database for the sake of simplicity.

```typescript
// server.ts
import {Type} from "@nerisma/di";
import {ExpressApiDb} from "./express-api-db";
import {Car} from "./car.entity";
import {CarController} from "./car.controller";

const entities: Type<any>[] = [Car];
const controllers: Type<any>[] = [CarController];

async function server() {
    // If not provided, the database connection is an in-memory PostgreSQL database 
    const app = await ExpressApiTypeorm.setup(entities, controllers);
    
    // Start the server
    const server = app.listen(3000, async () => {
        console.log('Server is running on port 3000');
    });
}

server().catch(console.error);
```

> **And... that's it ! 🎉** 

You now have a running API with a `Car` entity and a `CarController` that you can access at `http://localhost:3000/cars`.

### Provide your own database connection

You can also provide your own database connection options by passing them as the third argument to the `ExpressApiDb.setup` method.

```typescript
const app = await ExpressApiTypeorm.setup(entities, controllers, {
    type: 'mysql',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'password',
    database: 'mydb',
});
```

### Create controllers

1. To create a controller, create a class and decorate it with the `@Controller` decorator.
2. Use the `@Get`, `@Post`, `@Put`, `@Patch` and `@Delete` decorators to define the HTTP methods.
```typescript
// car.controller.ts
import {Controller} from "@nerisma/express-api-typeorm";

@Controller('/cars')
export class CarController {
    
    @Get('/')
    async getCars(req: Request, res: Response) {
        const cars = [
            {id: 1, make: 'Toyota', model: 'Corolla'},
            {id: 2, make: 'Honda', model: 'Civic'},
        ];
        
        res.status(200)
           .json(cars);
    }
}
```

3. Finally, add the controller to the `controllers` array in the `server.ts` file.
4. You can now access the controller at the specified route, e.g. `http://localhost:3000/cars` 🚀

### Create CRUD Controllers

1. Create an entity class that extends the `AbstractEntity` class.

```typescript
// car.entity.ts
import {AbstractEntity} from "@nerisma/express-api-typeorm";

@Entity()
export class Car extends AbstractEntity {
    @Column()
    make: string;

    @Column()
    model: string;
}
```

2. Create a service class that extends the `CrudService` with the Entity type.


```typescript
// car.service.ts
import {CrudService} from "@nerisma/express-api-typeorm";
import {Car} from "./car.entity";
import {Dependency} from "@nerisma/di";

@Dependency()
export class CarService extends CrudService<Car> {
    
    // This will be automatically injected 
    constructor(dataSource: DataSource) {
        super(dataSource.getRepository(Car));
    }
    
}
```

3. Create a controller class that extends the `CrudController` with the Entity type.

```typescript
// car.controller.ts
import {CrudController} from "@nerisma/express-api-typeorm";
import {Car} from "./car.entity";
import {Dependency} from "@nerisma/di";

@Dependency()
export class CarController extends CrudController<Car> {
    
    // This will be automatically injected 
    constructor(service: CarService) {
        super(service);
    }
    
}
```

4. Add the entity, service and controller to the `entities` and `controllers` arrays in the `server.ts` file.

```typescript
const entities: Type<any>[] = [Car];
const controllers: Type<any>[] = [CarController];

async function server() {
    const app = await ExpressApiTypeorm.setup(entities, controllers);
    const server = app.listen(3000, async () => {
        console.log('Server is running on port 3000');
    });
}

server().catch(console.error);
```

5. You can now access the CRUD operations for the `Car` entity at the specified route, e.g. `http://localhost:3000/cars` 🚀

> **NOTE**: All this section is availaible in the [example](./example) folder.
## Installation

```bash
npm install @nerisma/express-api-typeorm
```