/**
 * ============================================
 * REQUEST VALIDATION UTILITIES
 * ============================================
 * Provides reusable validation functions and
 * middleware for consistent input validation
 * across the HealthLink application.
 * 
 * @module utils/validation
 */

const { ValidationError } = require('./errorHandler');

/**
 * ============================================
 * VALIDATION RULES
 * ============================================
 * Collection of reusable validation functions
 * that can be used individually or combined
 */

const rules = {
    /**
     * Check if field is required
     * @param {string} field - Field name
     * @param {string} message - Custom error message
     * @returns {Function} Validation function
     */
    required: (field, message = null) => {
        return (value) => {
            if (value === undefined || value === null || value === '') {
                throw new ValidationError(
                    message || `${field} is required`,
                    [{ field, message: message || `${field} is required` }]
                );
            }
            return value;
        };
    },

    /**
     * Check if field is a valid email
     * @param {string} field - Field name
     * @param {string} message - Custom error message
     * @returns {Function} Validation function
     */
    email: (field, message = null) => {
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        return (value) => {
            if (value && !emailRegex.test(value)) {
                throw new ValidationError(
                    message || `${field} must be a valid email address`,
                    [{ field, message: message || `${field} must be a valid email address` }]
                );
            }
            return value;
        };
    },

    /**
     * Check if field has minimum length
     * @param {string} field - Field name
     * @param {number} min - Minimum length
     * @param {string} message - Custom error message
     * @returns {Function} Validation function
     */
    minLength: (field, min, message = null) => {
        return (value) => {
            if (value && value.length < min) {
                throw new ValidationError(
                    message || `${field} must be at least ${min} characters long`,
                    [{ field, message: message || `${field} must be at least ${min} characters long` }]
                );
            }
            return value;
        };
    },

    /**
     * Check if field has maximum length
     * @param {string} field - Field name
     * @param {number} max - Maximum length
     * @param {string} message - Custom error message
     * @returns {Function} Validation function
     */
    maxLength: (field, max, message = null) => {
        return (value) => {
            if (value && value.length > max) {
                throw new ValidationError(
                    message || `${field} cannot exceed ${max} characters`,
                    [{ field, message: message || `${field} cannot exceed ${max} characters` }]
                );
            }
            return value;
        };
    },

    /**
     * Check if field is within a range
     * @param {string} field - Field name
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @param {string} message - Custom error message
     * @returns {Function} Validation function
     */
    range: (field, min, max, message = null) => {
        return (value) => {
            if (value !== undefined && value !== null && value !== '') {
                const num = Number(value);
                if (isNaN(num) || num < min || num > max) {
                    throw new ValidationError(
                        message || `${field} must be between ${min} and ${max}`,
                        [{ field, message: message || `${field} must be between ${min} and ${max}` }]
                    );
                }
            }
            return value;
        };
    },

    /**
     * Check if field value is in allowed values
     * @param {string} field - Field name
     * @param {Array} allowedValues - Array of allowed values
     * @param {string} message - Custom error message
     * @returns {Function} Validation function
     */
    oneOf: (field, allowedValues, message = null) => {
        return (value) => {
            if (value && !allowedValues.includes(value)) {
                throw new ValidationError(
                    message || `${field} must be one of: ${allowedValues.join(', ')}`,
                    [{ field, message: message || `${field} must be one of: ${allowedValues.join(', ')}` }]
                );
            }
            return value;
        };
    },

    /**
     * Check if field is a string
     * @param {string} field - Field name
     * @param {string} message - Custom error message
     * @returns {Function} Validation function
     */
    string: (field, message = null) => {
        return (value) => {
            if (value !== undefined && value !== null && typeof value !== 'string') {
                throw new ValidationError(
                    message || `${field} must be a string`,
                    [{ field, message: message || `${field} must be a string` }]
                );
            }
            return value;
        };
    },

    /**
     * Check if field is a number
     * @param {string} field - Field name
     * @param {string} message - Custom error message
     * @returns {Function} Validation function
     */
    number: (field, message = null) => {
        return (value) => {
            if (value !== undefined && value !== null && value !== '') {
                const num = Number(value);
                if (isNaN(num)) {
                    throw new ValidationError(
                        message || `${field} must be a number`,
                        [{ field, message: message || `${field} must be a number` }]
                    );
                }
            }
            return value;
        };
    }
};

