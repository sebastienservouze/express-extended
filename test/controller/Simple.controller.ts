import {Controller, Delete, Get, Patch, Post, Put} from '../../src/web/Controller.decorators';
import {Request, Response} from 'express';

@Controller('/test')
export class SimpleController {

    constructor() {

    }

    @Get('/')
    public test(req: Request, res: Response) {
        res.status(200)
           .json({message: 'Hello, World!'});
    }

    @Post('/:id')
    public testPost(req: Request, res: Response) {
        res.status(200)
           .json({message: `Hello, ${req.params.id}!`});
    }

    @Put('/:id')
    public testPut(req: Request, res: Response) {
        res.status(200)
           .json({message: `Hello, ${req.params.id}!`});
    }

    @Patch('/:id')
    public testPatch(req: Request, res: Response) {
        res.status(200)
           .json({message: `Hello, ${req.params.id}!`});
    }

    @Delete('/:id')
    public testDelete(req: Request, res: Response) {
        res.status(200)
           .json({message: `Hello, ${req.params.id}!`});
    }
}