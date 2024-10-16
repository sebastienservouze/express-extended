import {HttpVerb} from "./HttpVerb.enum";
import express from "express";

export interface Endpoint {
    verb: HttpVerb,
    path: string,
    handler: express.RequestHandler,
    middlewares?: express.RequestHandler[]
}