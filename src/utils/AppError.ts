/**
 * Custom error class that extends the built-in Error class to include HTTP status codes.
 * This class is used throughout the application to create structured error objects
 * that can be properly handled by error middleware and sent as HTTP responses.
 * 
 * @class AppError
 * @extends Error
 * 
 * @example
 * ```typescript
 * // Create a 404 Not Found error
 * const notFoundError = new AppError(404, "User not found");
 * 
 * // Create a 400 Bad Request error
 * const validationError = new AppError(400, "Invalid input data");
 * ```
 */
// /src/utils/AppError.ts
export class AppError extends Error {
    statusCode: number;
    constructor(statusCode: number , message: string) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

