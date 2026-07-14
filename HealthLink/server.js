/**
 * ============================================
 * HEALTHLINK - MAIN APPLICATION SERVER
 * ============================================
 * This is the entry point for the HealthLink application.
 * It handles all server-side logic, API routing,
 * authentication, and database operations.
 * 
 * @version 1.0.0
 * @author Team ApexLegion
 */

// ============================================
// MODULE IMPORTS & CONFIGURATION
// ============================================

// Load environment variables from .env file
require("dotenv").config();

// Third-party dependencies
const axios = require("axios");              // HTTP client for external API calls
const express = require("express");          // Web framework for Node.js
const mongoose = require("mongoose");        // MongoDB ODM for database operations
const cors = require("cors");                // Cross-Origin Resource Sharing middleware
const methodOverride = require("method-override"); // Support PUT/DELETE in forms
const bodyParser = require("body-parser");   // Parse incoming request bodies
const path = require("path");                // File path utilities
const bcrypt = require("bcryptjs");          // Password hashing library
const jwt = require("jsonwebtoken");         // JSON Web Token authentication
const cookieParser = require("cookie-parser"); // Parse cookie headers

// Import application models
const User = require("./models/User");              // User schema/model
const Appointment = require("./models/Appointment"); // Appointment schema/model

// ============================================
// EXPRESS APP INITIALIZATION
// ============================================

const app = express(); // Create Express application instance

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

/**
 * Configure middleware with optimized settings
 * Order matters: Middleware executes in sequence
 */
app.use(express.json({ limit: '10mb' }));        // Parse JSON bodies (max 10MB)
app.use(cookieParser());                         // Parse cookies for auth tokens
app.use(cors({                                   // Enable CORS for cross-origin requests
    origin: process.env.CLIENT_URL || '*',      // Allow specific origin or all
    credentials: true                           // Allow cookies in cross-origin requests
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies
app.use(methodOverride("_method"));              // Enable HTTP method override via query param

// ============================================
// VIEW ENGINE SETUP
// ============================================

/**
 * Configure EJS template engine for server-side rendering
 * Views directory: ./views
 * Static files: ./public (CSS, JS, images)
 */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// ============================================
// DATABASE CONNECTION
// ============================================

/**
 * Establishes connection to MongoDB Atlas
 * Uses connection pooling for performance
 * 
 * @async
 * @function connectDB
 * @throws {Error} If connection fails, process exits
 */
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,              // Use new MongoDB URL parser
            useUnifiedTopology: true,           // Use unified topology engine
            maxPoolSize: 10,                    // Maximum connections in pool
            serverSelectionTimeoutMS: 5000,     // Timeout for server selection (5s)
            socketTimeoutMS: 45000,             // Socket timeout (45s)
        });
        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1); // Exit process on fatal error
    }
};
connectDB(); // Initiate database connection

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

/**
 * In-memory cache for user data
 * Reduces database load by caching authenticated user objects
 * 
 * @type {Map<string, {data: Object, timestamp: number}>}
 */
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // Cache Time-To-Live: 5 minutes

/**
 * Authentication Middleware - Verifies JWT and loads user
 * 
 * This middleware:
 * 1. Extracts JWT token from cookies
 * 2. Verifies token validity
 * 3. Checks cache for user data first
 * 4. Falls back to database query on cache miss
 * 5. Attaches user object to request for downstream use
 * 
 * @async
 * @function requireAuth
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Redirects to login if authentication fails
 */
const requireAuth = async (req, res, next) => {
    // Extract token from cookies
    const token = req.cookies.token;
    if (!token) return res.redirect("/login");

    try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 1. Check cache for user data
        const cachedUser = userCache.get(decoded.id);
        if (cachedUser && (Date.now() - cachedUser.timestamp) < CACHE_TTL) {
            req.user = cachedUser.data; // Use cached user data
            return next(); // Proceed to next middleware
        }

        // 2. Cache miss - query database
        // Using .select() to fetch only required fields
        // Using .lean() for plain JavaScript objects (better performance)
        const user = await User.findById(decoded.id)
            .select('name email role specialization experience bio appointments')
            .lean();

        // If user doesn't exist, clear invalid token
        if (!user) {
            res.clearCookie("token");
            return res.redirect("/login");
        }

        // Store in cache for future requests
        userCache.set(decoded.id, {
            data: user,
            timestamp: Date.now()
        });

        // Attach user to request object
        req.user = user;
        next(); // Proceed to next middleware
    } catch (error) {
        // Token invalid or expired - clear cookie and redirect
        res.clearCookie("token");
        res.redirect("/login");
    }
};

