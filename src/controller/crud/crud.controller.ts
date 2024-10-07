import {CrudService} from "../../service/crud/crud.service";
import {Request, Response} from 'express';
import {AbstractEntity} from "../../db/abstract-entity.model";
import {EntityNotFoundError, FindOptionsWhere} from "typeorm";
import {Page} from "../../service/crud/page.type";
import {ColumnMetadata} from "typeorm/metadata/ColumnMetadata";
import {MissingRequiredPropertyError} from "../../error/missing-required-property.error";
import {NotMatchingIdError} from "../../error/not-matching-id.error";
import {UnknownPropertyError} from "../../error/unknown-property.error";
import {PrimaryKeyUpdateError} from "../../error/primary-key-update-error";
import {Delete, Get, Patch, Post, Put} from "../controller.decorators";

const DEFAULT_PAGE_SIZE = 10;

export abstract class CrudController<T extends AbstractEntity> {

    private entityColumns: ColumnMetadata[];

    protected constructor(private readonly service: CrudService<T>) {
        this.entityColumns = service.getRepository().metadata.columns;
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
        const criteria = this.getCriteriaFromQuery(req);

        const page = req.query.page ? parseInt(<string>req.query.page) : 1;
        const pageSize = req.query.pageSize ? parseInt(<string>req.query.pageSize) : DEFAULT_PAGE_SIZE;

        const result = await this.service.search(criteria, page, pageSize);

        if (result.data.length === 0) {
            return res.status(204);
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
            this.validateEntity(entity);

            const created = await this.service.create(entity);

            return res.status(201)
                      .json(created);
        } catch (e) {
            if (e instanceof MissingRequiredPropertyError || e instanceof UnknownPropertyError) {
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

        try {
            this.validateEntity(entity);
            const result = await this.service.update(+id, entity);

            if (!result) {
                return res.status(404)
                          .json({message: 'Entity not found'});
            }

            return res.status(200)
                      .json(result);
        } catch (e) {
            if (e instanceof MissingRequiredPropertyError || e instanceof UnknownPropertyError || e instanceof NotMatchingIdError || e instanceof EntityNotFoundError) {
                return res.status(400)
                          .json({message: e.message});
            }

            return res.status(500)
                      .json({message: 'Internal server error'});
        }
    }

    /**
     * Patch an entity
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

        try {
            this.validateEntity(entity, true);
            const result = await this.service.update(+id, entity);

            return res.status(200)
                      .json(result);
        } catch (e) {
            if (e instanceof MissingRequiredPropertyError || e instanceof UnknownPropertyError || e instanceof PrimaryKeyUpdateError || e instanceof EntityNotFoundError) {
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
     *
     * @param query
     * @private
     */
    private getCriteriaFromQuery(query: any): FindOptionsWhere<T> {
        const criteria: Partial<T> = {};

        for (const key in query) {
            if (!this.entityColumns.some(column => column.propertyName === key)) {
                throw new UnknownPropertyError(key);
            }

            criteria[key as keyof T] = query[key] as T[keyof T];
        }

        return criteria as FindOptionsWhere<T>;
    }

    /**
     * Validate an entity
     *
     * @param entity
     * @param allowNull
     * @private
     */
    private validateEntity(entity: T, allowNull: boolean = false): void {
        for (const [key, value] of Object.entries(entity)) {
            if (!this.entityColumns.some(column => column.propertyName === key)) {
                throw new UnknownPropertyError(key);
            }

            const column = this.entityColumns.find(column => column.propertyName === key);

            if (column!.isPrimary) {
                throw new PrimaryKeyUpdateError(key);
            }

            if (!allowNull && value === null && !column!.isNullable) {
                throw new MissingRequiredPropertyError(key);
            }
        }
    }
}