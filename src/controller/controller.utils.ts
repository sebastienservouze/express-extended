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
            switch (endpoint.verb) {
                case 'GET':
                    app.get(`${basePath}${endpoint.path}`, endpoint.handler);
                    break;
                case 'POST':
                    app.post(`${basePath}${endpoint.path}`, endpoint.handler);
                    break;
                case 'PUT':
                    app.put(`${basePath}${endpoint.path}`, endpoint.handler);
                    break;
                case 'PATCH':
                    app.patch(`${basePath}${endpoint.path}`, endpoint.handler);
                    break;
                case 'DELETE':
                    app.delete(`${basePath}${endpoint.path}`, endpoint.handler);
                    break;
                default:
                    throw new Error(`Unsupported HTTP verb: ${endpoint.verb}`);
            }

            console.log(`Registered ${endpoint.verb} ${basePath}${endpoint.path}`);
        });
    }
}