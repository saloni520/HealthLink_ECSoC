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

/**
 * ============================================
 * USER REGISTRATION ENDPOINT
 * ============================================
 * Creates a new user account with role-based access
 * 
 * @route POST /signup
 * @access Public
 * @param {string} name - User's full name
 * @param {string} email - User's email address (must be unique)
 * @param {string} password - User's password (will be hashed)
 * @param {string} role - User's role: "patient" or "doctor"
 * 
 * @returns {Object} Redirects to login page on success
 * @throws {500} Database or server error
 */
router.post("/signup", async (req, res) => {
    // Extract user data from request body
    const { name, email, password, role } = req.body;

    try {
        /**
         * Step 1: Check for existing user
         * Prevents duplicate account creation
         */
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.send("User already exists. Please login.");
        }

        /**
         * Step 2: Hash password
         * bcrypt hash with 10 salt rounds for security
         * This ensures passwords are never stored in plaintext
         */
        const hashedPassword = await bcrypt.hash(password, 10);
        
        /**
         * Step 3: Create new user document
         * Store hashed password instead of plaintext
         */
        const newUser = new User({ 
            name, 
            email, 
            password: hashedPassword, 
            role 
        });
        
        /**
         * Step 4: Save to database
         * Persist the new user document in MongoDB
         */
        await newUser.save();

        /**
         * Step 5: Redirect to login
         * User must login with their new credentials
         */
        res.redirect("/login");
    } catch (error) {
        /**
         * Error Handling: Catch any database or server errors
         * Return 500 status with user-friendly message
         */
        console.error("❌ Signup Error:", error);
        res.status(500).send("Error signing up. Try again.");
    }
});

/**
 * ============================================
 * USER LOGIN ENDPOINT
 * ============================================
 * Authenticates users and issues JWT tokens
 * 
 * @route POST /login
 * @access Public
 * @param {string} email - User's registered email
 * @param {string} password - User's password
 * 
 * @returns {Object} Success message with user role
 * @throws {500} Database or server error
 */
router.post("/login", async (req, res) => {
    // Extract credentials from request body
    const { email, password } = req.body;

    try {
        /**
         * Step 1: Find user by email
         * Users are identified by their unique email address
         */
        const user = await User.findOne({ email });
        if (!user) {
            return res.send("No account found. Please sign up first.");
        }

        /**
         * Step 2: Verify password
         * Compare plaintext password with stored hash
         * bcrypt.compare handles salt verification automatically
         */
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.send("Incorrect password. Try again.");
        }

        /**
         * Step 3: Generate JWT Token
         * Token contains user ID and role for authorization
         * Expires in 1 hour for security
         * 
         * TODO: Move JWT_SECRET to environment variable
         * Currently using hardcoded secret for demonstration
         */
        const token = jwt.sign(
            { 
                id: user._id,      // User identifier
                role: user.role    // User role for RBAC
            }, 
            "your_secret_key",     // JWT signing key (TODO: Move to .env)
            { expiresIn: "1h" }    // Token expiration time
        );

        /**
         * Step 4: Send success response
         * In production, this token should be set as HTTP-only cookie
         * Currently returning plain text for simplicity
         */
        res.send(`Login successful! Welcome, ${user.role}`);
    } catch (error) {
        /**
         * Error Handling: Catch authentication errors
         * Return 500 status with generic error message
         */
        console.error("❌ Login Error:", error);
        res.status(500).send("Error logging in. Try again.");
    }
});

// Export the router for use in server.js
module.exports = router;