import {EntityNotFoundError, FindOptionsWhere, IsNull, Repository} from "typeorm";
import {AbstractEntity} from "../../db/abstract-entity.model";
import {Page} from "./page.type";
import {NotMatchingIdError} from "../../error/not-matching-id.error";

export abstract class CrudService<T extends AbstractEntity> {

    protected constructor(protected readonly repository: Repository<T>) {
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
        finalCriteria.deletedAt = IsNull();

        const [data, total] = await this.repository.findAndCount({
            where: finalCriteria,
            skip: (page - 1) * pageSize,
            take: pageSize
        });

        if (data.length === 0) {
            return null;
        }

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
        return await this.repository.findOneBy({
            id: id,
            deletedAt: IsNull(),
        } as unknown as FindOptionsWhere<T>);
    }

    /**
     * Create a new entity
     *
     * @param entity
     */
    async create(entity: T): Promise<T> {
        entity.createdAt = new Date();
        return this.repository.save(entity);
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

        const existing = await this.repository.findOneBy({id} as FindOptionsWhere<T>);
        if (!existing) {
            throw new EntityNotFoundError(this.repository.target, id);
        }

        entity.updatedAt = new Date();
        return this.repository.save(entity);
    }

    /**
     * Patch an entity
     * Only update the fields that are provided
     *
     * @param id
     * @param entity
     */
    async patch(id: number, entity: Partial<T>): Promise<T> {
        const existing = await this.repository.findOneBy({id} as FindOptionsWhere<T>);
        if (!existing) {
            throw new EntityNotFoundError(this.repository.target, id);
        }

        const updated = {...existing, ...entity} as T;
        updated.updatedAt = new Date();

        return this.repository.save(updated);
    }

    /**
     * Delete an entity
     *
     * @param id
     */
    async delete(id: number): Promise<void> {
        const entity = await this.repository.findOneBy({id} as FindOptionsWhere<T>);
        if (!entity) {
            throw new EntityNotFoundError(this.repository.target, id);
        }

        entity.deletedAt = new Date();
        await this.repository.save(entity);
    }

    /**
     * Get the repository
     */
    getRepository(): Repository<T> {
        return this.repository;
    }
}