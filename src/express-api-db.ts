import {Container, Type} from "@nerisma/di";
import express, {Application} from "express";
import {ControllerMetadataKeys} from "./controller/controller-metadata-keys.enum";
import {Endpoint} from "./controller/endpoint.model";
import {DataSource, DataSourceOptions} from "typeorm";
import {DataSourceUtils} from "./db/data-source.utils";

export abstract class ExpressApiDb {

    public static async setup(entities: Type<any>[], controllers: Type<any>[], dataSourceOptions?: DataSourceOptions): Promise<express.Application> {
        const app = express();
        app.use(express.json());

        await this.setupDatabase(entities, dataSourceOptions);
        this.setupControllers(app, controllers);

        return app;
    }

    public static async setupNoDb(controllers: Type<any>[]): Promise<express.Application> {
        const app = express();
        app.use(express.json());

        this.setupControllers(app, controllers);

        return app;
    }

    private static async setupDatabase(entities: Type<any>[], dataSourceOptions?: DataSourceOptions): Promise<void> {
        let dataSource: DataSource;

        if (!dataSourceOptions) {
            dataSource = DataSourceUtils.getInMemoryPostgresDataSource(entities);
        } else {
            dataSource = new DataSource({
                ...dataSourceOptions,
                entities,
            });
        }

        await dataSource.initialize();
        Container.inject(dataSource, true);
    }

    private static setupControllers(app: Application, controllers: Type<any>[]): void {
        controllers.forEach((controller: Type<any>) => {
            const basePath = Reflect.getMetadata(ControllerMetadataKeys.BASE_PATH, controller);
            const endpoints = Reflect.getMetadata(ControllerMetadataKeys.ENDPOINTS, controller) || [];

            if (!basePath) {
                throw new Error(`Base path not defined for controller: ${controller.name}`);
            }

            const instance = Container.resolve(controller);
            endpoints.forEach((endpoint: Endpoint) => {
                const path = `${basePath}${endpoint.path}`;
                app[endpoint.verb.toLowerCase() as keyof express.Application](path, endpoint.handler.bind(instance));
            });
        });
    }
}