import 'reflect-metadata';
import express from "express";
import {ControllerMetadataKeys} from "./ControllerMetadataKeys.enum";
import {MetadataKeys} from "@nerisma/di";
import {HttpVerb} from "./HttpVerb.enum";

export function Controller(basePath: string, ...middlewares: express.RequestHandler[]): ClassDecorator {
    return (target) => {
        Reflect.defineMetadata(MetadataKeys.IsDependency, true, target);
        Reflect.defineMetadata(ControllerMetadataKeys.BASE_PATH, basePath, target);
        Reflect.defineMetadata(ControllerMetadataKeys.MIDDLEWARES, middlewares, target);
    }
}

export function Get(path: string, ...middlewares: express.RequestHandler[]): MethodDecorator {
    return (target, propertyKey, descriptor: PropertyDescriptor) => {
        defineEndpointMetadata(path, HttpVerb.GET, descriptor.value as express.RequestHandler, target.constructor, middlewares);
    }
}

export function Post(path: string, ...middlewares: express.RequestHandler[]): MethodDecorator {
    return (target, propertyKey, descriptor: PropertyDescriptor) => {
        defineEndpointMetadata(path, HttpVerb.POST, descriptor.value as express.RequestHandler, target.constructor, middlewares);
    }
}

export function Put(path: string, ...middlewares: express.RequestHandler[]): MethodDecorator {
    return (target, propertyKey, descriptor: PropertyDescriptor) => {
        defineEndpointMetadata(path, HttpVerb.PUT, descriptor.value as express.RequestHandler, target.constructor, middlewares);
    }
}

export function Delete(path: string, ...middlewares: express.RequestHandler[]): MethodDecorator {
    return (target, propertyKey, descriptor: PropertyDescriptor) => {
        defineEndpointMetadata(path, HttpVerb.DELETE, descriptor.value as express.RequestHandler, target.constructor, middlewares);
    }
}

export function Patch(path: string, ...middlewares: express.RequestHandler[]): MethodDecorator {
    return (target, propertyKey, descriptor: PropertyDescriptor) => {
        defineEndpointMetadata(path, HttpVerb.PATCH, descriptor.value as express.RequestHandler, target.constructor, middlewares);
    }
}

function defineEndpointMetadata(path: string, verb: HttpVerb, handler: express.RequestHandler, target: any, middlewares?: express.RequestHandler[]) {
    const endpoints = Reflect.getMetadata(ControllerMetadataKeys.ENDPOINTS, target) || [];
    endpoints.push({
        verb,
        path,
        handler,
        middlewares
    });

    Reflect.defineMetadata(ControllerMetadataKeys.ENDPOINTS, endpoints, target);
}