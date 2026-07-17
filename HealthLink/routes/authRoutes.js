/**
 * ============================================
 * AUTHENTICATION ROUTES
 * ============================================
 * Handles user registration and login functionality
 * Uses JWT for session management and bcrypt for
 * password security.
 * 
 * @module routes/authRoutes
 * @requires express
 * @requires bcryptjs
 * @requires jsonwebtoken
 * @requires ../models/User
 * @requires ../utils/passwordValidator
 */

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { validatePassword } = require("../utils/passwordValidator");

const router = express.Router();

// Simple logger for auth routes
const logger = {
    info: (msg, meta = {}) => console.log(`[${new Date().toISOString()}] ℹ️ ${msg}`, meta),
    error: (msg, meta = {}) => console.error(`[${new Date().toISOString()}] ❌ ${msg}`, meta),
    warn: (msg, meta = {}) => console.warn(`[${new Date().toISOString()}] ⚠️ ${msg}`, meta)
};

/**
 * ============================================
 * USER REGISTRATION ENDPOINT
 * ============================================
 * Enhanced with strong password validation
 */
router.post("/signup", async (req, res) => {
    const { name, email, password, role } = req.body;

    // Input validation - Generic error for security
    if (!name || !email || !password || !role) {
        logger.warn('Signup: Missing required fields', { email });
        return res.status(400).json({
            success: false,
            status: 400,
            message: "All fields are required.",
            timestamp: new Date().toISOString()
        });
    }

    // Email format validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
        logger.warn('Signup: Invalid email format', { email });
        return res.status(400).json({
            success: false,
            status: 400,
            message: "Please enter a valid email address.",
            timestamp: new Date().toISOString()
        });
    }

    // Role validation
    if (!['patient', 'doctor'].includes(role)) {
        logger.warn('Signup: Invalid role', { email, role });
        return res.status(400).json({
            success: false,
            status: 400,
            message: "Invalid role specified.",
            timestamp: new Date().toISOString()
        });
    }

    try {
        // Check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            // Generic error for security - don't reveal if user exists
            logger.warn('Signup: User already exists', { email });
            return res.status(409).json({
                success: false,
                status: 409,
                message: "Account creation failed. Please try again.",
                timestamp: new Date().toISOString()
            });
        }

        // ============================================
        // PASSWORD VALIDATION
        // ============================================
        const validationResult = validatePassword(password, { name, email });
        
        if (!validationResult.valid) {
            logger.warn('Signup: Password validation failed', {
                email,
                errors: validationResult.errors
            });
            
            // Only return first error for security
            return res.status(400).json({
                success: false,
                status: 400,
                message: validationResult.errors[0],
                // In development, return all errors for debugging
                ...(process.env.NODE_ENV === 'development' && {
                    errors: validationResult.errors
                }),
                timestamp: new Date().toISOString()
            });
        }

        // Hash password with bcrypt (higher salt rounds for security)
        const saltRounds = 12; // Increased from 10 for better security
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const newUser = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role
        });

        await newUser.save();

        logger.info('Signup: User registered successfully', {
            userId: newUser._id,
            email,
            role
        });

        // Don't expose user ID in response
        res.status(201).json({
            success: true,
            status: 201,
            message: "Account created successfully. Please login.",
            data: {
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error('Signup error', {
            error: error.message,
            stack: error.stack,
            email
        });
        res.status(500).json({
            success: false,
            status: 500,
            message: "An error occurred during registration. Please try again.",
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * ============================================
 * USER LOGIN ENDPOINT
 * ============================================
 * Enhanced with input sanitization and security
 */
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Input validation - Generic error for security
    if (!email || !password) {
        logger.warn('Login: Missing credentials', { email });
        return res.status(400).json({
            success: false,
            status: 400,
            message: "Email and password are required.",
            timestamp: new Date().toISOString()
        });
    }

    // Sanitize email
    const sanitizedEmail = email.toLowerCase().trim();

    try {
        // Find user - don't reveal if email exists
        const user = await User.findOne({ email: sanitizedEmail }).select('+password');
        if (!user) {
            // Generic error for security
            logger.warn('Login: User not found', { email: sanitizedEmail });
            // Use same message as invalid password to prevent user enumeration
            return res.status(401).json({
                success: false,
                status: 401,
                message: "Invalid email or password.",
                timestamp: new Date().toISOString()
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            logger.warn('Login: Invalid password', {
                email: sanitizedEmail,
                userId: user._id
            });
            return res.status(401).json({
                success: false,
                status: 401,
                message: "Invalid email or password.",
                timestamp: new Date().toISOString()
            });
        }

        // Generate JWT Token
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET || "your_secret_key",
            { expiresIn: "1h" }
        );

        logger.info('Login: User logged in successfully', {
            userId: user._id,
            email: sanitizedEmail,
            role: user.role
        });

        // Don't expose user ID in response
        res.status(200).json({
            success: true,
            status: 200,
            message: "Login successful!",
            data: {
                token,
                user: {
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error('Login error', {
            error: error.message,
            stack: error.stack,
            email: sanitizedEmail
        });
        res.status(500).json({
            success: false,
            status: 500,
            message: "An error occurred during login. Please try again.",
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;