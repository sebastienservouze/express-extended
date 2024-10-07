import {ControllerMetadataKeys} from "./controller-metadata-keys.enum";
import {Endpoint} from "./endpoint.model";
import {Express} from "express";

export class ControllerUtils {

    public static register(app: Express, controller: any): void {
        const basePath = Reflect.getMetadata(ControllerMetadataKeys.BASE_PATH, controller);
        const endpoints = Reflect.getMetadata(ControllerMetadataKeys.ENDPOINTS, controller) || [];

        if (!basePath) {
            throw new Error(`Base path not defined for controller: ${controller.name}`);
        }

        endpoints.forEach((endpoint: Endpoint) => {
            const path = `${basePath}${endpoint.path}`;
            app[endpoint.verb.toLowerCase() as keyof Express](path, endpoint.handler.bind(controller));
            console.log(`Registered ${endpoint.verb} ${basePath}${endpoint.path}`);
        });
    }
}