import 'reflect-metadata';
import express from "express";
import {ControllerMetadataKeys} from "./ControllerMetadataKeys.enum";
import {MetadataKeys} from "@nerisma/di";
import {HttpVerb} from "./HttpVerb.enum";

export function Controller(basePath: string): ClassDecorator {
    return (target) => {
        Reflect.defineMetadata(ControllerMetadataKeys.BASE_PATH, basePath, target);
        Reflect.defineMetadata(MetadataKeys.IsDependency, true, target);
    }
}

export function Get(path: string): MethodDecorator {
    return (target, propertyKey, descriptor: PropertyDescriptor) => {
        defineEndpointMetadata(path, HttpVerb.GET, descriptor.value as express.RequestHandler, target.constructor);
    }
}

export function Post(path: string): MethodDecorator {
    return (target, propertyKey, descriptor: PropertyDescriptor) => {
        defineEndpointMetadata(path, HttpVerb.POST, descriptor.value as express.RequestHandler, target.constructor);
    }
}

export function Put(path: string): MethodDecorator {
    return (target, propertyKey, descriptor: PropertyDescriptor) => {
        defineEndpointMetadata(path, HttpVerb.PUT, descriptor.value as express.RequestHandler, target.constructor);
    }
}

export function Delete(path: string): MethodDecorator {
    return (target, propertyKey, descriptor: PropertyDescriptor) => {
        defineEndpointMetadata(path, HttpVerb.DELETE, descriptor.value as express.RequestHandler, target.constructor);
    }
}

export function Patch(path: string): MethodDecorator {
    return (target, propertyKey, descriptor: PropertyDescriptor) => {
        defineEndpointMetadata(path, HttpVerb.PATCH, descriptor.value as express.RequestHandler, target.constructor);
    }
}

function defineEndpointMetadata(path: string, verb: HttpVerb, handler: express.RequestHandler, target: any) {
    const endpoints = Reflect.getMetadata(ControllerMetadataKeys.ENDPOINTS, target) || [];
    endpoints.push({
                       verb,
                       path,
                       handler
                   });

    Reflect.defineMetadata(ControllerMetadataKeys.ENDPOINTS, endpoints, target);
}