\# 📊 HealthLink - Database Schema Documentation



\## 📋 Overview



This document provides a comprehensive overview of the HealthLink database schema, including all MongoDB collections, field definitions, relationships, validation rules, and indexing strategies. Understanding this schema is essential for working with the data layer effectively.



\---



\## 📑 Table of Contents



\- \[Collection Overview](#collection-overview)

\- \[User Collection](#user-collection)

\- \[Appointment Collection](#appointment-collection)

\- \[Relationships](#relationships)

\- \[Indexes](#indexes)

\- \[Validation Rules](#validation-rules)

\- \[Data Flow](#data-flow)

\- \[Query Examples](#query-examples)



\---



\## 🗂️ Collection Overview



HealthLink uses MongoDB Atlas as its primary database. The application currently has \*\*two main collections\*\*:



| Collection | Purpose | Documents |

|------------|---------|-----------|

| \*\*users\*\* | Stores all user accounts (patients and doctors) | Patient \& doctor profiles |

| \*\*appointments\*\* | Stores medical appointments between patients and doctors | Appointment records |



\---



\## 👤 User Collection



\### Collection Name: `users`



The `users` collection stores all user accounts in the system. Each user can be either a \*\*patient\*\* or a \*\*doctor\*\*, with role-specific fields.



\### Schema Definition



```javascript

const UserSchema = new mongoose.Schema({

&#x20;   name: {

&#x20;       type: String,

&#x20;       required: \[true, "Name is required"],

&#x20;       trim: true,

&#x20;       minlength: \[2, "Name must be at least 2 characters long"],

&#x20;       maxlength: \[100, "Name cannot exceed 100 characters"],

&#x20;       index: true

&#x20;   },

&#x20;   email: {

&#x20;       type: String,

&#x20;       required: \[true, "Email is required"],

&#x20;       unique: true,

&#x20;       lowercase: true,

&#x20;       trim: true,

&#x20;       match: \[/^\\w+(\[.-]?\\w+)\*@\\w+(\[.-]?\\w+)\*(\\.\\w{2,3})+$/, "Please enter a valid email"],

&#x20;       index: true

&#x20;   },

&#x20;   password: {

&#x20;       type: String,

&#x20;       required: \[true, "Password is required"],

&#x20;       select: false,

&#x20;       minlength: \[6, "Password must be at least 6 characters long"]

&#x20;   },

&#x20;   role: {

&#x20;       type: String,

&#x20;       enum: {

&#x20;           values: \["doctor", "patient"],

&#x20;           message: "Role must be either 'doctor' or 'patient'"

&#x20;       },

&#x20;       required: \[true, "Role is required"],

&#x20;       index: true

&#x20;   },

&#x20;   specialization: {

&#x20;       type: String,

&#x20;       trim: true,

&#x20;       index: true,

&#x20;       validate: {

&#x20;           validator: function(value) {

&#x20;               if (this.role === "doctor" \&\& !value) {

&#x20;                   return false;

&#x20;               }

&#x20;               return true;

&#x20;           },

&#x20;           message: "Specialization is required for doctors"

&#x20;       }

&#x20;   },

&#x20;   experience: {

&#x20;       type: String,

&#x20;       trim: true,

&#x20;       validate: {

&#x20;           validator: function(value) {

&#x20;               if (this.role === "doctor" \&\& !value) {

&#x20;                   return false;

&#x20;               }

&#x20;               return true;

&#x20;           },

&#x20;           message: "Experience is required for doctors"

&#x20;       }

&#x20;   },

&#x20;   bio: {

&#x20;       type: String,

&#x20;       trim: true,

&#x20;       maxlength: \[500, "Bio cannot exceed 500 characters"]

&#x20;   },

&#x20;   appointments: \[{

&#x20;       type: mongoose.Schema.Types.ObjectId,

&#x20;       ref: "Appointment"

&#x20;   }]

}, {

&#x20;   timestamps: true

});







Field Descriptions

Field	Type	Required	Description

name	String	✅ Yes	User's full name (2-100 characters)

email	String	✅ Yes	Unique email address (lowercase, trimmed)

password	String	✅ Yes	Hashed password (bcrypt, excluded from queries)

role	String	✅ Yes	User role: "patient" or "doctor"

specialization	String	❌ No	Doctor's specialization (required for doctors)

experience	String	❌ No	Doctor's years of experience (required for doctors)

bio	String	❌ No	Doctor's professional biography (max 500 chars)

appointments	Array	❌ No	Array of Appointment ObjectIds (references)

createdAt	Date	Auto	Auto-generated creation timestamp

updatedAt	Date	Auto	Auto-generated update timestamp

Role-Specific Fields

Field	Patient	Doctor	Description

name	✅ Required	✅ Required	Full name

email	✅ Required	✅ Required	Email address

password	✅ Required	✅ Required	Hashed password

role	✅ Required	✅ Required	"patient" or "doctor"

specialization	⛔ Not Used	✅ Required	Medical specialty

experience	⛔ Not Used	✅ Required	Years of experience

bio	⛔ Not Used	✅ Optional	Professional bio

appointments	✅ Auto	✅ Auto	References to appointments

Instance Methods

javascript

// Check if user is a doctor

UserSchema.methods.isDoctor = function() {

&#x20;   return this.role === "doctor";

};



// Check if user is a patient

UserSchema.methods.isPatient = function() {

&#x20;   return this.role === "patient";

};

Static Methods

javascript

// Find doctors by specialization

UserSchema.statics.findDoctorsBySpecialization = function(specialization) {

&#x20;   return this.find({

&#x20;       role: "doctor",

&#x20;       specialization: { $regex: specialization, $options: 'i' }

&#x20;   }).limit(20);

};

📅 Appointment Collection

Collection Name: appointments

The appointments collection stores all medical appointments between patients and doctors.



Schema Definition

javascript

const AppointmentSchema = new mongoose.Schema({

&#x20;   patientName: {

&#x20;       type: String,

&#x20;       required: \[true, "Patient name is required"],

&#x20;       trim: true,

&#x20;       minlength: \[2, "Patient name must be at least 2 characters long"],

&#x20;       maxlength: \[100, "Patient name cannot exceed 100 characters"],

&#x20;       index: true

&#x20;   },

&#x20;   patientAge: {

&#x20;       type: Number,

&#x20;       required: \[true, "Patient age is required"],

&#x20;       min: \[0, "Age cannot be negative"],

&#x20;       max: \[150, "Age cannot exceed 150 years"]

&#x20;   },

&#x20;   symptoms: {

&#x20;       type: String,

&#x20;       required: \[true, "Symptoms description is required"],

&#x20;       trim: true,

&#x20;       minlength: \[3, "Symptoms description must be at least 3 characters long"],

&#x20;       maxlength: \[1000, "Symptoms description cannot exceed 1000 characters"]

&#x20;   },

&#x20;   doctor: {

&#x20;       type: mongoose.Schema.Types.ObjectId,

&#x20;       ref: "User",

&#x20;       required: \[true, "Doctor reference is required"],

&#x20;       index: true

&#x20;   },

&#x20;   patient: {

&#x20;       type: mongoose.Schema.Types.ObjectId,

&#x20;       ref: "User",

&#x20;       required: \[true, "Patient reference is required"],

&#x20;       index: true

&#x20;   },

&#x20;   date: {

&#x20;       type: Date,

&#x20;       default: Date.now,

&#x20;       index: true

&#x20;   },

&#x20;   status: {

&#x20;       type: String,

&#x20;       default: "Pending",

&#x20;       enum: {

&#x20;           values: \["Pending", "Confirmed", "Completed", "Cancelled"],

&#x20;           message: "Status must be Pending, Confirmed, Completed, or Cancelled"

&#x20;       },

&#x20;       index: true

&#x20;   },

&#x20;   notes: {

&#x20;       type: String,

&#x20;       trim: true,

&#x20;       maxlength: \[500, "Notes cannot exceed 500 characters"]

&#x20;   }

}, {

&#x20;   timestamps: true

});

Field Descriptions

Field	Type	Required	Description

patientName	String	✅ Yes	Patient's full name (2-100 chars)

patientAge	Number	✅ Yes	Patient's age (0-150)

symptoms	String	✅ Yes	Description of symptoms (3-1000 chars)

doctor	ObjectId	✅ Yes	Reference to doctor User document

patient	ObjectId	✅ Yes	Reference to patient User document

date	Date	⛔ Auto	Appointment date/time (default: now)

status	String	⛔ Auto	Status: Pending, Confirmed, Completed, Cancelled

notes	String	❌ No	Additional notes (max 500 chars)

createdAt	Date	Auto	Auto-generated creation timestamp

updatedAt	Date	Auto	Auto-generated update timestamp

Status Values

Status	Description	When Used

Pending	Awaiting doctor confirmation	Initial state when booked

Confirmed	Accepted by doctor	Doctor confirms appointment

Completed	Appointment concluded	After appointment is done

Cancelled	Appointment cancelled	Patient or doctor cancels

Static Methods

javascript

// Get appointments for a doctor with patient details

AppointmentSchema.statics.getAppointmentsForDoctor = function(doctorId, limit = 100) {

&#x20;   return this.aggregate(\[

&#x20;       { $match: { doctor: doctorId } },

&#x20;       { $lookup: {

&#x20;           from: "users",

&#x20;           localField: "patient",

&#x20;           foreignField: "\_id",

&#x20;           as: "patientDetails"

&#x20;       }},

&#x20;       { $unwind: { path: "$patientDetails", preserveNullAndEmptyArrays: true } },

&#x20;       { $project: {

&#x20;           patientName: 1,

&#x20;           patientAge: 1,

&#x20;           symptoms: 1,

&#x20;           date: 1,

&#x20;           status: 1,

&#x20;           notes: 1,

&#x20;           "patientEmail": "$patientDetails.email",

&#x20;           "patientName": "$patientDetails.name"

&#x20;       }},

&#x20;       { $sort: { date: -1 } },

&#x20;       { $limit: limit }

&#x20;   ]);

};



// Get appointments for a patient with doctor details

AppointmentSchema.statics.getAppointmentsForPatient = function(patientId, limit = 50) {

&#x20;   return this.aggregate(\[

&#x20;       { $match: { patient: patientId } },

&#x20;       { $lookup: {

&#x20;           from: "users",

&#x20;           localField: "doctor",

&#x20;           foreignField: "\_id",

&#x20;           as: "doctorDetails"

&#x20;       }},

&#x20;       { $unwind: { path: "$doctorDetails", preserveNullAndEmptyArrays: true } },

&#x20;       { $project: {

&#x20;           patientName: 1,

&#x20;           patientAge: 1,

&#x20;           symptoms: 1,

&#x20;           date: 1,

&#x20;           status: 1,

&#x20;           notes: 1,

&#x20;           "doctorName": "$doctorDetails.name",

&#x20;           "doctorSpecialization": "$doctorDetails.specialization"

&#x20;       }},

&#x20;       { $sort: { date: -1 } },

&#x20;       { $limit: limit }

&#x20;   ]);

};

Instance Methods

javascript

// Update appointment status

AppointmentSchema.methods.updateStatus = function(newStatus) {

&#x20;   const validStatuses = \["Pending", "Confirmed", "Completed", "Cancelled"];

&#x20;   if (!validStatuses.includes(newStatus)) {

&#x20;       throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);

&#x20;   }

&#x20;   this.status = newStatus;

&#x20;   return this.save();

};

🔗 Relationships

Entity Relationship Diagram

text

┌─────────────────────────────────────────────────────────────────┐

│                      DATABASE RELATIONSHIPS                    │

└─────────────────────────────────────────────────────────────────┘



┌──────────────────┐                    ┌──────────────────┐

│      USERS       │                    │     USERS        │

│   (Patient)      │                    │   (Doctor)       │

├──────────────────┤                    ├──────────────────┤

│ \_id              │───────┐     ┌──────│ \_id              │

│ name             │       │     │      │ name             │

│ email            │       │     │      │ email            │

│ password         │       │     │      │ password         │

│ role: "patient"  │       │     │      │ role: "doctor"   │

│ appointments\[]   │       │     │      │ specialization   │

└──────────────────┘       │     │      │ experience       │

&#x20;                          │     │      │ bio              │

&#x20;                          │     │      │ appointments\[]   │

&#x20;                          │     │      └──────────────────┘

&#x20;                          │     │

&#x20;                          ▼     ▼

&#x20;                   ┌──────────────────────────┐

&#x20;                   │     APPOINTMENTS          │

&#x20;                   ├──────────────────────────┤

&#x20;                   │ \_id                      │

&#x20;                   │ patientName              │

&#x20;                   │ patientAge               │

&#x20;                   │ symptoms                 │

&#x20;                   │ doctor (ref: User) ──────┼──┐

&#x20;                   │ patient (ref: User) ─────┼──┤

&#x20;                   │ date                     │  │

&#x20;                   │ status                   │  │

&#x20;                   │ notes                    │  │

&#x20;                   └──────────────────────────┘  │

&#x20;                                                 │

&#x20;                   ┌─────────────────────────────┘

&#x20;                   │

&#x20;                   └─── Each appointment references ONE patient and ONE doctor

Relationship Types

Relationship	Type	Description

User → Appointments	One-to-Many	A user (patient or doctor) can have many appointments

Appointment → User	Many-to-One	An appointment belongs to one patient and one doctor

Reference Fields

Field	Referenced Collection	Description

appointment.doctor	users	References the doctor user

appointment.patient	users	References the patient user

user.appointments	appointments	Array of appointment references

Populating References

javascript

// Populate doctor details in appointment

const appointment = await Appointment.findById(id).populate('doctor');



// Populate patient details in appointment

const appointment = await Appointment.findById(id).populate('patient');



// Populate all appointments for a user

const user = await User.findById(id).populate('appointments');



// Populate with selective fields

const appointment = await Appointment.findById(id)

&#x20;   .populate('doctor', 'name specialization')

&#x20;   .populate('patient', 'name email');

📊 Indexes

User Collection Indexes

Index	Fields	Type	Purpose

email\_1	email: 1	Unique	Fast email lookup for authentication

role\_1	role: 1	Ascending	Filter users by role

role\_1\_specialization\_1	role: 1, specialization: 1	Compound	Find doctors by specialization

email\_1\_role\_1	email: 1, role: 1	Compound	Authentication with role

Appointment Collection Indexes

Index	Fields	Type	Purpose

patientName\_1	patientName: 1	Ascending	Search appointments by patient name

doctor\_1	doctor: 1	Ascending	Find appointments for a doctor

patient\_1	patient: 1	Ascending	Find appointments for a patient

date\_1	date: 1	Ascending	Sort appointments by date

status\_1	status: 1	Ascending	Filter appointments by status

doctor\_1\_date\_-1	doctor: 1, date: -1	Compound	Doctor appointments sorted by date

patient\_1\_date\_-1	patient: 1, date: -1	Compound	Patient appointments sorted by date

status\_1\_date\_-1	status: 1, date: -1	Compound	Status filter with date sorting

Index Creation Commands

javascript

// User indexes

db.users.createIndex({ email: 1 }, { unique: true });

db.users.createIndex({ role: 1 });

db.users.createIndex({ role: 1, specialization: 1 });

db.users.createIndex({ email: 1, role: 1 });



// Appointment indexes

db.appointments.createIndex({ patientName: 1 });

db.appointments.createIndex({ doctor: 1 });

db.appointments.createIndex({ patient: 1 });

db.appointments.createIndex({ date: 1 });

db.appointments.createIndex({ status: 1 });

db.appointments.createIndex({ doctor: 1, date: -1 });

db.appointments.createIndex({ patient: 1, date: -1 });

db.appointments.createIndex({ status: 1, date: -1 });

✅ Validation Rules

User Validation

Field	Rule	Error Message

name	Required, 2-100 chars	"Name is required", "Name must be at least 2 characters long"

email	Required, unique, valid format	"Email is required", "Please enter a valid email"

password	Required, min 6 chars	"Password is required", "Password must be at least 6 characters long"

role	Required, enum: doctor/patient	"Role is required", "Role must be either 'doctor' or 'patient'"

specialization	Required for doctors	"Specialization is required for doctors"

experience	Required for doctors	"Experience is required for doctors"

bio	Max 500 chars	"Bio cannot exceed 500 characters"

Appointment Validation

Field	Rule	Error Message

patientName	Required, 2-100 chars	"Patient name is required", "Patient name must be at least 2 characters long"

patientAge	Required, 0-150	"Patient age is required", "Age cannot be negative", "Age cannot exceed 150 years"

symptoms	Required, 3-1000 chars	"Symptoms description is required", "Symptoms description must be at least 3 characters long"

doctor	Required, valid ObjectId	"Doctor reference is required"

patient	Required, valid ObjectId	"Patient reference is required"

status	Enum: Pending/Confirmed/Completed/Cancelled	"Status must be Pending, Confirmed, Completed, or Cancelled"

notes	Max 500 chars	"Notes cannot exceed 500 characters"

🔄 Data Flow

User Registration Flow

text

┌─────────────────────────────────────────────────────────────────┐

│                    USER REGISTRATION FLOW                      │

└─────────────────────────────────────────────────────────────────┘



1\. User submits signup form

&#x20;  ↓

2\. Validate input (name, email, password, role)

&#x20;  ↓

3\. Check if email already exists

&#x20;  ↓

4\. Hash password with bcrypt (10 rounds)

&#x20;  ↓

5\. Create User document with hashed password

&#x20;  ↓

6\. Save to MongoDB (users collection)

&#x20;  ↓

7\. Redirect to login page

Appointment Booking Flow

text

┌─────────────────────────────────────────────────────────────────┐

│                   APPOINTMENT BOOKING FLOW                     │

└─────────────────────────────────────────────────────────────────┘



1\. Patient selects doctor and submits form

&#x20;  ↓

2\. Validate input (patientName, patientAge, symptoms)

&#x20;  ↓

3\. Verify doctor exists and has 'doctor' role

&#x20;  ↓

4\. Create Appointment document

&#x20;  ├── patientName, patientAge, symptoms

&#x20;  ├── doctor: doctorId

&#x20;  ├── patient: req.user.\_id

&#x20;  ├── date: new Date()

&#x20;  └── status: "Pending"

&#x20;  ↓

5\. Save to MongoDB (appointments collection)

&#x20;  ↓

6\. User document's appointments array updated (if needed)

&#x20;  ↓

7\. Redirect to dashboard

📝 Query Examples

User Queries

javascript

// Find user by email (login)

const user = await User.findOne({ email: 'john@example.com' })

&#x20;   .select('+password name email role');



// Find all doctors

const doctors = await User.find({ role: 'doctor' })

&#x20;   .select('name specialization experience bio');



// Find doctors by specialization

const cardiologists = await User.findDoctorsBySpecialization('Cardiology');



// Find user with populated appointments

const user = await User.findById(userId).populate('appointments');

Appointment Queries

javascript

// Find all appointments for a doctor

const appointments = await Appointment.find({ doctor: doctorId })

&#x20;   .populate('patient', 'name email')

&#x20;   .sort({ date: -1 });



// Find all appointments for a patient

const appointments = await Appointment.find({ patient: patientId })

&#x20;   .populate('doctor', 'name specialization')

&#x20;   .sort({ date: -1 });



// Find pending appointments for a doctor

const pending = await Appointment.find({

&#x20;   doctor: doctorId,

&#x20;   status: 'Pending'

}).sort({ date: 1 });



// Get appointments with aggregation (enriched data)

const enriched = await Appointment.getAppointmentsForDoctor(doctorId, 50);



// Update appointment status

const appointment = await Appointment.findById(id);

await appointment.updateStatus('Confirmed');

Aggregation Examples

javascript

// Get appointment statistics for a doctor

const stats = await Appointment.aggregate(\[

&#x20;   { $match: { doctor: doctorId } },

&#x20;   { $group: {

&#x20;       \_id: '$status',

&#x20;       count: { $sum: 1 }

&#x20;   }}

]);



// Get monthly appointment count

const monthlyStats = await Appointment.aggregate(\[

&#x20;   { $match: { doctor: doctorId } },

&#x20;   { $group: {

&#x20;       \_id: { $month: '$date' },

&#x20;       count: { $sum: 1 }

&#x20;   }},

&#x20;   { $sort: { '\_id': 1 } }

]);

📚 Additional Resources

Mongoose Documentation

Mongoose Schemas



Mongoose Validation



Mongoose Queries



Mongoose Aggregation



MongoDB Documentation

MongoDB Atlas



MongoDB Indexes



Last Updated: July 2026





