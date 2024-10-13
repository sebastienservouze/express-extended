import {authMiddleware} from "../../src/middleware/auth.middleware";
import {TestsUtils} from "../tests.utils";
import express from "express";
import {Server} from "node:http";
import expressExtended from "../../src/express.extended";
import jwt from "jsonwebtoken";
import {AuthRole} from "../../src/service/auth/auth-role.enum";

describe("AuthMiddleware", () => {

    let app: express.Application;
    let api: Server;

    beforeAll(async () => {
        app = expressExtended();

        await app.useDataSource(TestsUtils.dataSourceOptions);

        await new Promise((resolve) => {
            api = app.listen(3003, () => resolve(api))
        });
    });

    it('should next with valid token', async () => {
        // Add a secured route to the express app
        app.use('/secured', (req, res, next) => {
            return authMiddleware(req, res, next);
        }, (req, res) => {
            res.status(200).send('Secured route');
        });

        const response = await fetch('http://localhost:3003/secured', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + TestsUtils.getValidAccessToken()
            }
        });

        const body = await response.text();
        expect(body).toBe('Secured route');
    });

    it('should return 401 when no authorization header is provided', async () => {
        // Add a secured route to the express app
        app.use('/secured', (req, res, next) => {
            return authMiddleware(req, res, next);
        }, (req, res) => {
            res.status(200).send('Secured route');
        });

        const response = await fetch('http://localhost:3003/secured', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        expect(response.status).toBe(401);
    });

    it('should return 401 when invalid token is provided', async () => {
        // Add a secured route to the express app
        app.use('/secured', (req, res, next) => {
            return authMiddleware(req, res, next);
        }, (req, res) => {
            res.status(200).send('Secured route');
        });

        const response = await fetch('http://localhost:3003/secured', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt.sign({
                    sub: '1',
                    username: 'username',
                }, 'INVALID SECRET')
            }
        });

        expect(response.status).toBe(401);
    });

    it('should return 401 when role is not enough', async () => {
        // Add a secured route to the express app
        app.use('/secured', (req, res, next) => {
            return authMiddleware(req, res, next, AuthRole.ADMIN);
        }, (req, res) => {
            res.status(200).send('Secured route');
        });

        const response = await fetch('http://localhost:3003/secured', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt.sign({
                    sub: '1',
                    username: 'username',
                    role: AuthRole.USER,
                }, 'INVALID SECRET')
            }
        });

        expect(response.status).toBe(401);
    });

    afterAll((done) => {
        api.close(done);
    });
});