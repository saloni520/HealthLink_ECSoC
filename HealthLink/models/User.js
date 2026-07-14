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
 * Defines the structure of a user document
 * 
 * @type {mongoose.Schema}
 */
const UserSchema = new mongoose.Schema({
    /**
     * User's full name
     * @type {String}
     * @required
     * @trimmed - Removes leading/trailing whitespace
     * @indexed {true} - For fast name-based searches
     */
    name: { 
        type: String, 
        required: true,
        trim: true,
        index: true
    },
    
    /**
     * User's email address (unique identifier)
     * @type {String}
     * @required
     * @unique {true} - Ensures no duplicate emails
     * @lowercase - Converts email to lowercase for consistency
     * @trimmed - Removes whitespace
     * @indexed {true} - Critical for authentication queries
     */
    email: { 
        type: String, 
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    
    /**
     * User's hashed password
     * @type {String}
     * @required
     * @select {false} - Excluded from default queries for security
     * Note: Always hash passwords with bcrypt before saving
     */
    password: { 
        type: String, 
        required: true,
        select: false
    },
    
    /**
     * User's role in the system
     * @type {String}
     * @enum {["doctor", "patient"]}
     * @required
     * @indexed {true} - For role-based filtering
     */
    role: { 
        type: String, 
        enum: ["doctor", "patient"],
        required: true,
        index: true
    },
    
    /**
     * Doctor's specialization (doctor only)
     * @type {String}
     * @indexed {true} - For filtering by specialization
     * Examples: "Cardiology", "Dermatology", "Neurology"
     */
    specialization: { 
        type: String,
        index: true
    },
    
    /**
     * Doctor's years of experience (doctor only)
     * @type {String}
     * Example: "5 years", "10+ years"
     */
    experience: String,
    
    /**
     * Doctor's professional biography (doctor only)
     * @type {String}
     * Maximum length suggested: 500 characters
     */
    bio: String,
    
    /**
     * List of appointment references
     * @type {Array<mongoose.Schema.Types.ObjectId>}
     * @ref {Appointment}
     * Links to all appointments associated with this user
     */
    appointments: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Appointment" 
    }]
}, {
    /**
     * Schema Options
     * timestamps: Auto-manage createdAt and updatedAt
     */
    timestamps: true
});

/**
 * ============================================
 * INDEXES
 * ============================================
 * Compound indexes for optimized queries
 */

// Index for doctors by specialization
UserSchema.index({ role: 1, specialization: 1 });

// Index for email-role combination queries
UserSchema.index({ email: 1, role: 1 });

/**
 * ============================================
 * VIRTUAL PROPERTIES
 * ============================================
 * (Add custom virtuals here if needed)
 * Example: fullName, displayName, etc.
 */

/**
 * ============================================
 * MIDDLEWARE
 * ============================================
 * Pre/Post-save hooks for data validation/transformation
 */

/**
 * Pre-save middleware example:
 * Can be used to validate data before saving
 * 
 * @example
 * UserSchema.pre('save', function(next) {
 *   // Custom validation logic here
 *   next();
 * });
 */

// Export the model for use in other files
module.exports = mongoose.model("User", UserSchema);