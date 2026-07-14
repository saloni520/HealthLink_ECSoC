🏗️ HealthLink - Project Architecture Overview

📋 Introduction

This document provides a comprehensive overview of the HealthLink application architecture. It explains how different components interact, the technologies used, and the overall system design. This guide is designed to help new developers understand the big picture of how HealthLink works.



🎯 Architecture at a Glance

HealthLink follows a Client-Server Architecture with a Model-View-Controller (MVC) pattern. The application is built as a monolithic web application with clear separation of concerns.



text

┌─────────────────────────────────────────────────────────────────┐

│                         USERS                                  │

│              (Patients \& Healthcare Providers)                 │

└─────────────────────────┬───────────────────────────────────────┘

&#x20;                         │

&#x20;                         ▼

┌─────────────────────────────────────────────────────────────────┐

│                      CLIENT LAYER                              │

│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │

│  │   Browser    │  │   EJS Views  │  │  Static      │        │

│  │   (HTML/CSS) │  │   Templates  │  │  Assets      │        │

│  └──────────────┘  └──────────────┘  └──────────────┘        │

└─────────────────────────┬───────────────────────────────────────┘

&#x20;                         │

&#x20;                         ▼

┌─────────────────────────────────────────────────────────────────┐

│                    APPLICATION LAYER                           │

│  ┌──────────────────────────────────────────────────────────┐  │

│  │                    EXPRESS.JS SERVER                      │  │

│  ├──────────────────────────────────────────────────────────┤  │

│  │  Middleware    │  Routes    │  Controllers               │  │

│  │  - Auth        │  - Auth    │  - User                    │  │

│  │  - CORS        │  - API     │  - Appointment             │  │

│  │  - Validation  │  - Views   │  - AI                      │  │

│  └──────────────────────────────────────────────────────────┘  │

└─────────────────────────┬───────────────────────────────────────┘

&#x20;                         │

&#x20;                         ▼

┌─────────────────────────────────────────────────────────────────┐

│                     DATA LAYER                                 │

│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │

│  │   MongoDB    │  │   User       │  │  Appointment │        │

│  │   Atlas      │  │   Model      │  │   Model      │        │

│  └──────────────┘  └──────────────┘  └──────────────┘        │

└─────────────────────────────────────────────────────────────────┘

🏛️ System Components

1\. Client Layer (Frontend)

The frontend is responsible for user interface and interaction.



Components:

Component	Technology	Purpose

HTML Templates	EJS	Server-side rendered pages

Styling	CSS	Visual design and responsiveness

Client Scripts	JavaScript	Interactive features and API calls

Static Assets	Images, Icons	Visual elements

Key Files:

views/ - All EJS templates



public/css/ - Stylesheets



public/js/ - Client-side JavaScript



public/img/ - Images and icons



Responsibilities:

✅ Render user interfaces



✅ Handle user input



✅ Display data from backend



✅ Provide responsive design



2\. Application Layer (Backend)

The backend handles business logic, authentication, and data processing.



Server Setup:

javascript

// Express.js Server

const app = express();

app.set('view engine', 'ejs');

app.use(express.json());

app.use(cookieParser());

Middleware Stack:

Middleware	Purpose

express.json()	Parse JSON request bodies

cookie-parser	Parse cookies for auth

cors	Enable cross-origin requests

method-override	Support PUT/DELETE

requireAuth	Protect routes

Route Structure:

Route Type	Example	Handler

Public	/, /login, /signup	View rendering

Auth	/auth/\*	Login/Signup logic

Protected	/dashboard, /doctors	Auth required

API	/api/\*	Data endpoints

3\. Data Layer (Database)

MongoDB Atlas serves as the primary data store.



Data Models:

javascript

// User Model

{

&#x20; name: String,

&#x20; email: String (unique),

&#x20; password: String (hashed),

&#x20; role: 'patient' | 'doctor',

&#x20; specialization: String,

&#x20; experience: String,

&#x20; bio: String,

&#x20; appointments: \[ObjectId]

}



// Appointment Model

{

&#x20; patientName: String,

&#x20; patientAge: Number,

&#x20; symptoms: String,

&#x20; doctor: ObjectId (ref: User),

&#x20; patient: ObjectId (ref: User),

&#x20; date: Date,

&#x20; status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'

}

Database Features:

Feature	Implementation

Indexing	Optimized for common queries

Validation	Schema-level validation

Relationships	MongoDB references

Aggregation	Complex data joins

🔄 Communication Flow

Request-Response Cycle

text

1\. USER REQUEST

&#x20;  ├── Browser sends HTTP request

&#x20;  ├── Express receives request

