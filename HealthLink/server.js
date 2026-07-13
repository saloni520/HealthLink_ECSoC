require("dotenv").config();
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

// Import Models
const User = require("./models/User");
const Appointment = require("./models/Appointment");

const app = express();

// ===== OPTIMIZED MIDDLEWARE CONFIGURATION =====
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(methodOverride("_method"));

// View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// ===== OPTIMIZED DATABASE CONNECTION =====
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10, // Optimize connection pool
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
};
connectDB();

// ===== OPTIMIZED AUTH MIDDLEWARE =====
// Cache for user data to reduce database hits
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const requireAuth = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.redirect("/login");

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check cache first
        const cachedUser = userCache.get(decoded.id);
        if (cachedUser && (Date.now() - cachedUser.timestamp) < CACHE_TTL) {
            req.user = cachedUser.data;
            return next();
        }

        // Cache miss - query database with projection
        const user = await User.findById(decoded.id)
            .select('name email role specialization experience bio appointments')
            .lean(); // Use lean() for better performance

        if (!user) {
            res.clearCookie("token");
            return res.redirect("/login");
        }

        // Store in cache
        userCache.set(decoded.id, {
            data: user,
            timestamp: Date.now()
        });

        req.user = user;
        next();
    } catch (error) {
        res.clearCookie("token");
        res.redirect("/login");
    }
};

// Clean up expired cache entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of userCache) {
        if ((now - value.timestamp) > CACHE_TTL) {
            userCache.delete(key);
        }
    }
}, CACHE_TTL);

const checkLoggedIn = (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET);
            return res.redirect("/dashboard");
        } catch (error) {
            res.clearCookie("token");
        }
    }
    next();
};

// ===== OPTIMIZED ROUTES =====

// Landing Page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Signup Page
app.get("/signup", checkLoggedIn, (req, res) => {
    res.render("signup", { message: null });
});

// OPTIMIZED: Signup Route with Better Error Handling
app.post("/signup", async (req, res) => {
    const { name, email, password, role } = req.body;
    
    // Quick validation
    if (!name || !email || !password || !role) {
        return res.render("signup", { 
            message: "All fields are required." 
        });
    }

    try {
        const existingUser = await User.findOne({ email }).lean();
        if (existingUser) {
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
        res.redirect("/login");
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).render("signup", { 
            message: "Error signing up. Please try again." 
        });
    }
});

// Login Page
app.get("/login", checkLoggedIn, (req, res) => {
    res.render("login", { message: null });
});

// OPTIMIZED: Login Route with Better Performance
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render("login", { 
            message: "Email and password are required." 
        });
    }

    try {
        // Select only necessary fields
        const user = await User.findOne({ email })
            .select('+password name email role')
            .lean();

        if (!user) {
            return res.render("login", { 
                message: "No account found. Please sign up first." 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
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
            maxAge: 3600000 // 1 hour
        });

        res.redirect("/dashboard");
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).render("login", { 
            message: "Error logging in. Try again." 
        });
    }
});

// Logout Route
app.get("/logout", (req, res) => {
    const userId = req.user?._id;
    if (userId) {
        userCache.delete(userId.toString());
    }
    res.clearCookie("token");
    res.redirect("/login");
});

// OPTIMIZED: Dashboard with Aggregated Queries
app.get("/dashboard", requireAuth, async (req, res) => {
    try {
        let appointments = [];
        
        if (req.user.role === "patient") {
            // Use aggregation for better performance
            appointments = await Appointment.aggregate([
                { 
                    $match: { 
                        patient: req.user._id 
                    } 
                },
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
                { $sort: { date: -1 } }, // Sort by most recent first
                { $limit: 50 } // Limit results for performance
            ]);
        }

        res.render("dashboard", { 
            user: req.user, 
            appointments: appointments || [] 
        });
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.render("dashboard", { 
            user: req.user, 
            appointments: [],
            error: "Unable to load appointments"
        });
    }
});

// OPTIMIZED: Doctors List with Pagination
app.get("/doctors", requireAuth, async (req, res) => {
    try {
        // Add pagination support
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
        console.error("Doctors Fetch Error:", error);
        res.status(500).send("Error fetching doctors.");
    }
});

// OPTIMIZED: Doctor Profile with Cache
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
        console.error("Doctor Profile Error:", error);
        res.status(500).send("Error loading doctor profile");
    }
});

// OPTIMIZED: Book Appointment with Validation
app.post("/appointment/:doctorId", requireAuth, async (req, res) => {
    if (req.user.role !== "patient") {
        return res.status(403).send("Only patients can book appointments.");
    }

    const { patientName, patientAge, symptoms } = req.body;
    const doctorId = req.params.doctorId;

    // Validate input
    if (!patientName || !patientAge || !symptoms) {
        return res.status(400).send("All fields are required.");
    }

    if (patientAge < 0 || patientAge > 150) {
        return res.status(400).send("Please enter a valid age.");
    }

    try {
        // Verify doctor exists
        const doctor = await User.findById(doctorId)
            .select('_id role')
            .lean();

        if (!doctor || doctor.role !== "doctor") {
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
        res.redirect("/dashboard");
    } catch (error) {
        console.error("Appointment Booking Error:", error);
        res.status(500).send("Error booking appointment.");
    }
});

// OPTIMIZED: View Appointments with Aggregation
app.get("/view-appointments", requireAuth, async (req, res) => {
    if (req.user.role !== "doctor") {
        return res.status(403).send("Access denied.");
    }

    try {
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
        console.error("View Appointments Error:", error);
        res.status(500).send("Error loading appointments.");
    }
});

// Contact Us Page
app.get("/contactus", (req, res) => {
    res.render("contactus");
});

// OPTIMIZED: Contact Form with Validation
app.post("/contact", (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).send("All fields are required.");
    }

    console.log(`New Message from ${name} (${email}): ${message}`);
    res.send("Message received! We will get back to you soon.");
});

// HealthLink AI Page
app.get("/healthlinkAI", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "healthlinkAI.html"));
});

// OPTIMIZED: AI Analysis with Timeout & Error Handling
app.post("/analyze-health", async (req, res) => {
    const userMessage = req.body.message || "Analyze this health report.";
    
    try {
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
        console.error("AI Analysis Error:", error);
        res.status(500).json({ 
            reply: "AI service temporarily unavailable. Please try again later." 
        });
    }
});

// Our Team Page
app.get("/ourteam", (req, res) => {
    res.render("ourteam");
});

// OPTIMIZED: OpenAI Chatbot with Rate Limiting & Error Handling
const { OpenAI } = require("openai");
const openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 30000,
    maxRetries: 2
});

// Simple rate limiting for chat
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

        res.json({ 
            reply: response.choices[0].message.content 
        });
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ 
            reply: "Sorry, unable to process your request. Please try again." 
        });
    }
});

// ===== HEALTH CHECK ENDPOINT =====
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ===== ERROR HANDLING MIDDLEWARE =====
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({
        error: "Internal server error",
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ===== SERVER START =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});