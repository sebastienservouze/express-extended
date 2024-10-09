import {Server} from "node:http";
import express from "express";
import {SimpleController} from "./simple.controller";
import {Controllers} from "../../src/controller/controllers";

describe('SimpleController', () => {

    let api: Server;

    beforeAll(async () => {
        const app = express();

        Controllers.use(app, [SimpleController]);

        await new Promise((resolve) => {
            api = app.listen(3000, () => resolve(api))
        });
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

    afterAll((done) => {
        api.close(done);
    });

});