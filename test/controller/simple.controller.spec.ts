import express, {Express} from "express";
import {SimpleController} from "./simple-controller";
import {ControllerUtils} from "../../src/controller/controller.utils";
import * as http from "node:http";

describe('SimpleController', () => {

    const app: Express = express();
    let server: http.Server;

    beforeAll(() => {
        ControllerUtils.register(app, SimpleController);
        server = app.listen(3000);
    });

    it('should register GET endpoint', async () => {
        const response = await fetch('http://localhost:3000/test');
        const body = await response.json();
        expect(body).toEqual({message: 'Hello, World!'});
    });

    it('should register POST endpoint', async () => {
        const response = await fetch('http://localhost:3000/test/123', {method: 'POST'});
        const body = await response.json();
        expect(body).toEqual({message: 'Hello, 123!'});
    });

    it('should register PUT endpoint', async () => {
        const response = await fetch('http://localhost:3000/test/123', {method: 'PUT'});
        const body = await response.json();
        expect(body).toEqual({message: 'Hello, 123!'});
    });

    it('should register PATCH endpoint', async () => {
        const response = await fetch('http://localhost:3000/test/123', {method: 'PATCH'});
        const body = await response.json();
        expect(body).toEqual({message: 'Hello, 123!'});
    });

    it('should register DELETE endpoint', async () => {
        const response = await fetch('http://localhost:3000/test/123', {method: 'DELETE'});
        const body = await response.json();
        expect(body).toEqual({message: 'Hello, 123!'});
    });

    afterAll(() => {
        server.close();
    });

});