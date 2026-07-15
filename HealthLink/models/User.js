/**
 * ============================================
 * USER MODEL
 * ============================================
 * Represents all users in the HealthLink system
 * Supports both patients and doctors with
 * role-based functionality.
 * 
 * @module models/User
 * @requires mongoose
 */

const mongoose = require("mongoose");

/**
 * User Schema Definition
 */
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [2, "Name must be at least 2 characters long"],
        maxlength: [100, "Name cannot exceed 100 characters"],
        index: true
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
        index: true
    },

    password: {
        type: String,
        required: [true, "Password is required"],
        select: false,
        minlength: [6, "Password must be at least 6 characters long"]
    },

    role: {
        type: String,
        enum: {
            values: ["doctor", "patient"],
            message: "Role must be either 'doctor' or 'patient'"
        },
        required: [true, "Role is required"],
        index: true
    },

    specialization: {
        type: String,
        trim: true,
        index: true,
        validate: {
            validator: function(value) {
                if (this.role === "doctor" && !value) {
                    return false;
                }
                return true;
            },
            message: "Specialization is required for doctors"
        }
    },

    experience: {
        type: String,
        trim: true,
        validate: {
            validator: function(value) {
                if (this.role === "doctor" && !value) {
                    return false;
                }
                return true;
            },
            message: "Experience is required for doctors"
        }
    },

    bio: {
        type: String,
        trim: true,
        maxlength: [500, "Bio cannot exceed 500 characters"]
    },

    appointments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment"
    }]
}, {
    timestamps: true
});

// Compound indexes
UserSchema.index({ role: 1, specialization: 1 });
UserSchema.index({ email: 1, role: 1 });

/**
 * Instance method to check if user is a doctor
 */
UserSchema.methods.isDoctor = function() {
    return this.role === "doctor";
};

/**
 * Instance method to check if user is a patient
 */
UserSchema.methods.isPatient = function() {
    return this.role === "patient";
};

/**
 * Static method to find doctors by specialization
 */
UserSchema.statics.findDoctorsBySpecialization = function(specialization) {
    return this.find({
        role: "doctor",
        specialization: { $regex: specialization, $options: 'i' }
    }).limit(20);
};

module.exports = mongoose.model("User", UserSchema);