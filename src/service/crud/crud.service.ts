import {FindOptionsWhere, Repository} from "typeorm";
import {NEntity} from "../../db/n-entity.model";
import {Page} from "./page.type";

export abstract class CrudService<T extends NEntity> {

    protected constructor(protected readonly repository: Repository<T>) {
    }

    async search(criteria: FindOptionsWhere<T>, page: number = 1, pageSize: number = 10): Promise<Page<T>> {
        return this.repository.findAndCount({
            where: criteria,
            skip: (page - 1) * pageSize,
            take: pageSize
        });
    }

    async consult(id: number): Promise<T | null> {
        return this.repository.findOneBy({id} as FindOptionsWhere<T>);
    }

    async create(entity: T): Promise<T> {
        return this.repository.save(entity);
    }

    async update(entity: T): Promise<T> {
        return this.repository.save(entity);
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }
}