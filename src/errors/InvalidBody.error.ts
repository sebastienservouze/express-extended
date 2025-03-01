export class InvalidBodyError extends Error {

    errors: string[];

    constructor(...errors: string[]) {
        super(`Invalid body`);
        this.errors = errors;
    }

}