/**
 * ============================================
 * VALIDATION MIDDLEWARE
 * ============================================
 * 
 * Creates middleware that validates request body
 * against a schema of validation rules
 * 
 * @param {Object} schema - Validation schema
 * @param {string} schema.fieldName - Validation rule or array of rules
 * @param {string} target - Request property to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware
 * 
 * @example
 * router.post('/login', validate({
 *     email: [rules.required('email'), rules.email('email')],
 *     password: [rules.required('password'), rules.minLength('password', 8)]
 * }), handler);
 */
const validate = (schema, target = 'body') => {
    return (req, res, next) => {
        try {
            const errors = [];
            const data = req[target] || {};

            // Validate each field in schema
            for (const [field, validators] of Object.entries(schema)) {
                const value = data[field];
                const validatorArray = Array.isArray(validators) ? validators : [validators];

                for (const validator of validatorArray) {
                    try {
                        validator(value);
                    } catch (error) {
                        if (error.name === 'ValidationError') {
                            errors.push(...(error.details || [{ field, message: error.message }]));
                            break; // Stop validation for this field after first error
                        }
                        throw error;
                    }
                }
            }

            // If there are validation errors, throw them
            if (errors.length > 0) {
                throw new ValidationError('Validation failed', errors);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Creates middleware that validates request query parameters
 * @param {Object} schema - Validation schema
 * @returns {Function} Express middleware
 */
const validateQuery = (schema) => {
    return validate(schema, 'query');
};

/**
 * Creates middleware that validates request URL parameters
 * @param {Object} schema - Validation schema
 * @returns {Function} Express middleware
 */
const validateParams = (schema) => {
    return validate(schema, 'params');
};

/**
 * Creates middleware that validates request body
 * @param {Object} schema - Validation schema
 * @returns {Function} Express middleware
 */
const validateBody = (schema) => {
    return validate(schema, 'body');
};

/**
 * ============================================
 * COMMON VALIDATION SCHEMAS
 * ============================================
 * Pre-defined validation schemas for common
 * use cases across the application
 */

const schemas = {
    /**
     * User registration schema
     */
    signup: {
        name: [
            rules.required('name'),
            rules.string('name'),
            rules.minLength('name', 2),
            rules.maxLength('name', 100)
        ],
        email: [
            rules.required('email'),
            rules.string('email'),
            rules.email('email')
        ],
        password: [
            rules.required('password'),
            rules.string('password'),
            rules.minLength('password', 6)
        ],
        role: [
            rules.required('role'),
            rules.string('role'),
            rules.oneOf('role', ['patient', 'doctor'])
        ]
    },

    /**
     * User login schema
     */
    login: {
        email: [
            rules.required('email'),
            rules.string('email'),
            rules.email('email')
        ],
        password: [
            rules.required('password'),
            rules.string('password'),
            rules.minLength('password', 6)
        ]
    },

    /**
     * Appointment booking schema
     */
    appointment: {
        patientName: [
            rules.required('patientName'),
            rules.string('patientName'),
            rules.minLength('patientName', 2),
            rules.maxLength('patientName', 100)
        ],
        patientAge: [
            rules.required('patientAge'),
            rules.number('patientAge'),
            rules.range('patientAge', 0, 150)
        ],
        symptoms: [
            rules.required('symptoms'),
            rules.string('symptoms'),
            rules.minLength('symptoms', 3),
            rules.maxLength('symptoms', 1000)
        ]
    },

    /**
     * Contact form schema
     */
    contact: {
        name: [
            rules.required('name'),
            rules.string('name'),
            rules.minLength('name', 2),
            rules.maxLength('name', 100)
        ],
        email: [
            rules.required('email'),
            rules.string('email'),
            rules.email('email')
        ],
        message: [
            rules.required('message'),
            rules.string('message'),
            rules.minLength('message', 5),
            rules.maxLength('message', 500)
        ]
    },

    /**
     * Chat message schema
     */
    chat: {
        message: [
            rules.required('message'),
            rules.string('message'),
            rules.minLength('message', 1),
            rules.maxLength('message', 1000)
        ]
    },

    /**
     * Health analysis schema
     */
    healthAnalysis: {
        message: [
            rules.string('message'),
            rules.maxLength('message', 2000)
        ]
    }
};

module.exports = {
    rules,
    validate,
    validateBody,
    validateQuery,
    validateParams,
    schemas
};