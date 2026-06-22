const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: { type: String, enum: ["doctor", "patient"] }, // Define roles
    specialization: String, // For doctors
    experience: String, // Doctor's experience in years
    bio: String, // Short bio for doctor profile
    appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Appointment" }] // Link to appointments
});

module.exports = mongoose.model("User", UserSchema);
