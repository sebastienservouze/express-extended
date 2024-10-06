import {CrudService} from "../../service/crud/crud.service";
import {Request, Response} from 'express';
import {NEntity} from "../../db/n-entity.model";

export abstract class CrudController<T extends NEntity> {

    constructor(private readonly service: CrudService<T>) {}

    public async search(req: Request, res: Response) {

    }

    public async consult(req: Request, res: Response) {

    }

    public async create(req: Request, res: Response) {

    }

    public async update(req: Request, res: Response) {

    }

    public async patch(req: Request, res: Response) {

    }

    public async delete(req: Request, res: Response) {

    }
}