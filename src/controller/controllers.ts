import express, {Application} from "express";
import {Container, Type} from "@nerisma/di";
import {ControllerMetadataKeys} from "./controller-metadata-keys.enum";
import {Endpoint} from "./endpoint.model";

export abstract class Controllers {

    public static register(app: Application, controllerType: Type<any>[]): void {
        controllerType.forEach((type) => Controllers.registerOne(app, type));
    }

    public static registerOne(app: Application, controllerType: Type<any>): void {
        const basePath = Reflect.getMetadata(ControllerMetadataKeys.BASE_PATH, controllerType);
        const endpoints = Reflect.getMetadata(ControllerMetadataKeys.ENDPOINTS, controllerType) || [];

        if (!basePath) {
            throw new Error(`Base path not defined for controller: ${controllerType.name}`);
        }

        const instance = Container.get(controllerType);
        endpoints.forEach((endpoint: Endpoint) => {
            const path = `${basePath}${endpoint.path}`;
            app[endpoint.verb.toLowerCase() as keyof express.Application](path, endpoint.handler.bind(instance));
        });
    }
}