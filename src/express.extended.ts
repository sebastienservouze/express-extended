import {Container, Type} from "@nerisma/di";
import {DataSource, DataSourceOptions} from "typeorm";
import express from "express";
import {ControllerMetadataKeys} from "./web/ControllerMetadataKeys.enum";
import {Endpoint} from "./web/Endpoint.interface";
import {ILogger} from "@nerisma/di/dist/Logger";

declare module 'express' {
    export interface Application {
        /**
         * Initialize the datasource and inject it into the container.
         * <br>
         * **Note:** If no `dataSourceOptions` are provided, it will default to an in-memory SQLite database.
         * @param dataSourceOptions
         */
        useDataSource(dataSourceOptions?: DataSourceOptions): Promise<DataSource>;

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
         * Use a logger for the express-extended methods
         * @param logger
         */
        useLogger(logger: ILogger): void;
        logger: ILogger;
    }
}

export function expressExtended(): express.Application {
    const app = express() as unknown as express.Application;
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));

    app.useDataSource = async function (dataSourceOptions?: DataSourceOptions): Promise<DataSource> {
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

        if (this.logger) {
            this.logger.debug('[ExpressExtended] - Datasource initialized', dataSource.entityMetadatas.map(em => em.name));
        }

        return dataSource;
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

            app[method](path, endpoint.handler.bind(instance));

            if (this.logger) {
                this.logger.debug(`[ExpressExtended] - ${endpoint.verb} ${path} bound to ${controller.name}`);
            }
        });
    }

    app.useControllers = function (controllers: Type<any>[]): void {
        controllers.forEach(controller => this.useController(controller));
    };

    app.useLogger = function (logger: ILogger): void {
        this.logger = logger;
    }

    return app;
}

export default expressExtended;