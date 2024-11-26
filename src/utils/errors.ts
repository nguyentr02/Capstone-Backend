// Custom error classes
export class AppError extends Error {
    constructor(
        public statusCode: number,
        message: string
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string) {
        super(401, message);
        this.name = 'AuthenticationError';
    }
}
export class ValidationError extends AppError {
    constructor(message: string) {
        super(400, message);
        this.name = 'ValidationError';
    }
}