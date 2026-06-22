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

// Import User and Appointment Models
const User = require("./models/User");
const Appointment = require("./models/Appointment");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Middleware to Check if User is Logged In
const requireAuth = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.redirect("/login");

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        res.clearCookie("token");
        res.redirect("/login");
    }
};

// Middleware to Redirect Logged-In Users Away from Login/Signup
const checkLoggedIn = (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return res.redirect("/dashboard");
        } catch (error) {
            res.clearCookie("token");
        }
    }
    next();
};

// Landing Page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Signup Page
app.get("/signup", checkLoggedIn, (req, res) => {
    res.render("signup", { message: null });
});

// Signup Route
app.post("/signup", async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.render("signup", { message: "User already exists. Please login." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, role });
        await newUser.save();
        res.redirect("/login");
    } catch (error) {
        res.status(500).render("signup", { message: "Error signing up. Try again." });
    }
});

// Login Page
app.get("/login", checkLoggedIn, (req, res) => {
    res.render("login", { message: null });
});

// Login Route
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.render("login", { message: "No account found. Please sign up first." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.render("login", { message: "Incorrect password. Try again." });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.cookie("token", token, { httpOnly: true });
        res.redirect("/dashboard");
    } catch (error) {
        res.status(500).render("login", { message: "Error logging in. Try again." });
    }
});

// Logout Route
app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/login");
});

// Dashboard Route
app.get("/dashboard", requireAuth, async (req, res) => {
    try {
        let appointments = [];
        if (req.user.role === "patient") {
            appointments = await Appointment.find({ patient: req.user._id });
        }
        res.render("dashboard", { user: req.user, appointments });
    } catch (error) {
        res.render("dashboard", { user: req.user, appointments: [] });
    }
});

// Doctors List Page
app.get("/doctors", requireAuth, async (req, res) => {
    try {
        const doctors = await User.find({ role: "doctor" });
        res.render("doctors", { doctors });
    } catch (error) {
        res.status(500).send("Error fetching doctors.");
    }
});

// View Doctor Profile
app.get("/doctor/:id", requireAuth, async (req, res) => {
    try {
        const doctor = await User.findById(req.params.id);
        if (!doctor) return res.status(404).send("Doctor not found");
        res.render("doctorProfile", { doctor });
    } catch (error) {
        res.status(500).send("Error loading doctor profile");
    }
});

// Book Appointment
app.post("/appointment/:doctorId", requireAuth, async (req, res) => {
    if (req.user.role !== "patient") return res.status(403).send("Only patients can book appointments.");

    const { patientName, patientAge, symptoms } = req.body;
    const doctorId = req.params.doctorId;

    try {
        const appointment = new Appointment({
            patientName,
            patientAge,
            symptoms,
            doctor: doctorId,
            patient: req.user._id,
            date: new Date(),
            status: "Pending",
        });

        await appointment.save();
        res.redirect("/dashboard");
    } catch (error) {
        res.status(500).send("Error booking appointment.");
    }
});

// Doctor View Appointments
app.get("/view-appointments", requireAuth, async (req, res) => {
    if (req.user.role !== "doctor") return res.status(403).send("Access denied.");

    try {
        const appointments = await Appointment.find({ doctor: req.user._id });
        res.render("doctorAppointments", { doctor: req.user, appointments });
    } catch (error) {
        res.status(500).send("Error loading appointments.");
    }
});

// Contact Us Page
app.get("/contactus", (req, res) => {
    res.render("contactus");
});

// Contact Form Handler
app.post("/contact", (req, res) => {
    const { name, email, message } = req.body;
    console.log(`New Message from ${name} (${email}): ${message}`);
    res.send("Message received! We will get back to you soon.");
});

// HealthLink AI Page
app.get("/healthlinkAI", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "healthlinkAI.html"));
});

// HealthLink AI Analysis (Fake for Now)
app.post("/analyze-health", async (req, res) => {
    const userMessage = req.body.message || "Analyze this health report.";
    try {
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1",
            { inputs: userMessage },
            { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
        );
        res.json({ reply: response.data[0]?.generated_text || "No response from AI." });
    } catch (error) {
        res.status(500).json({ reply: "API Error: Unable to process request." });
    }
});

// Our Team Page
app.get("/ourteam", (req, res) => {
    res.render("ourteam");
});

// OpenAI Chatbot (Optional Static Response for Now)
const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: userMessage }],
        });

        res.json({ reply: response.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ reply: "Sorry, unable to process your request." });
    }
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
