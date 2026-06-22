const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Middleware to Check Authentication
const requireAuth = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.redirect("/login");

    try {
        const decoded = jwt.verify(token, "your_secret_key");
        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        res.redirect("/login");
    }
};

// Patient Dashboard Route
router.get("/patient-dashboard", requireAuth, (req, res) => {
    if (req.user.role !== "patient") return res.redirect("/login");
    res.render("patientDashboard", { user: req.user });
});

// Doctor Dashboard Route
router.get("/doctor-dashboard", requireAuth, (req, res) => {
    if (req.user.role !== "doctor") return res.redirect("/login");
    res.render("doctorDashboard", { user: req.user });
});

module.exports = router;
