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
 */

const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/**
 * ============================================
 * AUTHENTICATION MIDDLEWARE
 * ============================================
 * Validates JWT token and loads user data
 * Protects all dashboard routes from unauthorized access
 * 
 * @async
 * @function requireAuth
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @returns {void} Redirects to login if auth fails
 * @throws {Error} JWT verification errors
 */
const requireAuth = async (req, res, next) => {
    /**
     * Step 1: Extract token from cookies
     * Token is stored in HTTP-only cookie for security
     */
    const token = req.cookies.token;
    if (!token) {
        return res.redirect("/login");
    }

    try {
        /**
         * Step 2: Verify JWT token
         * Uses hardcoded secret for demonstration
         * TODO: Move to environment variable
         */
        const decoded = jwt.verify(token, "your_secret_key");
        
        /**
         * Step 3: Fetch user data
         * Loads full user document from database
         * This provides user details for dashboard rendering
         */
        req.user = await User.findById(decoded.id);
        
        /**
         * Step 4: Proceed to next middleware/route
         * User is authenticated and data is attached
         */
        next();
    } catch (error) {
        /**
         * Error Handling: Invalid or expired token
         * Redirect to login page for re-authentication
         */
        console.error("❌ Auth Error:", error);
        res.redirect("/login");
    }
};

/**
 * ============================================
 * PATIENT DASHBOARD
 * ============================================
 * Displays patient-specific information and features
 * 
 * @route GET /patient-dashboard
 * @access Private (Patient only)
 * @requires Authentication Middleware
 * @throws {403} If user is not a patient
 * 
 * @returns {Object} Rendered patient dashboard
 */
router.get("/patient-dashboard", requireAuth, (req, res) => {
    /**
     * Role Check: Verify user is a patient
     * Prevents doctors from accessing patient dashboard
     */
    if (req.user.role !== "patient") {
        return res.redirect("/login");
    }
    
    /**
     * Render patient dashboard view
     * Passes user data for personalized experience
     * 
     * TODO: Add appointment data and patient statistics
     */
    res.render("patientDashboard", { user: req.user });
});

/**
 * ============================================
 * DOCTOR DASHBOARD
 * ============================================
 * Displays doctor-specific information and features
 * 
 * @route GET /doctor-dashboard
 * @access Private (Doctor only)
 * @requires Authentication Middleware
 * @throws {403} If user is not a doctor
 * 
 * @returns {Object} Rendered doctor dashboard
 */
router.get("/doctor-dashboard", requireAuth, (req, res) => {
    /**
     * Role Check: Verify user is a doctor
     * Prevents patients from accessing doctor dashboard
     */
    if (req.user.role !== "doctor") {
        return res.redirect("/login");
    }
    
    /**
     * Render doctor dashboard view
     * Passes user data for personalized experience
     * 
     * TODO: Add appointment data and practice statistics
     */
    res.render("doctorDashboard", { user: req.user });
});

// Export the router for use in server.js
module.exports = router;