&#x20;  └── Routes match URL pattern



2\. MIDDLEWARE PROCESSING

&#x20;  ├── Authentication check

&#x20;  ├── Data validation

&#x20;  ├── Request transformation

&#x20;  └── Route handler called



3\. CONTROLLER LOGIC

&#x20;  ├── Business logic execution

&#x20;  ├── Database operations

&#x20;  ├── Data processing

&#x20;  └── Response preparation



4\. RESPONSE SENT

&#x20;  ├── HTML rendered (EJS)

&#x20;  ├── JSON response (API)

&#x20;  ├── Redirect (Auth)

&#x20;  └── Error message

Authentication Flow

text

┌─────────────────────────────────────────────────────────────┐

│                     AUTHENTICATION FLOW                     │

└─────────────────────────────────────────────────────────────┘



1\. REGISTRATION

&#x20;  User → /signup → Validate → Hash Password → Save User → Redirect Login



2\. LOGIN

&#x20;  User → /login → Validate → Compare Password → Generate JWT → Set Cookie



3\. PROTECTED ROUTE

&#x20;  Request → Extract Cookie → Verify JWT → Load User → Allow Access



4\. LOGOUT

&#x20;  User → /logout → Clear Cookie → Remove Cache → Redirect Login

🔒 Security Architecture

Security Layers

Layer	Implementation	Purpose

Transport	HTTPS (Production)	Encrypt data in transit

Authentication	JWT + HTTP-Only Cookies	Secure user sessions

Authorization	Role-Based Access Control	Restrict actions

Data	Bcrypt Hashing	Protect passwords

Input	Validation + Sanitization	Prevent injection

Authentication Mechanism

javascript

// JWT Token Structure

{

&#x20; header: { alg: 'HS256', typ: 'JWT' },

&#x20; payload: { 

&#x20;   id: user.\_id,      // User identifier

&#x20;   role: user.role    // User role for RBAC

&#x20; },

&#x20; signature: hashed

}



// Token Storage

res.cookie('token', token, {

&#x20; httpOnly: true,      // Not accessible via JS

&#x20; secure: production,  // HTTPS only

&#x20; maxAge: 3600000     // 1 hour expiration

});

📊 Data Flow Diagram

text

┌─────────────────────────────────────────────────────────────────┐

│                      DATA FLOW OVERVIEW                        │

└─────────────────────────────────────────────────────────────────┘



&#x20;                   ┌─────────────────┐

&#x20;                   │   USER ACTION   │

&#x20;                   └────────┬────────┘

&#x20;                            │

&#x20;                            ▼

&#x20;                   ┌─────────────────┐

&#x20;                   │   CLIENT REQUEST │

&#x20;                   └────────┬────────┘

&#x20;                            │

&#x20;        ┌───────────────────┼───────────────────┐

&#x20;        │                   │                   │

&#x20;        ▼                   ▼                   ▼

&#x20;  ┌──────────┐      ┌──────────┐      ┌──────────┐

&#x20;  │   HTML   │      │   JSON   │      │   FILE   │

&#x20;  │  Views   │      │   API    │      │  Upload  │

&#x20;  └──────────┘      └──────────┘      └──────────┘

&#x20;        │                   │                   │

&#x20;        └───────────────────┼───────────────────┘

&#x20;                            │

&#x20;                            ▼

&#x20;                   ┌─────────────────┐

&#x20;                   │  EXPRESS ROUTES │

&#x20;                   └────────┬────────┘

&#x20;                            │

&#x20;                            ▼

&#x20;                   ┌─────────────────┐

&#x20;                   │   CONTROLLER    │

&#x20;                   └────────┬────────┘

&#x20;                            │

&#x20;            ┌───────────────┼───────────────┐

&#x20;            │               │               │

&#x20;            ▼               ▼               ▼

&#x20;     ┌──────────┐    ┌──────────┐    ┌──────────┐

&#x20;     │ Business │    │  Data    │    │ External │

&#x20;     │  Logic   │    │  Access  │    │   APIs   │

&#x20;     └──────────┘    └──────────┘    └──────────┘

&#x20;            │               │               │

&#x20;            └───────────────┼───────────────┘

&#x20;                            │

&#x20;                            ▼

&#x20;                   ┌─────────────────┐

&#x20;                   │   MONGODB       │

&#x20;                   │   DATABASE      │

&#x20;                   └─────────────────┘

🛠️ Technology Stack

Core Technologies

Component	Technology	Version	Purpose

Runtime	Node.js	v18+	Server environment

Framework	Express.js	v4.18	Web framework

