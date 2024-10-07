import {FindOptionsWhere, IsNull, Repository} from "typeorm";
import {AbstractEntity} from "../../db/abstract-entity.model";
import {Page} from "./page.type";

export abstract class CrudService<T extends AbstractEntity> {

    protected constructor(protected readonly repository: Repository<T>) {
    }

    async search(criteria?: FindOptionsWhere<T>, page: number = 1, pageSize: number = 10): Promise<Page<T>> {
        const finalCriteria: any = criteria ?? {};
        finalCriteria.deletedAt = IsNull();

        const [data, total] = await this.repository.findAndCount({
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

    async consult(id: number): Promise<T | null> {
        return await this.repository.findOneBy({
            id: id,
            deletedAt: IsNull(),
        } as unknown as FindOptionsWhere<T>);
    }

    async create(entity: T): Promise<T> {
        entity.createdAt = new Date();
        return this.repository.save(entity);
    }

    async update(id: number, entity: T): Promise<T> {
        if (id !== entity.id) {
            throw new Error(`Entity id ${entity.id} does not match path parameter id ${id}`);
        }

        const existing = await this.repository.findOneBy({id} as FindOptionsWhere<T>);
        if (!existing) {
            throw new Error(`Entity with id ${id} not found for update`);
        }

        entity.updatedAt = new Date();
        return this.repository.save(entity);
    }

    async delete(id: number): Promise<void> {
        const entity = await this.repository.findOneBy({id} as FindOptionsWhere<T>);
        if (!entity) {
            throw new Error(`Entity with id ${id} not found for deletion`);
        }

        entity.deletedAt = new Date();
        await this.repository.save(entity);
    }
}