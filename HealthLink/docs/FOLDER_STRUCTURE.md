📁 HealthLink - Project Folder Structure Documentation

📋 Overview

This document provides a comprehensive overview of the HealthLink project structure, explaining the purpose of each directory and file. Understanding this structure will help you navigate the codebase efficiently and know where to place new files.



🌳 Project Structure

text

HealthLink/

├── docs/                    # 📚 Documentation Files

├── models/                  # 🗄️ Database Models

├── node\_modules/            # 📦 Dependencies (auto-generated)

├── public/                  # 🌐 Static Frontend Assets

│   ├── css/                 # 🎨 Stylesheets

│   ├── img/                 # 🖼️ Image Assets

│   └── js/                  # ⚡ Client-side JavaScript

├── routes/                  # 🛤️ Route Definitions

├── views/                   # 📄 EJS Templates

├── .env                     # 🔒 Environment Variables

├── .gitignore              # 🚫 Git Ignore Rules

├── package-lock.json       # 📦 Dependency Lock File

├── package.json            # 📦 Project Manifest

├── README.md               # 📖 Project README

└── server.js               # 🚀 Application Entry Point

📁 Directory Details

1\. docs/ - Documentation 📚

Purpose: Contains all project documentation files.



File	Description

API\_DOCUMENTATION.md	Complete API reference with endpoints, parameters, and examples

FOLDER\_STRUCTURE.md	This file - explains project organization

Guidelines:



✅ Place all .md documentation files here



✅ Keep documentation up-to-date with code changes



✅ Use clear Markdown formatting



2\. models/ - Database Models 🗄️

Purpose: Defines MongoDB schemas and database interactions.



File	Description

User.js	User model with authentication and role management

Appointment.js	Appointment model for booking and scheduling

Guidelines:



✅ Each model file should export a single Mongoose model



✅ Use schema validation for data integrity



✅ Add indexes for frequently queried fields



Example Usage:



javascript

const User = require('./models/User');

const Appointment = require('./models/Appointment');

3\. node\_modules/ - Dependencies 📦

Purpose: Auto-generated directory containing all npm packages.



⚠️ Important:



❌ DO NOT manually modify files here



❌ DO NOT commit this directory to Git



✅ It's automatically created when running npm install



4\. public/ - Static Frontend Assets 🌐

Purpose: Serves static files that are directly accessible to the browser.



4.1 public/css/ - Stylesheets 🎨

File	Purpose

dashboard.css	Dashboard page styling

doctors.css	Doctors listing page styles

healthlinkAI.css	AI assistant page styles

index.css	Global styles and components

Login.css	Login page styling

SignUp.css	Registration page styling

Guidelines:



✅ Each page should have its own CSS file when complex



✅ Use consistent naming conventions



✅ Keep CSS modular and reusable



4.2 public/img/ - Image Assets 🖼️

Purpose: Stores all images, icons, and graphics.



Examples:



Logo files



Icon assets



Background images



Team photos



Guidelines:



✅ Optimize images for web (compress when possible)



✅ Use descriptive filenames



✅ Organize into subfolders if needed (e.g., /icons/, /team/)



4.3 public/js/ - Client-side JavaScript ⚡

File	Purpose

dashboard.js	Dashboard interactivity and API calls

doctors.js	Doctor listing and search functionality

healthlinkAI.js	AI chatbot and health analysis features

index.js	Global JavaScript utilities

Guidelines:



✅ Keep client-side code modular



✅ Use event delegation for dynamic elements



✅ Add proper error handling



4.4 public/ - HTML Files

File	Purpose

healthlinkAI.html	AI health assistant interface

index.html	Landing page

5\. routes/ - Route Definitions 🛤️

Purpose: Defines application routes and request handlers.



File	Description

authRoutes.js	Authentication routes (login, signup, logout)

dashboardRoutes.js	Protected dashboard routes for patients and doctors

Guidelines:



✅ Separate routes by functionality



✅ Use middleware for authentication



