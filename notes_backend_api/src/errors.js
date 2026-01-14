/**
 * Base application error with stable code + httpStatus.
 */
class AppError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   * @param {number} httpStatus
   * @param {Record<string, unknown>=} details
   */
  constructor(code, message, httpStatus, details) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.httpStatus = httpStatus;
    this.details = details;
  }
}

class ValidationError extends AppError {
  constructor(message, details) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

class AuthRequiredError extends AppError {
  constructor(message = 'Authentication required') {
    super('AUTH_REQUIRED', message, 401);
  }
}

class InvalidCredentialsError extends AppError {
  constructor() {
    super('AUTH_INVALID_CREDENTIALS', 'Email or password is incorrect', 401);
  }
}

class InvalidTokenError extends AppError {
  constructor(message = 'Invalid or expired token', details) {
    super('AUTH_INVALID_TOKEN', message, 401, details);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super('FORBIDDEN', message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super('NOT_FOUND', message, 404);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super('CONFLICT', message, 409);
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthRequiredError,
  InvalidCredentialsError,
  InvalidTokenError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
};
