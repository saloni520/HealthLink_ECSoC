/**
 * ============================================
 * ERROR HANDLER UTILITIES
 * ============================================
 * Centralized error handling middleware and
 * custom error classes for the HealthLink application.
 * 
 * @module utils/errorHandler
 */

/**
 * ============================================
 * CUSTOM ERROR CLASSES
 * ============================================
 */

 * Extend native Error class with status codes
 * and error codes for consistent handling
 */

/**
 * Base App Error class
 * All custom errors extend this class
 */
class AppError extends Error {
    constructor(message, statusCode, errorCode = null) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Validation Error (400)
 * Used for invalid input data
 */
class ValidationError extends AppError {
    constructor(message = 'Validation failed', details = null) {
        super(message, 400, 'VALIDATION_ERROR');
        this.details = details;
        this.name = 'ValidationError';
    }
}

/**
 * Authentication Error (401)
 * Used for unauthenticated requests
 */
class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 401, 'AUTHENTICATION_ERROR');
        this.name = 'AuthenticationError';
    }
}

/**
 * Authorization Error (403)
 * Used for forbidden requests (wrong role)
 */
class AuthorizationError extends AppError {
    constructor(message = 'You do not have permission to perform this action') {
        super(message, 403, 'AUTHORIZATION_ERROR');
        this.name = 'AuthorizationError';
    }
}

/**
 * Not Found Error (404)
 * Used for resources that don't exist
 */
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404, 'NOT_FOUND_ERROR');
        this.name = 'NotFoundError';
    }
}

/**
 * Conflict Error (409)
 * Used for duplicate resources (e.g., duplicate email)
 */
class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409, 'CONFLICT_ERROR');
        this.name = 'ConflictError';
    }
}

/**
 * Database Error (500)
 * Used for database operation failures
 */
class DatabaseError extends AppError {
    constructor(message = 'Database operation failed') {
        super(message, 500, 'DATABASE_ERROR');
        this.name = 'DatabaseError';
    }
}

/**
 * External Service Error (500)
 * Used for failed external API calls
 */
class ExternalServiceError extends AppError {
    constructor(message = 'External service unavailable', service = null) {
        super(message, 500, 'EXTERNAL_SERVICE_ERROR');
        this.service = service;
        this.name = 'ExternalServiceError';
    }
}

/**
 * ============================================
 * LOGGER FOR ERROR HANDLER
 * ============================================
 */

const errorLogger = {
    info: (message, meta = {}) => {
        console.log(`[${new Date().toISOString()}] ℹ️ ${message}`, meta);
    },
    error: (message, meta = {}) => {
        console.error(`[${new Date().toISOString()}] ❌ ${message}`, meta);
    },
    warn: (message, meta = {}) => {
        console.warn(`[${new Date().toISOString()}] ⚠️ ${message}`, meta);
    }
};

/**
 * ============================================
 * CENTRALIZED ERROR HANDLING MIDDLEWARE
 * ============================================
 */