/**
 * Cache Cleanup - Removes expired entries periodically
 * Runs every CACHE_TTL interval
 */
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of userCache) {
        if ((now - value.timestamp) > CACHE_TTL) {
            userCache.delete(key);
        }
    }
}, CACHE_TTL);

/**
 * Check Logged In Middleware
 * Redirects authenticated users away from login/signup pages
 * 
 * @function checkLoggedIn
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const checkLoggedIn = (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET);
            return res.redirect("/dashboard"); // Already logged in
        } catch (error) {
            res.clearCookie("token"); // Invalid token
        }
    }
    next(); // Not logged in - proceed
};

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * Landing Page
 * Serves the main entry point of the application
 */
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

// ============================================
// AUTHENTICATION ROUTES
// ============================================

/**
 * Signup Page
 * Renders the registration form
 * Redirects if user is already logged in
 */
app.get("/signup", checkLoggedIn, (req, res) => {
    res.render("signup", { message: null });
});

/**
 * User Registration Handler
 * Creates new user account with validation
 * 
 * @route POST /signup
 * @param {string} name - User's full name
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @param {string} role - User's role (patient/doctor)
 */
app.post("/signup", async (req, res) => {
    const { name, email, password, role } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !role) {
        return res.render("signup", { 
            message: "All fields are required." 
        });
    }

    try {
        // Check if user already exists (case-insensitive via .lean())
        const existingUser = await User.findOne({ email }).lean();
        if (existingUser) {
            return res.render("signup", { 
                message: "User already exists. Please login." 
            });
        }

        // Hash password with bcrypt (10 salt rounds)
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user document
        const newUser = new User({ 
            name, 
            email, 
            password: hashedPassword, 
            role 
        });
        
        await newUser.save(); // Persist to database
        res.redirect("/login"); // Redirect to login page
    } catch (error) {
        console.error("❌ Signup Error:", error);
        res.status(500).render("signup", { 
            message: "Error signing up. Please try again." 
        });
    }
});

/**
 * Login Page
 * Renders the login form
 * Redirects if user is already logged in
 */
app.get("/login", checkLoggedIn, (req, res) => {
    res.render("login", { message: null });
});

/**
 * User Login Handler
 * Authenticates user and issues JWT token
 * 
 * @route POST /login
 * @param {string} email - User's email address
 * @param {string} password - User's password
 */
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
        return res.render("login", { 
            message: "Email and password are required." 
        });
    }

    try {
        // Find user by email
        // .select('+password') includes password field (excluded by default)
        const user = await User.findOne({ email })
            .select('+password name email role')
            .lean();

        if (!user) {
            return res.render("login", { 
                message: "No account found. Please sign up first." 
            });
        }

        // Verify password using bcrypt compare
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render("login", { 
                message: "Incorrect password. Try again." 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role }, // Payload
            process.env.JWT_SECRET,             // Secret key
            { expiresIn: "1h" }                 // Token expiration
        );

        // Set HTTP-only cookie with token
        res.cookie("token", token, { 
            httpOnly: true,                     // Not accessible via JavaScript
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            maxAge: 3600000                     // 1 hour in milliseconds
        });

        res.redirect("/dashboard");
    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).render("login", { 
            message: "Error logging in. Try again." 
        });
    }
});

/**
 * Logout Handler
 * Clears authentication token and cache
 */
app.get("/logout", (req, res) => {
    const userId = req.user?._id;
    if (userId) {
        userCache.delete(userId.toString()); // Remove from cache
    }
    res.clearCookie("token"); // Clear cookie
    res.redirect("/login");
});

// ============================================
// DASHBOARD ROUTES
// ============================================

/**
 * Main Dashboard
 * Displays user-specific data and appointments
 * Uses aggregation for efficient data fetching
 * 
 * @route GET /dashboard
 * @requires Authentication
 */
