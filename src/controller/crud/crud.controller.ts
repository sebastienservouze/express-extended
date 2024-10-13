import {CrudService} from "../../service/crud/crud.service";
import {Request, Response} from 'express';
import {MetadataEntity} from "../../db/metadata-entity.model";
import {EntityNotFoundError, FindOptionsWhere} from "typeorm";
import {Page} from "../../service/crud/page.type";
import {NotMatchingIdError} from "../../error/not-matching-id.error";
import {Delete, Get, Patch, Post, Put} from "../controller.decorators";
import {InvalidBodyError} from "../../error/invalid-body.error";

const DEFAULT_PAGE_SIZE = 10;
const METADATA_COLUMNS = ['createdAt', 'updatedAt', 'deletedAt'];

export abstract class CrudController<T extends MetadataEntity> {

    protected constructor(private readonly service: CrudService<T>) {
    }

    /**
     * Search for entities based on query parameters
     * Will ignore unknown query parameters
     *
     * @param req
     * @param res
     */
    @Get('/')
    public async search(req: Request, res: Response): Promise<Response<Page<T> | null>> {
        const criteria = this.getCriteriaFromQuery(req.query);

        const page = req.query.page ? parseInt(<string>req.query.page) : 1;
        const pageSize = req.query.pageSize ? parseInt(<string>req.query.pageSize) : DEFAULT_PAGE_SIZE;

        const result = await this.service.search(criteria, page, pageSize);

        if (!result) {
            return res.status(204)
                      .send();
        }

        return res.status(200)
                  .json(result);
    }

    /**
     * Consult a single entity by its ID
     *
     * @param req
     * @param res
     */
    @Get('/:id')
    public async consult(req: Request, res: Response) {
        const id = req.params.id;

        if (isNaN(parseInt(id))) {
            return res.status(400)
                      .json({message: 'Invalid ID'});
        }

        const result = await this.service.consult(+id);

        if (!result) {
            return res.status(404)
                      .json({message: 'Entity not found'});
        }

        return res.status(200)
                  .json(result);
    }

    /**
     * Create a new entity
     *
     * @param req
     * @param res
     */
    @Post('/')
    public async create(req: Request, res: Response) {
        const entity = req.body as T;

        try {
            this.validateBody(entity);

            const created = await this.service.create(entity);

            return res.status(201)
                      .json(created);
        } catch (e) {
            if (e instanceof InvalidBodyError) {
                return res.status(400)
                          .json({message: e.message});
            }

            return res.status(500)
                      .json({message: 'Internal server error'});
        }
    }

    /**
     * Update an entity
     *
     * @param req
     * @param res
     */
    @Put('/:id')
    public async update(req: Request, res: Response) {
        const id = req.params.id;
        const entity = req.body as T;

        if (isNaN(parseInt(id))) {
            return res.status(400)
                      .json({message: 'Invalid ID'});
        }

        if (entity.id !== +id) {
            return res.status(400)
                      .json({message: 'ID in path does not match ID in body'});
        }

        try {
            this.validateBody(entity);
            const result = await this.service.update(+id, entity);

            return res.status(200)
                      .json(result);
        } catch (e) {
            if (e instanceof EntityNotFoundError) {
                return res.status(404)
                          .json({message: e.message});
            }

            if (e instanceof InvalidBodyError || e instanceof NotMatchingIdError) {
                return res.status(400)
                          .json({message: e.message});
            }

            return res.status(500)
                      .json({message: 'Internal server error'});
        }
    }

    /**
     * Patch an entity
     * Only updates the fields that are present in the request body
     * Will ignore unknown properties
     *
     * @param req
     * @param res
     */
    @Patch('/:id')
    public async patch(req: Request, res: Response) {
        const id = req.params.id;
        const entity = req.body as T;

        if (isNaN(parseInt(id))) {
            return res.status(400)
                      .json({message: 'Invalid ID'});
        }

        if (entity.id) {
            return res.status(400)
                      .json({message: 'ID cannot be updated'});
        }

        try {
            this.validateBody(entity, true);
            const result = await this.service.patch(+id, entity);

            return res.status(200)
                      .json(result);
        } catch (e) {
            if (e instanceof EntityNotFoundError) {
                return res.status(404)
                          .json({message: e.message});
            }

            if (e instanceof InvalidBodyError) {
                return res.status(400)
                          .json({message: e.message});
            }
            return res.status(500)
                      .json({message: 'Internal server error'});
        }
    }

    /**
     * Delete an entity
     *
     * @param req
     * @param res
     */
    @Delete('/:id')
    public async delete(req: Request, res: Response) {
        const id = req.params.id;

        if (isNaN(parseInt(id))) {
            return res.status(400)
                      .json({message: 'Invalid ID'});
        }

        try {
            await this.service.delete(+id);

            return res.status(204)
                      .send();

        } catch (e) {
            if (e instanceof EntityNotFoundError) {
                return res.status(404)
                          .json({message: e.message});
            }
            return res.status(500)
                      .json({message: 'Internal server error'});
        }
    }

    /**
     * Get criteria from query parameters
     * Will ignore unknown query parameters
     *
     * @param query
     * @private
     */
    private getCriteriaFromQuery(query: any): FindOptionsWhere<T> {
        const criteria: Partial<T> = {};

        for (const key in query) {
            if (!this.entityColumns.some(column => column.propertyName === key)) {
                continue;
            }

            criteria[key as keyof T] = query[key] as T[keyof T];
        }

        return criteria as FindOptionsWhere<T>;
    }

    /**
     * Validate a body
     *
     * @param body
     * @param allowNull If true, will allow missing properties
     * @private
     */
    private validateBody(body: T, allowNull: boolean = false): void {
        const errors: string[] = [];

        // Check if the entity has unknown properties
        for (const key in body) {
            if (!this.entityColumns.some(column => column.propertyName === key)) {
                errors.push(`${key} is not a valid property`);
            }
        }

        if (!allowNull) {
            const requiredColumns = this.entityColumns.filter(column => !column.isNullable && !column.isPrimary && !METADATA_COLUMNS.includes(column.propertyName));
            for (const column of requiredColumns) {
                if (!body[column.propertyName as keyof T]) {
                    if (column.isPrimary) {
                        errors.push(`${column.propertyName} is not allowed`);
                        continue;
                    }

                    errors.push(`${column.propertyName} is required`);
                }
            }
        }

        if (errors.length > 0) {
            throw new InvalidBodyError(...errors);
        }
    }

    private get entityColumns() {
        return this.service.repository!.metadata.columns;
    }
}