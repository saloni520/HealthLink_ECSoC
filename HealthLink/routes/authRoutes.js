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
 */

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
 */
router.post("/signup", async (req, res) => {
    const { name, email, password, role } = req.body;

    // Input validation
    if (!name || !email || !password || !role) {
        logger.warn('Signup: Missing required fields', { email });
        return res.status(400).json({
            success: false,
            status: 400,
            message: "All fields are required.",
            timestamp: new Date().toISOString()
        });
    }

    try {
        // Check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            logger.warn('Signup: User already exists', { email });
            return res.status(409).json({
                success: false,
                status: 409,
                message: "User already exists. Please login.",
                timestamp: new Date().toISOString()
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        await newUser.save();

        logger.info('Signup: User registered successfully', {
            userId: newUser._id,
            email,
            role
        });

        res.status(201).json({
            success: true,
            status: 201,
            message: "User registered successfully. Please login.",
            data: {
                id: newUser._id,
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
            message: "Error signing up. Please try again.",
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * ============================================
 * USER LOGIN ENDPOINT
 * ============================================
 */
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
        logger.warn('Login: Missing credentials', { email });
        return res.status(400).json({
            success: false,
            status: 400,
            message: "Email and password are required.",
            timestamp: new Date().toISOString()
        });
    }

    try {
        // Find user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            logger.warn('Login: User not found', { email });
            return res.status(404).json({
                success: false,
                status: 404,
                message: "No account found. Please sign up first.",
                timestamp: new Date().toISOString()
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            logger.warn('Login: Invalid password', { email, userId: user._id });
            return res.status(401).json({
                success: false,
                status: 401,
                message: "Incorrect password. Try again.",
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
            email,
            role: user.role
        });

        res.status(200).json({
            success: true,
            status: 200,
            message: `Login successful! Welcome, ${user.role}`,
            data: {
                token,
                user: {
                    id: user._id,
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
            email
        });
        res.status(500).json({
            success: false,
            status: 500,
            message: "Error logging in. Try again.",
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;