app.get("/dashboard", requireAuth, async (req, res) => {
    try {
        let appointments = [];
        
        // If user is patient, fetch their appointments
        if (req.user.role === "patient") {
            // Using MongoDB aggregation for better performance
            // This joins appointments with doctor details
            appointments = await Appointment.aggregate([
                { 
                    $match: { 
                        patient: req.user._id 
                    } 
                },
                {
                    $lookup: {
                        from: "users",              // Collection to join
                        localField: "doctor",        // Field from appointments
                        foreignField: "_id",         // Field from users
                        as: "doctorDetails"          // Output array name
                    }
                },
                {
                    $unwind: {
                        path: "$doctorDetails",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {                     // Select fields to return
                        patientName: 1,
                        patientAge: 1,
                        symptoms: 1,
                        date: 1,
                        status: 1,
                        "doctorName": "$doctorDetails.name",
                        "doctorSpecialization": "$doctorDetails.specialization"
                    }
                },
                { $sort: { date: -1 } },             // Newest first
                { $limit: 50 }                       // Limit results
            ]);
        }

        res.render("dashboard", { 
            user: req.user, 
            appointments: appointments || [] 
        });
    } catch (error) {
        console.error("❌ Dashboard Error:", error);
        res.render("dashboard", { 
            user: req.user, 
            appointments: [],
            error: "Unable to load appointments"
        });
    }
});

// ============================================
// DOCTOR ROUTES
// ============================================

/**
 * Doctors List
 * Paginated list of all doctors with search capabilities
 * 
 * @route GET /doctors
 * @requires Authentication
 * @param {number} page - Page number for pagination (default: 1)
 * @param {number} limit - Items per page (default: 10)
 */
app.get("/doctors", requireAuth, async (req, res) => {
    try {
        // Parse pagination parameters from query string
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Execute queries in parallel for better performance
        const [doctors, totalCount] = await Promise.all([
            User.find({ role: "doctor" })
                .select('name specialization experience bio')
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments({ role: "doctor" })
        ]);

        res.render("doctors", {
            doctors,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
                limit
            }
        });
    } catch (error) {
        console.error("❌ Doctors Fetch Error:", error);
        res.status(500).send("Error fetching doctors.");
    }
});

/**
 * Doctor Profile
 * Detailed view of a specific doctor
 * 
 * @route GET /doctor/:id
 * @requires Authentication
 * @param {string} id - Doctor's user ID
 */
app.get("/doctor/:id", requireAuth, async (req, res) => {
    try {
        const doctor = await User.findById(req.params.id)
            .select('name specialization experience bio email')
            .lean();

        if (!doctor) {
            return res.status(404).send("Doctor not found");
        }

        res.render("doctorProfile", { doctor });
    } catch (error) {
        console.error("❌ Doctor Profile Error:", error);
        res.status(500).send("Error loading doctor profile");
    }
});

// ============================================
// APPOINTMENT ROUTES
// ============================================

/**
 * Book Appointment
 * Creates a new appointment for a patient
 * 
 * @route POST /appointment/:doctorId
 * @requires Authentication (Patient only)
 * @param {string} doctorId - Target doctor's ID
 * @param {string} patientName - Patient's full name
 * @param {number} patientAge - Patient's age
 * @param {string} symptoms - Description of symptoms
 */
app.post("/appointment/:doctorId", requireAuth, async (req, res) => {
    // Verify user is a patient
    if (req.user.role !== "patient") {
        return res.status(403).send("Only patients can book appointments.");
    }

    const { patientName, patientAge, symptoms } = req.body;
    const doctorId = req.params.doctorId;

    // Validate required fields
    if (!patientName || !patientAge || !symptoms) {
        return res.status(400).send("All fields are required.");
    }

    // Validate age range
    if (patientAge < 0 || patientAge > 150) {
        return res.status(400).send("Please enter a valid age.");
    }

    try {
        // Verify doctor exists and has correct role
        const doctor = await User.findById(doctorId)
            .select('_id role')
            .lean();

        if (!doctor || doctor.role !== "doctor") {
            return res.status(404).send("Doctor not found.");
        }

        // Create appointment document
        const appointment = new Appointment({
            patientName,
            patientAge: parseInt(patientAge),
            symptoms,
            doctor: doctorId,
            patient: req.user._id,
            date: new Date(),
            status: "Pending",
        });

        await appointment.save(); // Save to database
        res.redirect("/dashboard");
    } catch (error) {
        console.error("❌ Appointment Booking Error:", error);
        res.status(500).send("Error booking appointment.");
    }
});

/**
 * View Appointments (Doctor)
 * Displays all appointments for a doctor
 * Uses aggregation for enriched data
 * 
 * @route GET /view-appointments
 * @requires Authentication (Doctor only)
 */
app.get("/view-appointments", requireAuth, async (req, res) => {
    // Verify user is a doctor
    if (req.user.role !== "doctor") {
        return res.status(403).send("Access denied.");
    }

    try {
        // Using aggregation to join patient details
        const appointments = await Appointment.aggregate([
            {
                $match: {
                    doctor: req.user._id
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "patient",
                    foreignField: "_id",
                    as: "patientDetails"
                }
            },
            {
                $unwind: {
                    path: "$patientDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    patientName: 1,
                    patientAge: 1,
                    symptoms: 1,
                    date: 1,
                    status: 1,
                    "patientEmail": "$patientDetails.email",
                    "patientPhone": "$patientDetails.phone"
                }
            },
            { $sort: { date: -1 } },
            { $limit: 100 }
        ]);

        res.render("doctorAppointments", { 
            doctor: req.user, 
            appointments 
        });
    } catch (error) {
        console.error("❌ View Appointments Error:", error);
        res.status(500).send("Error loading appointments.");
    }
});

