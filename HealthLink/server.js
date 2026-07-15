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
const axios = require("axios");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");

// Import application models
const User = require("./models/User");
const Appointment = require("./models/Appointment");

// ============================================
// LOGGING SYSTEM
// ============================================

/**
 * Custom Logger with different log levels
 * Provides structured logging with timestamps and request IDs
 */
const logger = {
    /**
     * Log an info message
     * @param {string} message - Log message
     * @param {Object} meta - Additional metadata
     */
    info: (message, meta = {}) => {
        console.log(`[${new Date().toISOString()}] ℹ️ INFO: ${message}`, meta);
    },
    
    /**
     * Log a warning message
     * @param {string} message - Log message
     * @param {Object} meta - Additional metadata
     */
    warn: (message, meta = {}) => {
        console.warn(`[${new Date().toISOString()}] ⚠️ WARN: ${message}`, meta);
    },
    
    /**
     * Log an error message
     * @param {string} message - Log message
     * @param {Object} meta - Additional metadata
     */
    error: (message, meta = {}) => {
        console.error(`[${new Date().toISOString()}] ❌ ERROR: ${message}`, meta);
    },
    
    /**
     * Log a debug message (only in development)
     * @param {string} message - Log message
     * @param {Object} meta - Additional metadata
     */
    debug: (message, meta = {}) => {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[${new Date().toISOString()}] 🔍 DEBUG: ${message}`, meta);
        }
    }
};

// ============================================
// EXPRESS APP INITIALIZATION
// ============================================

const app = express();

// ============================================
// REQUEST ID MIDDLEWARE
// ============================================

/**
 * Generate unique request ID for tracking
 * Attaches to each request for logging correlation
 */
app.use((req, res, next) => {
    req.requestId = crypto.randomBytes(8).toString('hex');
    res.setHeader('X-Request-Id', req.requestId);
    next();
});

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(methodOverride("_method"));

// ============================================
// VIEW ENGINE SETUP
// ============================================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// ============================================
// DATABASE CONNECTION
// ============================================

/**
 * Establishes connection to MongoDB Atlas
 * Includes retry logic for connection failures
 */
const connectDB = async (retryCount = 0) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 5000;

    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        logger.info('MongoDB Connected Successfully');
    } catch (error) {
        logger.error('MongoDB Connection Failed', {
            error: error.message,
            retryCount,
            maxRetries: MAX_RETRIES
        });

        if (retryCount < MAX_RETRIES) {
            logger.info(`Retrying connection in ${RETRY_DELAY/1000} seconds...`);
            setTimeout(() => connectDB(retryCount + 1), RETRY_DELAY);
        } else {
            logger.error('Max retries reached. Exiting process.');
            process.exit(1);
        }
    }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
    logger.info('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', { error: err.message });
});

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB connection disconnected');
});

// Gracefully close MongoDB on app termination
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed due to app termination');
    process.exit(0);
});

connectDB();

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Authentication Middleware - Verifies JWT and loads user
 */
const requireAuth = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        logger.warn('Authentication failed: No token provided', {
            requestId: req.requestId,
            path: req.path
        });
        return res.redirect("/login");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check cache first
        const cachedUser = userCache.get(decoded.id);
        if (cachedUser && (Date.now() - cachedUser.timestamp) < CACHE_TTL) {
            req.user = cachedUser.data;
            logger.debug('User loaded from cache', { userId: decoded.id });
            return next();
        }

        // Cache miss - query database
        const user = await User.findById(decoded.id)
            .select('name email role specialization experience bio appointments')
            .lean();

        if (!user) {
            logger.warn('User not found for token', {
                userId: decoded.id,
                requestId: req.requestId
            });
            res.clearCookie("token");
            return res.redirect("/login");
        }

        // Store in cache
        userCache.set(decoded.id, {
            data: user,
            timestamp: Date.now()
        });

        req.user = user;
        logger.debug('User loaded from database', { userId: decoded.id });
        next();
    } catch (error) {
        logger.error('Token verification failed', {
            error: error.message,
            requestId: req.requestId
        });
        res.clearCookie("token");
        res.redirect("/login");
    }
};

// Cache cleanup interval
setInterval(() => {
    const now = Date.now();
    let expiredCount = 0;
    for (const [key, value] of userCache) {
        if ((now - value.timestamp) > CACHE_TTL) {
            userCache.delete(key);
            expiredCount++;
        }
    }
    if (expiredCount > 0) {
        logger.debug(`Cache cleanup: Removed ${expiredCount} expired entries`);
    }
}, CACHE_TTL);

/**
 * Check Logged In Middleware
 */
const checkLoggedIn = (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET);
            logger.debug('User already logged in, redirecting to dashboard');
            return res.redirect("/dashboard");
        } catch (error) {
            res.clearCookie("token");
        }
    }
    next();
};

// ============================================
// STANDARDIZED ERROR RESPONSE
// ============================================

/**
 * Standardized error response handler
 */
const sendErrorResponse = (res, status, message, code = null, details = null) => {
    const response = {
        success: false,
        status,
        message,
        timestamp: new Date().toISOString()
    };

    if (code) response.code = code;
    if (details && process.env.NODE_ENV === 'development') {
        response.details = details;
    }

    return res.status(status).json(response);
};

/**
 * Standardized success response handler
 */
const sendSuccessResponse = (res, status, data = null, message = null) => {
    const response = {
        success: true,
        status,
        timestamp: new Date().toISOString()
    };

    if (message) response.message = message;
    if (data) response.data = data;

    return res.status(status).json(response);
};

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * Landing Page
 */
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

// ============================================
// AUTHENTICATION ROUTES
// ============================================

/**
 * Signup Page
 */
app.get("/signup", checkLoggedIn, (req, res) => {
    res.render("signup", { message: null });
});

/**
 * User Registration Handler
 */
app.post("/signup", async (req, res) => {
    const { name, email, password, role } = req.body;
    
    logger.info('Signup attempt', {
        email,
        role,
        requestId: req.requestId
    });

    // Validate required fields
    if (!name || !email || !password || !role) {
        logger.warn('Signup failed: Missing required fields', {
            email,
            requestId: req.requestId
        });
        return res.render("signup", {
            message: "All fields are required."
        });
    }

    try {
        const existingUser = await User.findOne({ email }).lean();
        if (existingUser) {
            logger.warn('Signup failed: User already exists', {
                email,
                requestId: req.requestId
            });
            return res.render("signup", {
                message: "User already exists. Please login."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        await newUser.save();

        logger.info('User registered successfully', {
            userId: newUser._id,
            email,
            role,
            requestId: req.requestId
        });

        res.redirect("/login");
    } catch (error) {
        logger.error('Signup error', {
            error: error.message,
            stack: error.stack,
            email,
            requestId: req.requestId
        });
        res.status(500).render("signup", {
            message: "Error signing up. Please try again."
        });
    }
});

/**
 * Login Page
 */
app.get("/login", checkLoggedIn, (req, res) => {
    res.render("login", { message: null });
});

/**
 * User Login Handler
 */
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    logger.info('Login attempt', {
        email,
        requestId: req.requestId
    });

    if (!email || !password) {
        logger.warn('Login failed: Missing credentials', {
            email,
            requestId: req.requestId
        });
        return res.render("login", {
            message: "Email and password are required."
        });
    }

    try {
        const user = await User.findOne({ email })
            .select('+password name email role')
            .lean();

        if (!user) {
            logger.warn('Login failed: User not found', {
                email,
                requestId: req.requestId
            });
            return res.render("login", {
                message: "No account found. Please sign up first."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            logger.warn('Login failed: Invalid password', {
                email,
                userId: user._id,
                requestId: req.requestId
            });
            return res.render("login", {
                message: "Incorrect password. Try again."
            });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000
        });

        logger.info('User logged in successfully', {
            userId: user._id,
            email,
            role: user.role,
            requestId: req.requestId
        });

        res.redirect("/dashboard");
    } catch (error) {
        logger.error('Login error', {
            error: error.message,
            stack: error.stack,
            email,
            requestId: req.requestId
        });
        res.status(500).render("login", {
            message: "Error logging in. Try again."
        });
    }
});

/**
 * Logout Handler
 */
app.get("/logout", (req, res) => {
    const userId = req.user?._id;
    if (userId) {
        userCache.delete(userId.toString());
        logger.info('User logged out', {
            userId: userId.toString(),
            requestId: req.requestId
        });
    }
    res.clearCookie("token");
    res.redirect("/login");
});

// ============================================
// DASHBOARD ROUTES
// ============================================

/**
 * Main Dashboard
 */
app.get("/dashboard", requireAuth, async (req, res) => {
    try {
        let appointments = [];

        if (req.user.role === "patient") {
            appointments = await Appointment.aggregate([
                { $match: { patient: req.user._id } },
                {
                    $lookup: {
                        from: "users",
                        localField: "doctor",
                        foreignField: "_id",
                        as: "doctorDetails"
                    }
                },
                {
                    $unwind: {
                        path: "$doctorDetails",
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
                        "doctorName": "$doctorDetails.name",
                        "doctorSpecialization": "$doctorDetails.specialization"
                    }
                },
                { $sort: { date: -1 } },
                { $limit: 50 }
            ]);
        }

        logger.debug('Dashboard loaded', {
            userId: req.user._id,
            role: req.user.role,
            appointmentCount: appointments.length,
            requestId: req.requestId
        });

        res.render("dashboard", {
            user: req.user,
            appointments: appointments || []
        });
    } catch (error) {
        logger.error('Dashboard error', {
            error: error.message,
            stack: error.stack,
            userId: req.user?._id,
            requestId: req.requestId
        });
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
 */
app.get("/doctors", requireAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [doctors, totalCount] = await Promise.all([
            User.find({ role: "doctor" })
                .select('name specialization experience bio')
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments({ role: "doctor" })
        ]);

        logger.debug('Doctors list fetched', {
            userId: req.user._id,
            page,
            limit,
            count: doctors.length,
            total: totalCount,
            requestId: req.requestId
        });

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
        logger.error('Doctors fetch error', {
            error: error.message,
            stack: error.stack,
            userId: req.user?._id,
            requestId: req.requestId
        });
        res.status(500).send("Error fetching doctors.");
    }
});

/**
 * Doctor Profile
 */
app.get("/doctor/:id", requireAuth, async (req, res) => {
    try {
        const doctor = await User.findById(req.params.id)
            .select('name specialization experience bio email')
            .lean();

        if (!doctor) {
            logger.warn('Doctor not found', {
                doctorId: req.params.id,
                userId: req.user._id,
                requestId: req.requestId
            });
            return res.status(404).send("Doctor not found");
        }

        res.render("doctorProfile", { doctor });
    } catch (error) {
        logger.error('Doctor profile error', {
            error: error.message,
            stack: error.stack,
            doctorId: req.params.id,
            userId: req.user?._id,
            requestId: req.requestId
        });
        res.status(500).send("Error loading doctor profile");
    }
});

// ============================================
// APPOINTMENT ROUTES
// ============================================

/**
 * Book Appointment
 */
app.post("/appointment/:doctorId", requireAuth, async (req, res) => {
    if (req.user.role !== "patient") {
        logger.warn('Non-patient tried to book appointment', {
            userId: req.user._id,
            role: req.user.role,
            requestId: req.requestId
        });
        return res.status(403).send("Only patients can book appointments.");
    }

    const { patientName, patientAge, symptoms } = req.body;
    const doctorId = req.params.doctorId;

    logger.info('Appointment booking attempt', {
        patientId: req.user._id,
        doctorId,
        requestId: req.requestId
    });

    if (!patientName || !patientAge || !symptoms) {
        logger.warn('Appointment booking failed: Missing fields', {
            patientId: req.user._id,
            doctorId,
            requestId: req.requestId
        });
        return res.status(400).send("All fields are required.");
    }

    if (patientAge < 0 || patientAge > 150) {
        logger.warn('Appointment booking failed: Invalid age', {
            patientId: req.user._id,
            age: patientAge,
            requestId: req.requestId
        });
        return res.status(400).send("Please enter a valid age.");
    }

    try {
        const doctor = await User.findById(doctorId)
            .select('_id role')
            .lean();

        if (!doctor || doctor.role !== "doctor") {
            logger.warn('Appointment booking failed: Invalid doctor', {
                doctorId,
                patientId: req.user._id,
                requestId: req.requestId
            });
            return res.status(404).send("Doctor not found.");
        }

        const appointment = new Appointment({
            patientName,
            patientAge: parseInt(patientAge),
            symptoms,
            doctor: doctorId,
            patient: req.user._id,
            date: new Date(),
            status: "Pending",
        });

        await appointment.save();

        logger.info('Appointment booked successfully', {
            appointmentId: appointment._id,
            patientId: req.user._id,
            doctorId,
            requestId: req.requestId
        });

        res.redirect("/dashboard");
    } catch (error) {
        logger.error('Appointment booking error', {
            error: error.message,
            stack: error.stack,
            patientId: req.user?._id,
            doctorId,
            requestId: req.requestId
        });
        res.status(500).send("Error booking appointment.");
    }
});

/**
 * View Appointments (Doctor)
 */
app.get("/view-appointments", requireAuth, async (req, res) => {
    if (req.user.role !== "doctor") {
        logger.warn('Non-doctor tried to view appointments', {
            userId: req.user._id,
            role: req.user.role,
            requestId: req.requestId
        });
        return res.status(403).send("Access denied.");
    }

    try {
        const appointments = await Appointment.aggregate([
            { $match: { doctor: req.user._id } },
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

        logger.debug('Appointments viewed by doctor', {
            doctorId: req.user._id,
            count: appointments.length,
            requestId: req.requestId
        });

        res.render("doctorAppointments", {
            doctor: req.user,
            appointments
        });
    } catch (error) {
        logger.error('View appointments error', {
            error: error.message,
            stack: error.stack,
            doctorId: req.user?._id,
            requestId: req.requestId
        });
        res.status(500).send("Error loading appointments.");
    }
});

// ============================================
// CONTACT ROUTES
// ============================================

app.get("/contactus", (req, res) => {
    res.render("contactus");
});

app.post("/contact", (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).send("All fields are required.");
    }

    logger.info('New contact message', {
        name,
        email,
        messageLength: message.length,
        requestId: req.requestId
    });

    res.send("Message received! We will get back to you soon.");
});

// ============================================
// AI & HEALTH ROUTES
// ============================================

app.get("/healthlinkAI", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "healthlinkAI.html"));
});

app.post("/analyze-health", async (req, res) => {
    const userMessage = req.body.message || "Analyze this health report.";

    logger.info('Health analysis request', {
        messageLength: userMessage.length,
        requestId: req.requestId
    });

    try {
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1",
            { inputs: userMessage },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
                },
                timeout: 30000
            }
        );

        logger.debug('Health analysis successful', {
            responseLength: response.data[0]?.generated_text?.length || 0,
            requestId: req.requestId
        });

        res.json({
            reply: response.data[0]?.generated_text || "No response from AI."
        });
    } catch (error) {
        logger.error('Health analysis error', {
            error: error.message,
            stack: error.stack,
            requestId: req.requestId
        });
        res.status(500).json({
            reply: "AI service temporarily unavailable. Please try again later."
        });
    }
});

// ============================================
// TEAM ROUTES
// ============================================

app.get("/ourteam", (req, res) => {
    res.render("ourteam");
});

// ============================================
// OPENAI CHATBOT
// ============================================

const { OpenAI } = require("openai");
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 30000,
    maxRetries: 2
});

const chatRateLimiter = new Map();

app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;
    const userId = req.user?._id || req.ip;

    if (!userMessage) {
        return res.status(400).json({
            reply: "Please provide a message."
        });
    }

    // Rate limiting
    const userRate = chatRateLimiter.get(userId) || { count: 0, timestamp: Date.now() };
    if (Date.now() - userRate.timestamp > 60000) {
        userRate.count = 0;
        userRate.timestamp = Date.now();
    }

    if (userRate.count >= 10) {
        logger.warn('Chat rate limit exceeded', {
            userId,
            requestId: req.requestId
        });
        return res.status(429).json({
            reply: "Rate limit exceeded. Please try again later."
        });
    }

    try {
        userRate.count++;
        chatRateLimiter.set(userId, userRate);

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a helpful healthcare assistant." },
                { role: "user", content: userMessage }
            ],
            max_tokens: 150,
            temperature: 0.7,
        });

        logger.debug('Chat response successful', {
            userId,
            messageLength: userMessage.length,
            responseLength: response.choices[0].message.content.length,
            requestId: req.requestId
        });

        res.json({
            reply: response.choices[0].message.content
        });
    } catch (error) {
        logger.error('Chat error', {
            error: error.message,
            stack: error.stack,
            userId,
            requestId: req.requestId
        });
        res.status(500).json({
            reply: "Sorry, unable to process your request. Please try again."
        });
    }
});

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================

app.get("/health", (req, res) => {
    const healthStatus = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        requestId: req.requestId,
        environment: process.env.NODE_ENV || 'development',
        memory: {
            used: process.memoryUsage().heapUsed / 1024 / 1024,
            total: process.memoryUsage().heapTotal / 1024 / 1024
        }
    };

    res.json(healthStatus);
});

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
    logger.warn('404 Not Found', {
        path: req.path,
        method: req.method,
        requestId: req.requestId
    });
    res.status(404).json({
        success: false,
        status: 404,
        message: "Route not found",
        timestamp: new Date().toISOString()
    });
});

// ============================================
// GLOBAL ERROR HANDLING
// ============================================

/**
 * Global Error Handler
 * Catches all unhandled errors
 */
app.use((err, req, res, next) => {
    logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        requestId: req.requestId,
        userId: req.user?._id
    });

    // Check if headers already sent
    if (res.headersSent) {
        return next(err);
    }

    res.status(err.status || 500).json({
        success: false,
        status: err.status || 500,
        message: err.message || "Internal server error",
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

/**
 * Unhandled Promise Rejection Handler
 */
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection', {
        reason: reason?.message || reason,
        stack: reason?.stack,
        promise: promise
    });
});

/**
 * Uncaught Exception Handler
 */
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
        error: error.message,
        stack: error.stack
    });
    // Graceful shutdown
    setTimeout(() => {
        process.exit(1);
    }, 5000);
});

/**
 * Graceful Shutdown Handler
 */
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
        mongoose.connection.close();
    });
});

// ============================================
// SERVER START
// ============================================

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`, {
        environment: process.env.NODE_ENV || 'development',
        port: PORT
    });
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Visit: http://localhost:${PORT}`);
});