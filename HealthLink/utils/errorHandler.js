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

class AppError extends Error {
    constructor(message, statusCode, errorCode = null) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message = 'Validation failed', details = null) {
        super(message, 400, 'VALIDATION_ERROR');
        this.details = details;
        this.name = 'ValidationError';
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 401, 'AUTHENTICATION_ERROR');
        this.name = 'AuthenticationError';
    }
}

class AuthorizationError extends AppError {
    constructor(message = 'You do not have permission to perform this action') {
        super(message, 403, 'AUTHORIZATION_ERROR');
        this.name = 'AuthorizationError';
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404, 'NOT_FOUND_ERROR');
        this.name = 'NotFoundError';
    }
}

class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409, 'CONFLICT_ERROR');
        this.name = 'ConflictError';
    }
}

class DatabaseError extends AppError {
    constructor(message = 'Database operation failed') {
        super(message, 500, 'DATABASE_ERROR');
        this.name = 'DatabaseError';
    }
}

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

    if (res.headersSent) {
        return next(err);
    }

    const errorResponse = {
        success: false,
        status: err.statusCode || 500,
        message: err.message || 'Internal server error',
        timestamp: new Date().toISOString(),
        requestId: req.requestId || 'unknown',
        path: req.path
    };

    if (err.errorCode) {
        errorResponse.code = err.errorCode;
    }

    if (err.details) {
        errorResponse.errors = err.details;
    }

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

    res.status(errorResponse.status || 500).json(errorResponse);
};

/**
 * ============================================
 * ASYNC ROUTE WRAPPER
 * ============================================
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
 */
const notFoundHandler = (req, res, next) => {
    const err = new NotFoundError(`Route ${req.method} ${req.path} not found`);
    err.path = req.path;
    err.method = req.method;
    next(err);
};

module.exports = {
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
    errorLogger
};