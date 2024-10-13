import {Server} from "node:http";
import expressExtended from "../../src/express.extended";
import {AuthController} from "../../src/controller/auth/auth.controller";
import {TestsUtils} from "../tests.utils";
import {DataSource} from "typeorm";
import {Container} from "@nerisma/di";
import {AuthUser} from "../../src/db/auth-user.entity";
import express from "express";

describe("AuthController", () => {

    let app: express.Application;
    let api: Server;

    beforeAll(async () => {
        app = expressExtended();

        await app.useDataSource(TestsUtils.dataSourceOptions);
        const dataSource = Container.resolve<DataSource>(DataSource);

        app.useControllers([AuthController]);

        await dataSource.getRepository(AuthUser).save(TestsUtils.testUser);

        await new Promise((resolve) => {
            api = app.listen(3004, () => resolve(api))
        });
    });

    it('should sign in successfully', async () => {
        const response = await fetch('http://localhost:3004/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from('username:password').toString('base64')
            },
        });

        const body = await response.json();
        expect(body).toHaveProperty('accessToken');
        expect(body).toHaveProperty('refreshToken');
    });

    it('should return 401 when no authorization header is provided', async () => {
        const response = await fetch('http://localhost:3004/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        expect(response.status).toBe(401);
    });

    it('should return 401 when invalid credentials are provided', async () => {
        const response = await fetch('http://localhost:3004/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from('username:wrongpassword').toString('base64')
            },
        });

        expect(response.status).toBe(401);
    });

    afterAll((done) => {
        api.close(done);
    });
});