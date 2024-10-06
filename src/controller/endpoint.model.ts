import {HttpVerb} from "./http-verb.enum";
import express from "express";

export interface Endpoint {
    verb: HttpVerb,
    path: string,
    handler: express.RequestHandler
}