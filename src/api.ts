import express from "express";
import {ControllerMetadataKeys} from "./controller/controller-metadata-keys.enum";
import {Container, Type} from "@nerisma/di";
import {Endpoint} from "./controller/endpoint.model";
import {DIDataSource} from "./db/di-data-source";
import {DataSourceOptions} from "typeorm/data-source/DataSourceOptions";
import {CrudController} from "./controller/crud/crud.controller";
import http from "node:http";
import pino from "pino";

export class Api {

    private readonly expressApp: express.Application;
    private server?: http.Server;
    private dataSource?: DIDataSource;
    private logger: pino.Logger;

    constructor(name: string) {
        this.logger = pino({
            level: 'info',
            name: name,
        });

        this.expressApp = express();
        this.setupLogMiddleware();
        this.expressApp.use(express.json());
    }

    public async start(port: number) {
        if (this.dataSource && !this.dataSource.isInitialized) {
            await this.dataSource.initialize();
        }

        this.server = this.expressApp.listen(port, () => {
            this.logger.info(`[API] Server started on port ${port}`);
        });
    }

    public async stop(callback?: () => void) {
        if (this.server) {
            this.server.close(callback);
            this.logger.info('[API] Server stopped');
        }
    }

    public registerControllers(...controllers: Type<any>[]) {
        controllers.forEach(controller => {
            if (controller === CrudController && !this.dataSource) {
                throw new Error('Datasource not defined');
            }

            const instance = Container.resolve(controller);

            const basePath = Reflect.getMetadata(ControllerMetadataKeys.BASE_PATH, controller);
            const endpoints = Reflect.getMetadata(ControllerMetadataKeys.ENDPOINTS, controller) || [];

            if (!basePath) {
                throw new Error(`Base path not defined for controller: ${controller.name}`);
            }

            endpoints.forEach((endpoint: Endpoint) => {
                const path = `${basePath}${endpoint.path}`;
                this.expressApp[endpoint.verb.toLowerCase() as keyof express.Application](path, endpoint.handler.bind(instance));
                this.logger.info(`[DI] Registered ${endpoint.verb} ${basePath}${endpoint.path}`);
            });
        });
    }

    public setupDataSource(options: DataSourceOptions) {
        const dataSource = new DIDataSource(options);
        Container.register(dataSource);
    }

    public setDataSource(dataSource: DIDataSource) {
        this.dataSource = dataSource;
    }

    public setupLogMiddleware() {
        this.expressApp.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            switch (req.method) {
                case 'GET':
                case 'DELETE':
                    req.on('end', () => {
                        this.logger.info(`[${req.method} ${res.statusCode}] ${req.url}`);
                    });
                    break;
                case 'POST':
                case 'PUT':
                case 'PATCH':
                    req.on('end', () => {
                        this.logger.info(`[${req.method} ${res.statusCode}] ${req.url} ${JSON.stringify(req.body)}`);
                    });
                    break;
                default:
                    break;
            }

            next();
        });
    }

    public setLogger(logger: pino.Logger) {
        this.logger = logger;
    }

    public getDataSource(): DIDataSource | undefined {
        return this.dataSource;
    }

    public getExpressApp(): express.Application | undefined {
        return this.expressApp;
    }

    public getServer(): http.Server | undefined {
        return this.server;
    }
}