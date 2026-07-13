const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true,
        index: true
    },
    email: { 
        type: String, 
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    password: { 
        type: String, 
        required: true,
        select: false
    },
    role: { 
        type: String, 
        enum: ["doctor", "patient"],
        required: true,
        index: true
    },
    specialization: { 
        type: String,
        index: true
    },
    experience: String,
    bio: String,
    appointments: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Appointment" 
    }]
}, {
    timestamps: true // Auto-manage createdAt and updatedAt
});

// Compound indexes for common queries
UserSchema.index({ role: 1, specialization: 1 });
UserSchema.index({ email: 1, role: 1 });

module.exports = mongoose.model("User", UserSchema);