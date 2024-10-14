export class InvalidBodyError extends Error {

    constructor(...errors: string[]) {
        super(`Invalid body:\n- ${errors.join('\n- ')}`);
    }

}