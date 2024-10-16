import {DataSourceOptions} from "typeorm";
import path from "path";
import express from "express";

export abstract class TestsUtils {

    public static dataSourceOptions: DataSourceOptions = {
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        entities: [path.resolve(__dirname, '..') + '/**/*.entity{.ts,.js}'],
    };

    public static addHeaderMiddleware(key: string, value: string): express.RequestHandler {
        return (req, res, next) => {
            res.set(key, value);
            next();
        }
    }
}