// ============================================
// CONTACT ROUTES
// ============================================

/**
 * Contact Page
 * Renders the contact form
 */
app.get("/contactus", (req, res) => {
    res.render("contactus");
});

/**
 * Contact Form Handler
 * Processes and logs user messages
 * 
 * @route POST /contact
 * @param {string} name - Sender's name
 * @param {string} email - Sender's email
 * @param {string} message - Message content
 */
app.post("/contact", (req, res) => {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
        return res.status(400).send("All fields are required.");
    }

    // Log message (would send email in production)
    console.log(`📧 New Message from ${name} (${email}): ${message}`);
    res.send("Message received! We will get back to you soon.");
});

// ============================================
// AI & HEALTH ROUTES
// ============================================

/**
 * HealthLink AI Page
 * Serves the AI health assistant interface
 */
app.get("/healthlinkAI", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "healthlinkAI.html"));
});

/**
 * AI Health Analysis
 * Uses Hugging Face API for health report analysis
 * 
 * @route POST /analyze-health
 * @param {string} message - Health-related query or report
 */
app.post("/analyze-health", async (req, res) => {
    const userMessage = req.body.message || "Analyze this health report.";
    
    try {
        // Call Hugging Face inference API
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1",
            { inputs: userMessage },
            {
                headers: { 
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}` 
                },
                timeout: 30000 // 30 second timeout
            }
        );
        
        res.json({ 
            reply: response.data[0]?.generated_text || "No response from AI." 
        });
    } catch (error) {
        console.error("❌ AI Analysis Error:", error);
        res.status(500).json({ 
            reply: "AI service temporarily unavailable. Please try again later." 
        });
    }
});

// ============================================
// TEAM ROUTES
// ============================================

/**
 * Our Team Page
 * Displays team information
 */
app.get("/ourteam", (req, res) => {
    res.render("ourteam");
});

// ============================================
// OPENAI CHATBOT
// ============================================

// Import OpenAI library
const { OpenAI } = require("openai");

/**
 * OpenAI Client Configuration
 * Configured with timeout and retry options
 */
const openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 30000,      // 30 second request timeout
    maxRetries: 2        // Retry up to 2 times on failure
});

/**
 * Rate Limiter for Chat Endpoint
 * Prevents abuse by limiting requests per user/IP
 * 
 * @type {Map<string, {count: number, timestamp: number}>}
 */
const chatRateLimiter = new Map();

/**
 * AI Chat Endpoint
 * Processes user messages using OpenAI's GPT
 * 
 * @route POST /chat
 * @param {string} message - User's chat message
 * @returns {Object} AI response
 */
app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;
    const userId = req.user?._id || req.ip; // Identify user by ID or IP

    // Validate message
    if (!userMessage) {
        return res.status(400).json({ 
            reply: "Please provide a message." 
        });
    }

    // Rate limiting check
    const userRate = chatRateLimiter.get(userId) || { count: 0, timestamp: Date.now() };
    
    // Reset counter if minute has passed
    if (Date.now() - userRate.timestamp > 60000) {
        userRate.count = 0;
        userRate.timestamp = Date.now();
    }
    
    // Check rate limit (10 requests per minute)
    if (userRate.count >= 10) {
        return res.status(429).json({ 
            reply: "Rate limit exceeded. Please try again later." 
        });
    }

    try {
        // Increment request count
        userRate.count++;
        chatRateLimiter.set(userId, userRate);

        // Call OpenAI API
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a helpful healthcare assistant." },
                { role: "user", content: userMessage }
            ],
            max_tokens: 150,      // Limit response length
            temperature: 0.7,      // Balance creativity vs. consistency
        });

        res.json({ 
            reply: response.choices[0].message.content 
        });
    } catch (error) {
        console.error("❌ Chat Error:", error);
        res.status(500).json({ 
            reply: "Sorry, unable to process your request. Please try again." 
        });
    }
});

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================

/**
 * Health Check Endpoint
 * Used for monitoring and uptime checks
 * 
 * @route GET /health
 * @returns {Object} System health status
 */
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Global Error Handler
 * Catches unhandled errors and returns appropriate responses
 * 
 * @middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
app.use((err, req, res, next) => {
    console.error("❌ Unhandled Error:", err);
    res.status(500).json({
        error: "Internal server error",
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============================================
// SERVER START
// ============================================

/**
 * Start the Express server
 * Listens on configured port
 */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
    console.log(`🔗 Visit: http://localhost:${PORT}`);
});