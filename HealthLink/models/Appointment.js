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
 */
const AppointmentSchema = new mongoose.Schema({
    patientName: {
        type: String,
        required: [true, "Patient name is required"],
        trim: true,
        minlength: [2, "Patient name must be at least 2 characters long"],
        maxlength: [100, "Patient name cannot exceed 100 characters"],
        index: true
    },

    patientAge: {
        type: Number,
        required: [true, "Patient age is required"],
        min: [0, "Age cannot be negative"],
        max: [150, "Age cannot exceed 150 years"]
    },

    symptoms: {
        type: String,
        required: [true, "Symptoms description is required"],
        trim: true,
        minlength: [3, "Symptoms description must be at least 3 characters long"],
        maxlength: [1000, "Symptoms description cannot exceed 1000 characters"]
    },

    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Doctor reference is required"],
        index: true
    },

    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Patient reference is required"],
        index: true
    },

    date: {
        type: Date,
        default: Date.now,
        index: true
    },

    status: {
        type: String,
        default: "Pending",
        enum: {
            values: ["Pending", "Confirmed", "Completed", "Cancelled"],
            message: "Status must be Pending, Confirmed, Completed, or Cancelled"
        },
        index: true
    },

    notes: {
        type: String,
        trim: true,
        maxlength: [500, "Notes cannot exceed 500 characters"]
    }
}, {
    timestamps: true
});

// Compound indexes for common queries
AppointmentSchema.index({ doctor: 1, date: -1 });
AppointmentSchema.index({ patient: 1, date: -1 });
AppointmentSchema.index({ status: 1, date: -1 });

/**
 * Static method to get appointments for a doctor with patient details
 */
AppointmentSchema.statics.getAppointmentsForDoctor = function(doctorId, limit = 100) {
    return this.aggregate([
        { $match: { doctor: doctorId } },
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
                notes: 1,
                "patientEmail": "$patientDetails.email",
                "patientName": "$patientDetails.name"
            }
        },
        { $sort: { date: -1 } },
        { $limit: limit }
    ]);
};

/**
 * Static method to get appointments for a patient with doctor details
 */
AppointmentSchema.statics.getAppointmentsForPatient = function(patientId, limit = 50) {
    return this.aggregate([
        { $match: { patient: patientId } },
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
                notes: 1,
                "doctorName": "$doctorDetails.name",
                "doctorSpecialization": "$doctorDetails.specialization"
            }
        },
        { $sort: { date: -1 } },
        { $limit: limit }
    ]);
};

/**
 * Instance method to update appointment status
 */
AppointmentSchema.methods.updateStatus = function(newStatus) {
    const validStatuses = ["Pending", "Confirmed", "Completed", "Cancelled"];
    if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    this.status = newStatus;
    return this.save();
};

module.exports = mongoose.model("Appointment", AppointmentSchema);