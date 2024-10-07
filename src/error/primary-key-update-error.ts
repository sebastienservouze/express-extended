export class PrimaryKeyUpdateError extends Error {
    constructor(key: string) {
        super(`Primary key cannot be updated: ${key}`);
    }
}