Database	MongoDB Atlas	Latest	Data storage

Templating	EJS	v3.1	View rendering

Authentication	JWT + bcrypt	Latest	Security

Key Libraries

Library	Purpose

mongoose	MongoDB ODM

dotenv	Environment variables

cookie-parser	Cookie handling

cors	Cross-origin support

axios	HTTP requests

method-override	HTTP method support

openai	AI integration

🔌 Integration Points

External Services

Service	Purpose	Endpoint

OpenAI API	AI chatbot	/chat

Hugging Face	Health analysis	/analyze-health

MongoDB Atlas	Database	Via Mongoose

Internal Communication

text

┌─────────────────────────────────────────────────────────────────┐

│                   INTERNAL COMMUNICATION                       │

└─────────────────────────────────────────────────────────────────┘



┌─────────────┐        ┌─────────────┐        ┌─────────────┐

│   VIEWS     │◄──────►│   ROUTES    │◄──────►│   MODELS    │

│   (EJS)     │        │   (Express) │        │  (Mongoose) │

└─────────────┘        └─────────────┘        └─────────────┘

&#x20;    │                       │                        │

&#x20;    │                       │                        │

&#x20;    ▼                       ▼                        ▼

┌─────────────┐        ┌─────────────┐        ┌─────────────┐

│   PUBLIC    │        │  MIDDLEWARE │        │  DATABASE   │

│   Assets    │        │  (Auth)     │        │  (MongoDB)  │

└─────────────┘        └─────────────┘        └─────────────┘

📈 Scalability Considerations

Current Architecture

Aspect	Current	Future Plan

Database	Single MongoDB	MongoDB replica sets

Server	Single instance	Load balancing

Caching	In-memory cache	Redis cache

Queues	None	BullMQ for background jobs

Files	Local storage	Cloud storage (S3)

Bottlenecks \& Solutions

Bottleneck	Current Solution	Future Improvement

Authentication	5-min cache	Redis cache

Database Queries	Indexes + lean()	Query optimization

AI Requests	Rate limiting	Queue system

File Uploads	Memory storage	Cloud storage

🔄 Deployment Architecture

Production Environment

text

┌─────────────────────────────────────────────────────────────────┐

│                    PRODUCTION DEPLOYMENT                       │

└─────────────────────────────────────────────────────────────────┘



&#x20;                        ┌─────────────┐

&#x20;                        │   Render    │

&#x20;                        │  Platform   │

&#x20;                        └──────┬──────┘

&#x20;                               │

&#x20;              ┌────────────────┼────────────────┐

&#x20;              │                │                │

&#x20;              ▼                ▼                ▼

&#x20;       ┌────────────┐   ┌────────────┐   ┌────────────┐

&#x20;       │  Node.js   │   │  Node.js   │   │  Node.js   │

&#x20;       │  Instance  │   │  Instance  │   │  Instance  │

&#x20;       └────────────┘   └────────────┘   └────────────┘

&#x20;              │                │                │

&#x20;              └────────────────┼────────────────┘

&#x20;                               │

&#x20;                        ┌──────▼──────┐

&#x20;                        │  MongoDB    │

&#x20;                        │   Atlas     │

&#x20;                        └─────────────┘



&#x20;       Environment Variables:

&#x20;       - MONGO\_URL

&#x20;       - JWT\_SECRET

&#x20;       - OPENAI\_API\_KEY

&#x20;       - PORT

📝 Architecture Decisions

Key Decisions

Decision	Rationale

Monolithic Architecture	Simpler for initial development

MongoDB Atlas	Cloud-native, scalable, free tier

JWT Authentication	Stateless, scalable

EJS Templates	Server-side rendering for SEO

HTTP-Only Cookies	Secure token storage

Trade-offs

Trade-off	Why Accepted

Monolithic vs Microservices	Simpler deployment, easier debugging

SQL vs NoSQL	Flexibility for changing requirements

Server-side vs Client-side	Better SEO with server-side rendering

Custom Auth vs OAuth	Simpler implementation, more control

🔍 Monitoring \& Observability

Current Setup

Aspect	Implementation

Logging	Console logging (Winston planned)

Health Checks	/health endpoint

Performance	Minimal monitoring

Error Tracking	Console error logging

Future Enhancements

Winston logging with file rotation



Performance metrics with Prometheus



Error tracking with Sentry



User analytics with Mixpanel



📚 Additional Resources

Related Documentation

Folder Structure Guide



API Documentation



Contributing Guide



Deployment Guide



External Resources

Express.js Documentation



MongoDB Documentation



EJS Documentation



Documentation Version 1.0 | Last Updated: November 2026

