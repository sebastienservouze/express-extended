import {HttpVerb} from "./http-verb.enum";
import express from "express";
import {AuthRole} from "../service/auth/auth-role.enum";

export interface Endpoint {
    verb: HttpVerb,
    path: string,
    handler: express.RequestHandler,
    minimalRole?: AuthRole
}