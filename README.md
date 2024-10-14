# @nerisma/express-extended

[![npm version](https://badge.fury.io/js/%40nerisma%2Fexpress-extended.svg)](https://badge.fury.io/js/%40nerisma%2Fexpress-extended)
[![Build Status](https://travis-ci.com/Nerisma/express-extended.svg?branch=main)](https://travis-ci.com/Nerisma/express-extended)
[![Coverage Status](https://coveralls.io/repos/github/Nerisma/express-extended/badge.svg?branch=main)](https://coveralls.io/github/Nerisma/express-extended?branch=main)

This library provides extended functionality for creating an Express API in TypeScript.

It just extends [express](https://www.npmjs.com/package/express) and integrate [typeorm](https://www.npmjs.com/package/typeorm) 
to create a simple API. It also provides some decorators to define routes and HTTP methods in controllers and
generic CRUD controllers / service with minimal boilerplate code and within respect of the RESTful API conventions.

## Installation

```bash
npm install @nerisma/express-extended
```

## Features

- **Use it like express**: Extends **express.Application** interface to provide additional functionality.
- **TypeORM Integration**: Easily integrate [TypeORM](https://www.npmjs.com/package/typeorm) to create a database connection.
- **Generic CRUD**: Create CRUD controllers / services with minimal boilerplate code.
- **Decorators**: Use decorators to define routes and HTTP methods in controllers.
- **Dependency Injection**: Use the `@Dependency` decorator to inject services into controllers.

## How to use it

This is a simple example of how to create a working CRUD API for a `Car` entity.

### 1. Create an entity

The entity is a representation of the `Car` definition in the database.

```typescript
// Car.entity.ts
@Entity()
export class Car extends MetadataEntity {
    
    @Column()
    model!: string;

    @Column()
    wheels!: number;

    @Column({type: 'timestamptz'})
    releaseDate!: Date;

}
```

> **NOTE**: If you want to use the provided **generic CRUD** controllers, you need to extend the `MetadataEntity` class.
> It will add the `id` column and metadata columns like `createdAt` and `updatedAt`.

### 2. Create a service

The service is a class that will handle the database operations for the `Car` entity.

```typescript
// Car.service.ts
@Dependency() // This allow the service to be injected in the controller
export class CarService extends CrudService<Car> {
    
    // This will be automatically injected
    constructor(dataSource: DataSource) {
        super(dataSource, Car);
    }
    
}
```

> **NOTE**: You **must** provide the entity class to the `CrudService` constructor.

### 3. Create a controller

The controller is a class that will handle the HTTP requests for the `Car` entity.

```typescript
// Car.controller.ts
@Dependency() // This allow the controller to be injected in the server
export class CarController extends CrudController<Car> {
    
    // This will be automatically injected
    constructor(service: CarService) {
        super(service);
    }
    
}
```

### 4. Create the server

Just do it as you would do with express, but use `expressExtended` instead of `express` to have access to the extended functionalities.

```typescript
// server.ts
async function server() {
    // Normal express setup
    const app = expressExtended();
    
    // Setup the database connection (no params to use sqlite in-memory)
    await app.useDataSource();
    
    // Use the controllers
    app.useControllers([CarController]);
    
    const server = app.listen(3000, async () => {
        console.log('Server is running on port 3000');
    });
}

server().catch(console.error);
```

**And... that's it ! 🎉** You now have a running API at `http://localhost:3000/cars` with all
CRUD operations pointing at a sqlite in-memory database.

> **NOTE**: You can find a more complete example [here](./example) that you can run
> by using the command `npm run example`.

### Provide your own database connection

Notice how the `useDataSource` method is called without the database connection options.
By default, it will use the `sqlite` in-memory database. But you can provide your own connection options
to the method and the `DataSourceOptions` interface.

```typescript
await app.useDataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
});
```