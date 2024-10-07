export class UnknownPropertyError extends Error {
    constructor(propertyName: string) {
        super(`Unknown property: ${propertyName}`);
    }
}