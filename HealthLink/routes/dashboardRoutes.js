/**
 * ============================================
 * DASHBOARD ROUTES
 * ============================================
 * Handles role-specific dashboard access for
 * patients and doctors. Includes authentication
 * middleware to protect routes.
 * 
 * @module routes/dashboardRoutes
 * @requires express
 * @requires jsonwebtoken
 * @requires ../models/User
 * @requires ../utils/errorHandler
 */

const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Import error handling utilities
const {
    asyncHandler,
    AuthenticationError,
    AuthorizationError,
    ValidationError
} = require("../utils/errorHandler");

const router = express.Router();

const logger = {
    info: (msg, meta = {}) => console.log(`[${new Date().toISOString()}] ℹ️ ${msg}`, meta),
    error: (msg, meta = {}) => console.error(`[${new Date().toISOString()}] ❌ ${msg}`, meta),
    warn: (msg, meta = {}) => console.warn(`[${new Date().toISOString()}] ⚠️ ${msg}`, meta),
    debug: (msg, meta = {}) => {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[${new Date().toISOString()}] 🔍 ${msg}`, meta);
        }
    }
};

/**
 * ============================================
 * AUTHENTICATION MIDDLEWARE
 * ============================================
 */
const requireAuth = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        logger.warn('Auth: No token provided', {
            path: req.path,
            ip: req.ip
        });
        return next(new AuthenticationError('Authentication required'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            logger.warn('Auth: User not found', {
                userId: decoded.id,
                path: req.path
            });
            return next(new AuthenticationError('User not found'));
        }

        logger.debug('Auth: User authenticated', {
            userId: req.user._id,
            role: req.user.role,
            path: req.path
        });

        next();
    } catch (error) {
        logger.error('Auth: Token verification failed', {
            error: error.message,
            path: req.path
        });
        next(new AuthenticationError('Invalid or expired token'));
    }
};

/**
 * ============================================
 * PATIENT DASHBOARD
 * ============================================
 */
router.get("/patient-dashboard", requireAuth, asyncHandler(async (req, res) => {
    if (req.user.role !== "patient") {
        logger.warn('Patient dashboard: Unauthorized access attempt', {
            userId: req.user._id,
            role: req.user.role
        });
        throw new AuthorizationError('Access denied. Patient only.');
    }

    logger.info('Patient dashboard accessed', {
        userId: req.user._id,
        email: req.user.email
    });

    res.render("patientDashboard", {
        user: req.user,
        message: null
    });
}));

/**
 * ============================================
 * DOCTOR DASHBOARD
 * ============================================
 */
router.get("/doctor-dashboard", requireAuth, asyncHandler(async (req, res) => {
    if (req.user.role !== "doctor") {
        logger.warn('Doctor dashboard: Unauthorized access attempt', {
            userId: req.user._id,
            role: req.user.role
        });
        throw new AuthorizationError('Access denied. Doctor only.');
    }

    logger.info('Doctor dashboard accessed', {
        userId: req.user._id,
        email: req.user.email
    });

    res.render("doctorDashboard", {
        user: req.user,
        message: null
    });
}));

module.exports = router;