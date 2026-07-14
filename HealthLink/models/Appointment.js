/**
 * ============================================
 * APPOINTMENT MODEL
 * ============================================
 * This model represents medical appointments between
 * patients and doctors in the HealthLink system.
 * 
 * @module models/Appointment
 * @requires mongoose
 */

const mongoose = require("mongoose");

/**
 * Appointment Schema Definition
 * Defines the structure of an appointment document
 * 
 * @type {mongoose.Schema}
 */
const AppointmentSchema = new mongoose.Schema({
    /**
     * Patient's full name
     * @type {String}
     * @required
     * @trimmed
     * @indexed {true} - For faster patient name searches
     */
    patientName: { 
        type: String, 
        required: true,
        trim: true,
        index: true
    },
    
    /**
     * Patient's age in years
     * @type {Number}
     * @required
     * @minimum {0} - Minimum age 0
     * @maximum {150} - Maximum age 150
     */
    patientAge: { 
        type: Number, 
        required: true,
        min: 0,
        max: 150
    },
    
    /**
     * Description of patient's symptoms
     * @type {String}
     * @required
     * @trimmed
     */
    symptoms: { 
        type: String, 
        required: true,
        trim: true
    },
    
    /**
     * Reference to the doctor user
     * @type {mongoose.Schema.Types.ObjectId}
     * @ref {User}
     * @required
     * @indexed {true} - For faster doctor-related queries
     */
    doctor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true,
        index: true
    },
    
    /**
     * Reference to the patient user
     * @type {mongoose.Schema.Types.ObjectId}
     * @ref {User}
     * @required
     * @indexed {true} - For faster patient-related queries
     */
    patient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true,
        index: true
    },
    
    /**
     * Appointment date and time
     * @type {Date}
     * @default {Date.now}
     * @indexed {true} - For date-based queries
     */
    date: { 
        type: Date, 
        default: Date.now,
        index: true
    },
    
    /**
     * Appointment status
     * @type {String}
     * @default {"Pending"}
     * @enum {["Pending", "Confirmed", "Completed", "Cancelled"]}
     * @indexed {true} - For filtering by status
     */
    status: { 
        type: String, 
        default: "Pending",
        enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
        index: true
    }
}, {
    /**
     * Schema Options
     * timestamps: Auto-manage createdAt and updatedAt fields
     */
    timestamps: true
});

/**
 * ============================================
 * INDEXES
 * ============================================
 * Compound indexes for common query patterns
 * Improves query performance significantly
 */

// Index for doctor's appointments sorted by date
AppointmentSchema.index({ doctor: 1, date: -1 });

// Index for patient's appointments sorted by date
AppointmentSchema.index({ patient: 1, date: -1 });

// Index for status filtering with date sorting
AppointmentSchema.index({ status: 1, date: -1 });

/**
 * ============================================
 * STATIC METHODS
 * ============================================
 */

/**
 * Get appointments for a specific doctor with patient details
 * Uses MongoDB aggregation for efficient data retrieval
 * 
 * @static
 * @async
 * @param {string} doctorId - The doctor's user ID
 * @param {number} [limit=100] - Maximum appointments to return
 * @returns {Promise<Array>} Array of appointments with patient details
 * 
 * @example
 * const appointments = await Appointment.getAppointmentsForDoctor('507f1f77bcf86cd799439011', 50);
 */
AppointmentSchema.statics.getAppointmentsForDoctor = function(doctorId, limit = 100) {
    return this.aggregate([
        // 1. Filter by doctor ID
        { $match: { doctor: doctorId } },
        
        // 2. Join with users collection for patient details
        {
            $lookup: {
                from: "users",                      // Collection to join
                localField: "patient",               // Field from appointments
                foreignField: "_id",                 // Field from users
                as: "patientDetails"                 // Output array name
            }
        },
        
        // 3. Unwind patient details array
        { 
            $unwind: { 
                path: "$patientDetails", 
                preserveNullAndEmptyArrays: true 
            } 
        },
        
        // 4. Sort by date (newest first)
        { $sort: { date: -1 } },
        
        // 5. Limit results
        { $limit: limit }
    ]);
};

// Export the model for use in other files
module.exports = mongoose.model("Appointment", AppointmentSchema);