const errorHandler = (err, req, res, next) => {
 * 
 * This middleware handles all errors thrown in the application.
 * It provides consistent error responses and logging.
 * 
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
    // Log the error with context
    errorLogger.error('Error occurred', {
        error: err.message,
        stack: err.stack,
        name: err.name,
        path: req.path,
        method: req.method,
        requestId: req.requestId || 'unknown',
        userId: req.user?._id || 'unauthenticated',
        ip: req.ip,
        statusCode: err.statusCode || 500
    });

    // Check if headers already sent
    if (res.headersSent) {
        return next(err);
    }

    // Build error response
    const errorResponse = {
        success: false,
        status: err.statusCode || 500,
        message: err.message || 'Internal server error',
        timestamp: new Date().toISOString(),
        requestId: req.requestId || 'unknown',
        path: req.path
    };

    // Add error code if available
    if (err.errorCode) {
        errorResponse.code = err.errorCode;
    }

    if (err.details) {
        errorResponse.errors = err.details;
    }

    // Add validation details if available
    if (err.details) {
        errorResponse.details = err.details;
    }

    // Add stack trace in development only
    if (process.env.NODE_ENV === 'development' && err.stack) {
        errorResponse.stack = err.stack;
    }

    // Handle validation errors specially
    if (err.name === 'ValidationError') {
        errorResponse.status = 400;
        errorResponse.code = 'VALIDATION_ERROR';
        if (!err.details) {
            errorResponse.message = err.message || 'Validation failed';
        }
    } else if (err.name === 'AuthenticationError') {
        errorResponse.status = 401;
        errorResponse.code = 'AUTHENTICATION_ERROR';
    } else if (err.name === 'AuthorizationError') {
        errorResponse.status = 403;
        errorResponse.code = 'AUTHORIZATION_ERROR';
    } else if (err.name === 'NotFoundError') {
        errorResponse.status = 404;
        errorResponse.code = 'NOT_FOUND_ERROR';
    } else if (err.name === 'ConflictError') {
        errorResponse.status = 409;
        errorResponse.code = 'CONFLICT_ERROR';
    } else if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    // Specific error type handling
    if (err.name === 'ValidationError') {
        errorResponse.message = err.message || 'Validation failed';
        errorResponse.status = 400;
        errorResponse.code = 'VALIDATION_ERROR';
    } else if (err.name === 'AuthenticationError') {
        errorResponse.message = err.message || 'Authentication required';
        errorResponse.status = 401;
        errorResponse.code = 'AUTHENTICATION_ERROR';
    } else if (err.name === 'AuthorizationError') {
        errorResponse.message = err.message || 'Permission denied';
        errorResponse.status = 403;
        errorResponse.code = 'AUTHORIZATION_ERROR';
    } else if (err.name === 'NotFoundError') {
        errorResponse.message = err.message || 'Resource not found';
        errorResponse.status = 404;
        errorResponse.code = 'NOT_FOUND_ERROR';
    } else if (err.name === 'ConflictError') {
        errorResponse.message = err.message || 'Resource already exists';
        errorResponse.status = 409;
        errorResponse.code = 'CONFLICT_ERROR';
    } else if (err.name === 'MongoError' || err.name === 'MongoServerError') {
        // Handle MongoDB specific errors
        if (err.code === 11000) {
            errorResponse.message = 'Duplicate entry found';
            errorResponse.status = 409;
            errorResponse.code = 'DUPLICATE_ERROR';
            errorResponse.details = {
                field: Object.keys(err.keyPattern || {})[0] || 'unknown'
            };
        } else {
            errorResponse.message = 'Database operation failed';
            errorResponse.status = 500;
            errorResponse.code = 'DATABASE_ERROR';
        }
    } else if (err.name === 'JsonWebTokenError') {
        errorResponse.message = 'Invalid authentication token';
        errorResponse.status = 401;
        errorResponse.code = 'INVALID_TOKEN';
    } else if (err.name === 'TokenExpiredError') {
        errorResponse.message = 'Authentication token expired';
        errorResponse.status = 401;
        errorResponse.code = 'TOKEN_EXPIRED';
    }

    // Send response
    res.status(errorResponse.status || 500).json(errorResponse);
};

/**
 * ============================================
 * ASYNC ROUTE WRAPPER
 * ============================================
 * 
 * Wraps async route handlers to automatically
 * catch errors and pass them to the error handler
 * 
 * @param {Function} fn - Async route handler
 * @returns {Function} Wrapped route handler
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * ============================================
 * NOT FOUND HANDLER
 * ============================================
 * 
 * Handles 404 errors for undefined routes
 */
const notFoundHandler = (req, res, next) => {
    const err = new NotFoundError(`Route ${req.method} ${req.path} not found`);
    err.path = req.path;
    err.method = req.method;
    next(err);
};

module.exports = {
/**
 * ============================================
 * EXPORT ALL UTILITIES
 * ============================================
 */

module.exports = {
    // Custom error classes
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    DatabaseError,
    ExternalServiceError,
    errorHandler,
    asyncHandler,
    notFoundHandler,

    // Middleware
    errorHandler,
    asyncHandler,
    notFoundHandler,

    // Logger
    errorLogger
};