export class NotMatchingIdError extends Error {
    constructor(entityId: number, pathId: number) {
        super(`Entity id ${entityId} does not match path parameter id ${pathId}`);
    }
}