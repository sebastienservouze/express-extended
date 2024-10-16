import {Controller, Delete, Get, Patch, Post, Put} from '../../src/web/Controller.decorators';
import {Request, Response} from 'express';
import {TestsUtils} from "../Tests.utils";

@Controller('/test', TestsUtils.addHeaderMiddleware('CONTROLLER', 'ALL'))
export class SimpleController {

    constructor() {

    }

    @Get('/', TestsUtils.addHeaderMiddleware('FIRST', 'GET'), TestsUtils.addHeaderMiddleware('SECOND', 'GET'))
    public test(req: Request, res: Response) {
        res.status(200)
           .json({message: 'Hello, World!'});
    }

    @Post('/:id', TestsUtils.addHeaderMiddleware('FIRST', 'POST'), TestsUtils.addHeaderMiddleware('SECOND', 'POST'))
    public testPost(req: Request, res: Response) {
        res.status(200)
           .json({message: `Hello, ${req.params.id}!`});
    }

    @Put('/:id', TestsUtils.addHeaderMiddleware('FIRST', 'PUT'), TestsUtils.addHeaderMiddleware('SECOND', 'PUT'))
    public testPut(req: Request, res: Response) {
        res.status(200)
           .json({message: `Hello, ${req.params.id}!`});
    }

    @Patch('/:id', TestsUtils.addHeaderMiddleware('FIRST', 'PATCH'), TestsUtils.addHeaderMiddleware('SECOND', 'PATCH'))
    public testPatch(req: Request, res: Response) {
        res.status(200)
           .json({message: `Hello, ${req.params.id}!`});
    }

    @Delete('/:id', TestsUtils.addHeaderMiddleware('FIRST', 'DELETE'), TestsUtils.addHeaderMiddleware('SECOND', 'DELETE'))
    public testDelete(req: Request, res: Response) {
        res.status(200)
           .json({message: `Hello, ${req.params.id}!`});
    }
}