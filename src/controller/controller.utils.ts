import {ControllerMetadataKeys} from "./controller-metadata-keys.enum";
import {Endpoint} from "./endpoint.model";
import {Express} from "express";
import {Container} from "../../../di";

export class ControllerUtils {

    public static register(app: Express, controller: any): void {
        const instance = Container.resolve(controller);

        const basePath = Reflect.getMetadata(ControllerMetadataKeys.BASE_PATH, controller);
        const endpoints = Reflect.getMetadata(ControllerMetadataKeys.ENDPOINTS, controller) || [];

        if (!basePath) {
            throw new Error(`Base path not defined for controller: ${controller.name}`);
        }

        endpoints.forEach((endpoint: Endpoint) => {
            const path = `${basePath}${endpoint.path}`;
            app[endpoint.verb.toLowerCase() as keyof Express](path, endpoint.handler.bind(instance));
            console.log(`Registered ${endpoint.verb} ${basePath}${endpoint.path}`);
        });
    }
}