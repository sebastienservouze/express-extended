export class MissingRequiredPropertyError extends Error {
    constructor(propertyName: string) {
        super(`Missing required property: ${propertyName}`);
    }
}