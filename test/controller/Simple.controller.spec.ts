import {Server} from "node:http";
import expressExtended from "../../src/express.extended";
import {SimpleController} from "./Simple.controller";

describe('SimpleController', () => {

    let api: Server;

    beforeAll(async () => {
        const app = expressExtended();
        app.useControllers([SimpleController]);

        await new Promise((resolve) => {
            api = app.listen(3005, () => resolve(api))
        });
    });

    it('should register GET endpoint', async () => {
        const response = await fetch('http://localhost:3005/test');
        const body = await response.json();
        expect(body).toEqual({message: 'Hello, World!'});
    });

    it('should register POST endpoint', async () => {
        const response = await fetch('http://localhost:3005/test/123', {method: 'POST'});
        const body = await response.json();
        expect(body).toEqual({message: 'Hello, 123!'});
    });

    it('should register PUT endpoint', async () => {
        const response = await fetch('http://localhost:3005/test/123', {method: 'PUT'});
        const body = await response.json();
        expect(body).toEqual({message: 'Hello, 123!'});
    });

    it('should register PATCH endpoint', async () => {
        const response = await fetch('http://localhost:3005/test/123', {method: 'PATCH'});
        const body = await response.json();
        expect(body).toEqual({message: 'Hello, 123!'});
    });

    it('should register DELETE endpoint', async () => {
        const response = await fetch('http://localhost:3005/test/123', {method: 'DELETE'});
        const body = await response.json();
        expect(body).toEqual({message: 'Hello, 123!'});
    });

    it('should apply middlewares to get if specified', async () => {
        const response = await fetch('http://localhost:3005/test', {method: 'GET'});
        expect(response.headers.get('FIRST')).toEqual('GET');
        expect(response.headers.get('SECOND')).toEqual('GET');
    });

    it('should apply middlewares to post if specified', async () => {
        const response = await fetch('http://localhost:3005/test/123', {method: 'POST'});
        expect(response.headers.get('FIRST')).toEqual('POST');
        expect(response.headers.get('SECOND')).toEqual('POST');
    });

    it('should apply middlewares to put if specified', async () => {
        const response = await fetch('http://localhost:3005/test/123', {method: 'PUT'});
        expect(response.headers.get('FIRST')).toEqual('PUT');
        expect(response.headers.get('SECOND')).toEqual('PUT');
    });

    it('should apply middlewares to patch if specified', async () => {
        const response = await fetch('http://localhost:3005/test/123', {method: 'PATCH'});
        expect(response.headers.get('FIRST')).toEqual('PATCH');
        expect(response.headers.get('SECOND')).toEqual('PATCH');
    });

    it('should apply middlewares to delete if specified', async () => {
        const response = await fetch('http://localhost:3005/test/123', {method: 'DELETE'});
        expect(response.headers.get('FIRST')).toEqual('DELETE');
        expect(response.headers.get('SECOND')).toEqual('DELETE');
    });

    it('should apply middlewares to all if specified', async () => {
        const response = await fetch('http://localhost:3005/test', {method: 'GET'});
        expect(response.headers.get('CONTROLLER')).toEqual('ALL');

        const response2 = await fetch('http://localhost:3005/test/123', {method: 'POST'});
        expect(response2.headers.get('CONTROLLER')).toEqual('ALL');

        const response3 = await fetch('http://localhost:3005/test/123', {method: 'PUT'});
        expect(response3.headers.get('CONTROLLER')).toEqual('ALL');

        const response4 = await fetch('http://localhost:3005/test/123', {method: 'PATCH'});
        expect(response4.headers.get('CONTROLLER')).toEqual('ALL');

        const response5 = await fetch('http://localhost:3005/test/123', {method: 'DELETE'});
        expect(response5.headers.get('CONTROLLER')).toEqual('ALL');
    });

    afterAll((done) => {
        api.close(done);
    });

});