✅ Keep controllers clean - move business logic to separate files



Example Route Structure:



javascript

// authRoutes.js

router.post('/login', loginHandler);

router.post('/signup', signupHandler);

6\. views/ - EJS Templates 📄

Purpose: Server-side rendered templates using EJS.



File	Purpose

contactus.ejs	Contact form page

dashboard.ejs	Main user dashboard

doctorAppointments.ejs	Doctor's appointment management

doctorProfile.ejs	Doctor profile page

doctors.ejs	Doctor listing page

login.ejs	User login page

ourteam.ejs	Team information page

signup.ejs	User registration page

Guidelines:



✅ Use EJS for dynamic content rendering



✅ Keep logic minimal in templates



✅ Use partials for reusable components



Example:



html

<!-- Including user data -->

<h1>Welcome, <%= user.name %></h1>

📄 Root Files

server.js - Application Entry Point 🚀

Purpose: Main server file that:



Initializes Express application



Connects to MongoDB



Configures middleware



Sets up routes



Starts the server



Key Sections:



javascript

// 1. Import dependencies

// 2. Configure middleware

// 3. Connect to database

// 4. Define routes

// 5. Start server

.env - Environment Variables 🔒

Purpose: Stores sensitive configuration values.



Variable	Purpose	Example

MONGO\_URL	MongoDB connection string	mongodb+srv://...

JWT\_SECRET	JWT signing key	your-secret-key

OPENAI\_API\_KEY	OpenAI API key	sk-...

PORT	Server port	5000

⚠️ IMPORTANT:



❌ NEVER commit this file



✅ Use .env.example as template



✅ Keep secrets secure



package.json - Project Manifest 📦

Purpose: Defines project metadata and dependencies.



Key Sections:



json

{

&#x20; "name": "HealthLink",

&#x20; "version": "1.0.0",

&#x20; "scripts": { "start": "node server.js" },

&#x20; "dependencies": { "express": "^4.18.2" },

&#x20; "devDependencies": { "nodemon": "^2.0.22" }

}

.gitignore - Git Ignore Rules 🚫

Purpose: Specifies files/folders to exclude from Git.



Common Exclusions:



text

node\_modules/

.env

.DS\_Store

\*.log

dist/

🗂️ File Organization Rules

Where to Add New Files

File Type	Location	Example

New Route	routes/	routes/paymentRoutes.js

New Model	models/	models/MedicalRecord.js

New View	views/	views/patientHistory.ejs

New CSS	public/css/	public/css/patientHistory.css

New JS	public/js/	public/js/patientHistory.js

New Image	public/img/	public/img/logo.png

New Doc	docs/	docs/DEPLOYMENT.md

Naming Conventions

Type	Convention	Example

JavaScript	camelCase	userController.js

CSS	kebab-case	user-dashboard.css

EJS	kebab-case	user-profile.ejs

Models	PascalCase	User.js, Appointment.js

Images	kebab-case	healthlink-logo.png

🔄 Common Workflows

Adding a New Feature

Create Model: models/NewFeature.js



Create Routes: routes/newFeatureRoutes.js



Create Views: views/newFeature.ejs



Add Styles: public/css/newFeature.css



Add Scripts: public/js/newFeature.js



Register Routes: In server.js



Refactoring Code

Identify file location using this guide



Create new file in appropriate directory



Update imports in dependent files



Remove old file after confirming



Update documentation



📚 Quick Reference

Path Aliases (in server.js)

javascript

// Models

const User = require('./models/User');



// Public assets

app.use(express.static(path.join(\_\_dirname, 'public')));



// Views

app.set('views', path.join(\_\_dirname, 'views'));

Import Patterns

javascript

// Server-side

const User = require('./models/User');

const authRoutes = require('./routes/authRoutes');



// Client-side (HTML)

<link rel="stylesheet" href="/css/style.css">

<script src="/js/script.js"></script>

Documentation Version 1.0 | Last Updated: November 2026

