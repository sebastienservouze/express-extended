import {DataSourceOptions} from "typeorm";
import path from "path";
import jwt from "jsonwebtoken";

export abstract class TestsUtils {

    public static dataSourceOptions: DataSourceOptions = {
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        entities: [path.resolve(__dirname, '..') + '/**/*.entity{.ts,.js}'],
    };

    public static testUser = {
        username: 'username',
        password: 'password',
        roles: [
            {name: 'admin'},
        ]
    }

    public static getValidAccessToken(): string {
        const payload = {
            sub: '1',
            username: 'username',
            role: 'admin',
        };
        return jwt.sign(payload, 'ACCESS SECRET', {expiresIn: '1h'});
    }
}