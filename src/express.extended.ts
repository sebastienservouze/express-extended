import {Container, Type} from "@nerisma/di";
import {DataSource, DataSourceOptions} from "typeorm";
import express, {NextFunction, Request, Response} from "express";
import {ControllerMetadataKeys} from "./controller/controller-metadata-keys.enum";
import {Endpoint} from "./controller/endpoint.model";
import {authMiddleware} from "./middleware/auth.middleware";

declare module 'express' {
    export interface Application {
        /**
         * Initialize the datasource and inject it into the container.
         * <br>
         * **Note:** If no `dataSourceOptions` are provided, it will default to an in-memory SQLite database.
         * @param dataSourceOptions
         */
        useDataSource(dataSourceOptions?: DataSourceOptions): Promise<void>;

        /**
         * Resolve and bind the controllers routes to the express application
         * @param controllers
         */
        useControllers(controllers: Type<any>[]): void;

        /**
         * Resolve and bind the controller routes to the express application
         * @param controller
         */
        useController(controller: Type<any>): void;

        /**
         * Setup the express application to use authentication
         */
        useAuthentication(): void;
    }
}

export function expressExtended(): express.Application {
    const app = express() as unknown as express.Application;
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));

    app.useDataSource = async function (dataSourceOptions?: DataSourceOptions): Promise<void> {
        if (!dataSourceOptions) {
            dataSourceOptions = {
                type: 'sqlite',
                database: ':memory:',
                synchronize: true,
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
            };
        }

        const dataSource = await new DataSource(dataSourceOptions).initialize();

        Container.inject(dataSource, true);
    }

    app.useController = function (controller: Type<any>): void {
        const basePath = Reflect.getMetadata(ControllerMetadataKeys.BASE_PATH, controller);
        const endpoints = Reflect.getMetadata(ControllerMetadataKeys.ENDPOINTS, controller) || [];

        if (!basePath) {
            throw new Error(`Base path not defined for controller: ${controller.name}`);
        }

        const instance = Container.resolve(controller);
        endpoints.forEach((endpoint: Endpoint) => {
            const path = `${basePath}${endpoint.path}`;
            const method = endpoint.verb.toLowerCase() as keyof express.Application;

            console.log('Registered route:', endpoint.verb, path);

            if (endpoint.minimalRole) {
                app[method](path, (req: Request, res: Response, next: NextFunction) => {
                    return authMiddleware(req, res, next, endpoint.minimalRole);
                }, endpoint.handler.bind(instance));
                return;
            }

            app[method](path, endpoint.handler.bind(instance));

        });
    }

    app.useControllers = function (controllers: Type<any>[]): void {
        controllers.forEach(controller => this.useController(controller));
    };

    return app;
}

export default expressExtended;