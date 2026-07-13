const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
    patientName: { 
        type: String, 
        required: true,
        trim: true,
        index: true
    },
    patientAge: { 
        type: Number, 
        required: true,
        min: 0,
        max: 150
    },
    symptoms: { 
        type: String, 
        required: true,
        trim: true
    },
    doctor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true,
        index: true
    },
    patient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true,
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
        enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
        index: true
    }
}, {
    timestamps: true
});

// Compound indexes for common queries
AppointmentSchema.index({ doctor: 1, date: -1 });
AppointmentSchema.index({ patient: 1, date: -1 });
AppointmentSchema.index({ status: 1, date: -1 });

// Static method for efficient appointment fetching
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
        { $unwind: { path: "$patientDetails", preserveNullAndEmptyArrays: true } },
        { $sort: { date: -1 } },
        { $limit: limit }
    ]);
};

module.exports = mongoose.model("Appointment", AppointmentSchema);