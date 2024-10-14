import {DataSource, EntityNotFoundError, FindOptionsWhere, IsNull, Repository} from "typeorm";
import {MetadataEntity} from "../db/MetadataEntity";
import {Page} from "./Page.type";
import {NotMatchingIdError} from "../errors/NotMatchingId.error";
import {Type} from "@nerisma/di";

export abstract class CrudService<T extends MetadataEntity> {

    protected constructor(private readonly datasource: DataSource, private readonly entityType: Type<T>) {
    }

    /**
     * Search for entities based on criteria
     * Result is paginated
     *
     * @param criteria
     * @param page
     * @param pageSize
     */
    async search(criteria?: FindOptionsWhere<T>, page: number = 1, pageSize: number = 10): Promise<Page<T> | null> {
        const finalCriteria: any = criteria ?? {};

        const [data, total] = await this.repository!.findAndCount({
            where: finalCriteria,
            skip: (page - 1) * pageSize,
            take: pageSize
        });

        return {
            data,
            total,
            page,
            pageSize
        };
    }

    /**
     * Consult a single entity by its ID
     *
     * @param id
     */
    async consult(id: number): Promise<T | null> {
        return await this.repository!.findOneBy({
            id: id,
        } as unknown as FindOptionsWhere<T>);
    }

    /**
     * Create a new entity
     *
     * @param entity
     */
    async create(entity: T): Promise<T> {
        return this.repository!.save(entity);
    }

    /**
     * Update an entity
     *
     * @param id
     * @param entity
     */
    async update(id: number, entity: T): Promise<T> {
        if (id !== entity.id) {
            throw new NotMatchingIdError(entity.id, id);
        }

        const existing = await this.repository!.findOneBy({id} as FindOptionsWhere<T>);
        if (!existing) {
            throw new EntityNotFoundError(this.repository!.target, id);
        }

        return this.repository!.save(entity);
    }

    /**
     * Patch an entity
     * Only update the fields that are provided
     *
     * @param id
     * @param entity
     */
    async patch(id: number, entity: Partial<T>): Promise<T> {
        const existing = await this.repository!.findOneBy({id} as FindOptionsWhere<T>);
        if (!existing) {
            throw new EntityNotFoundError(this.repository!.target, id);
        }

        const updated = {...existing, ...entity} as T;

        return this.repository!.save(updated);
    }

    /**
     * Delete an entity
     *
     * @param id
     */
    async delete(id: number): Promise<void> {
        const entity = await this.repository!.findOneBy({id} as FindOptionsWhere<T>);
        if (!entity) {
            throw new EntityNotFoundError(this.repository!.target, id);
        }

        await this.repository!.softRemove(entity);
    }

    /**
     * Returns the repository for the entity
     *
     * @private
     */
    public get repository(): Repository<T> | null {
        return this.datasource?.getRepository(this.entityType);
    }
}