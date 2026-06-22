const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// SIGNUP Route
router.post("/signup", async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.send("User already exists. Please login.");

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, role });
        await newUser.save();

        // Redirect to Login Page after successful signup
        res.redirect("/login");
    } catch (error) {
        res.status(500).send("Error signing up. Try again.");
    }
});

// LOGIN Route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.send("No account found. Please sign up first.");

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.send("Incorrect password. Try again.");

        // Generate JWT Token
        const token = jwt.sign({ id: user._id, role: user.role }, "your_secret_key", { expiresIn: "1h" });

        res.send(`Login successful! Welcome, ${user.role}`);
    } catch (error) {
        res.status(500).send("Error logging in. Try again.");
    }
});

module.exports = router;
