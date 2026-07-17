\# 🔒 HealthLink - Security Guidelines \& Best Practices



\## 📋 Overview



This document outlines the security architecture, practices, and guidelines implemented in the HealthLink application. It serves as a comprehensive reference for developers to understand and maintain security standards across the project.



\---



\## 📑 Table of Contents



\- \[Security Architecture](#security-architecture)

\- \[Authentication Security](#authentication-security)

\- \[Password Security](#password-security)

\- \[Session \& Cookie Security](#session--cookie-security)

\- \[Environment Security](#environment-security)

\- \[Input Validation \& Sanitization](#input-validation--sanitization)

\- \[Security Headers](#security-headers)

\- \[Rate Limiting](#rate-limiting)

\- \[Database Security](#database-security)

\- \[Third-Party Security](#third-party-security)

\- \[Security Checklist](#security-checklist)

\- \[Incident Response](#incident-response)



\---



\## 🏛️ Security Architecture



\### Security Layers







┌─────────────────────────────────────────────────────────────────┐

│ SECURITY ARCHITECTURE │

├─────────────────────────────────────────────────────────────────┤

│ │

│ ┌─────────────────────────────────────────────────────────┐ │

│ │ CLIENT LAYER │ │

│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │ │

│ │ │ HTTPS │ │ HTTP-Only │ │ CORS │ │ │

│ │ │ (TLS 1.3) │ │ Cookies │ │ Policy │ │ │

│ │ └─────────────┘ └─────────────┘ └─────────────┘ │ │

│ └─────────────────────────────────────────────────────────┘ │

│ │ │

│ ┌─────────────────────────────────────────────────────────┐ │

│ │ APPLICATION LAYER │ │

│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │ │

│ │ │ JWT Auth │ │ Input │ │ Rate │ │ │

│ │ │ Middleware │ │ Validation │ │ Limiting │ │ │

│ │ └─────────────┘ └─────────────┘ └─────────────┘ │ │

│ └─────────────────────────────────────────────────────────┘ │

│ │ │

│ ┌─────────────────────────────────────────────────────────┐ │

│ │ DATA LAYER │ │

│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │ │

│ │ │ Encrypted │ │ MongoDB │ │ Audit │ │ │

│ │ │ Passwords │ │ (Atlas) │ │ Logs │ │ │

│ │ └─────────────┘ └─────────────┘ └─────────────┘ │ │

│ └─────────────────────────────────────────────────────────┘ │

│ │

└─────────────────────────────────────────────────────────────────┘



text



\### Security Principles



| Principle | Description | Implementation |

|-----------|-------------|----------------|

| \*\*Defense in Depth\*\* | Multiple layers of security | Multiple security controls at each layer |

| \*\*Least Privilege\*\* | Minimum access required | Role-based access control (RBAC) |

| \*\*Fail Secure\*\* | Fail to a secure state | Default deny, explicit allow |

| \*\*Separation of Duties\*\* | No single person has all access | Role separation (patient vs doctor) |

| \*\*Security by Design\*\* | Security built-in, not bolted-on | Security considered from the start |



\---



\## 🔐 Authentication Security



\### JWT Implementation



```javascript

// JWT Configuration

const jwt = require('jsonwebtoken');



// Signing token

const token = jwt.sign(

&#x20;   { id: user.\_id, role: user.role },

&#x20;   process.env.JWT\_SECRET,

&#x20;   { expiresIn: '1h' }

);



// Verifying token

try {

&#x20;   const decoded = jwt.verify(token, process.env.JWT\_SECRET);

&#x20;   // Token is valid

} catch (error) {

&#x20;   // Token is invalid or expired

}

JWT Security Best Practices

Practice	Implementation	Why

Strong Secret	32+ character random string	Prevents brute force attacks

Short Expiration	1 hour or less	Limits token exposure window

HTTP-Only Cookies	httpOnly: true	Prevents XSS token theft

Secure Flag	secure: true (production)	HTTPS only transmission

SameSite Attribute	SameSite: 'Strict'	CSRF protection

Role-Based Access Control (RBAC)

javascript

// Role-based middleware

const requireRole = (role) => {

&#x20;   return (req, res, next) => {

&#x20;       if (req.user.role !== role) {

&#x20;           return res.status(403).json({

&#x20;               success: false,

&#x20;               message: 'Insufficient permissions'

&#x20;           });

&#x20;       }

&#x20;       next();

&#x20;   };

};



// Usage

router.get('/doctor-dashboard', requireAuth, requireRole('doctor'), (req, res) => {

&#x20;   // Doctor-only route

});



router.get('/patient-dashboard', requireAuth, requireRole('patient'), (req, res) => {

&#x20;   // Patient-only route

});

🔑 Password Security

Bcrypt Implementation

javascript

const bcrypt = require('bcryptjs');



// Hashing password (10 salt rounds)

const hashedPassword = await bcrypt.hash(password, 10);



// Verifying password

const isMatch = await bcrypt.compare(password, user.password);

Password Security Best Practices

Practice	Implementation	Why

Bcrypt Hashing	10-12 salt rounds	Resists brute force attacks

No Plain Text	Never store raw passwords	Protects against data breaches

Min Length	8+ characters	Increases entropy

Complexity	Mix of character types	Harder to guess

Salting	Automatic in bcrypt	Prevents rainbow table attacks

Password Requirements

javascript

// Password validation rules

const passwordRules = {

&#x20;   minLength: 8,

&#x20;   requireUppercase: true,

&#x20;   requireLowercase: true,

&#x20;   requireNumbers: true,

&#x20;   requireSpecialChars: true

};



// Validation function

function validatePassword(password) {

&#x20;   if (password.length < passwordRules.minLength) {

&#x20;       return 'Password must be at least 8 characters';

&#x20;   }

&#x20;   if (!/\[A-Z]/.test(password)) {

&#x20;       return 'Password must contain an uppercase letter';

&#x20;   }

&#x20;   if (!/\[a-z]/.test(password)) {

&#x20;       return 'Password must contain a lowercase letter';

&#x20;   }

&#x20;   if (!/\[0-9]/.test(password)) {

&#x20;       return 'Password must contain a number';

&#x20;   }

&#x20;   if (!/\[^a-zA-Z0-9]/.test(password)) {

&#x20;       return 'Password must contain a special character';

&#x20;   }

&#x20;   return null;

}

🍪 Session \& Cookie Security

Cookie Configuration

javascript

// Setting secure cookies

res.cookie('token', token, {

&#x20;   httpOnly: true,          // Prevents XSS

&#x20;   secure: process.env.NODE\_ENV === 'production', // HTTPS only

&#x20;   sameSite: 'strict',      // CSRF protection

&#x20;   maxAge: 3600000,         // 1 hour

&#x20;   path: '/',               // Available across site

&#x20;   domain: process.env.COOKIE\_DOMAIN || undefined

});

Cookie Security Best Practices

Attribute	Value	Purpose

httpOnly	true	Prevents JavaScript access

secure	true (production)	HTTPS only

sameSite	'Strict' or 'Lax'	CSRF protection

maxAge	Limited duration	Limits session lifetime

path	'/' or specific	Limits scope

🔧 Environment Security

Environment Variables

env

\# ============================================

\# REQUIRED ENVIRONMENT VARIABLES

\# ============================================



\# Server Configuration

PORT=5000

NODE\_ENV=production



\# Database

MONGO\_URL=mongodb+srv://username:password@cluster.mongodb.net/healthlink



\# JWT Authentication

JWT\_SECRET=your-32+character-secret-key-here



\# AI Services

OPENAI\_API\_KEY=sk-your-production-api-key



\# Email Service

SENDGRID\_API\_KEY=your-sendgrid-api-key

FROM\_EMAIL=noreply@healthlink.com



\# Security

COOKIE\_SECRET=your-cookie-encryption-secret

CORS\_ORIGIN=https://healthlink.com



\# ============================================

\# OPTIONAL ENVIRONMENT VARIABLES

\# ============================================



\# Monitoring

SENTRY\_DSN=your-sentry-dsn



\# Rate Limiting

RATE\_LIMIT\_WINDOW=60000

RATE\_LIMIT\_MAX=100

Environment Security Best Practices

Practice	Implementation	Why

.env in .gitignore	Never commit .env files	Prevents secret exposure

Strong Secrets	32+ character random strings	Prevents brute force

Separate Keys	Different keys per environment	Limits breach impact

Rotate Secrets	Regular secret rotation	Reduces exposure window

Least Privilege	Minimum required access	Limits damage potential

✅ Input Validation \& Sanitization

Validation Middleware

javascript

// Validation middleware

const validate = (schema) => {

&#x20;   return (req, res, next) => {

&#x20;       const errors = \[];

&#x20;       for (const \[field, rules] of Object.entries(schema)) {

&#x20;           const value = req.body\[field];

&#x20;           for (const rule of rules) {

&#x20;               try {

&#x20;                   rule(value);

&#x20;               } catch (error) {

&#x20;                   errors.push({ field, message: error.message });

&#x20;                   break;

&#x20;               }

&#x20;           }

&#x20;       }

&#x20;       if (errors.length > 0) {

&#x20;           return res.status(400).json({

&#x20;               success: false,

&#x20;               status: 400,

&#x20;               code: 'VALIDATION\_ERROR',

&#x20;               errors,

&#x20;               timestamp: new Date().toISOString()

&#x20;           });

&#x20;       }

&#x20;       next();

&#x20;   };

};

Validation Rules

Rule	Purpose	Example

required	Ensures field exists	rules.required('email')

email	Validates email format	rules.email('email')

minLength	Ensures minimum length	rules.minLength('password', 8)

maxLength	Ensures maximum length	rules.maxLength('name', 100)

range	Ensures numeric range	rules.range('age', 0, 150)

oneOf	Validates against allowed values	rules.oneOf('role', \['patient', 'doctor'])

Sanitization

javascript

// Input sanitization

function sanitizeInput(input) {

&#x20;   // Trim whitespace

&#x20;   if (typeof input === 'string') {

&#x20;       return input.trim();

&#x20;   }

&#x20;   return input;

}



// Sanitize all request body fields

function sanitizeBody(req, res, next) {

&#x20;   for (const \[key, value] of Object.entries(req.body)) {

&#x20;       req.body\[key] = sanitizeInput(value);

&#x20;   }

&#x20;   next();

}



// Usage

app.use(sanitizeBody);

🛡️ Security Headers

Helmet.js Configuration

javascript

const helmet = require('helmet');



// Basic Helmet setup

app.use(helmet());



// Custom Helmet configuration

app.use(helmet({

&#x20;   contentSecurityPolicy: {

&#x20;       directives: {

&#x20;           defaultSrc: \["'self'"],

&#x20;           scriptSrc: \["'self'", "'unsafe-inline'"],

&#x20;           styleSrc: \["'self'", "'unsafe-inline'"],

&#x20;           imgSrc: \["'self'", "data:", "https:"],

&#x20;           connectSrc: \["'self'"],

&#x20;           fontSrc: \["'self'"],

&#x20;           objectSrc: \["'none'"],

&#x20;           upgradeInsecureRequests: \[]

&#x20;       }

&#x20;   },

&#x20;   hsts: {

&#x20;       maxAge: 31536000,

&#x20;       includeSubDomains: true,

&#x20;       preload: true

&#x20;   },

&#x20;   frameguard: {

&#x20;       action: 'deny'

&#x20;   },

&#x20;   noSniff: true,

&#x20;   xssFilter: true

}));

Security Headers Reference

Header	Purpose	Value

X-Content-Type-Options	Prevent MIME sniffing	nosniff

X-Frame-Options	Prevent clickjacking	DENY

X-XSS-Protection	Prevent XSS	1; mode=block

Strict-Transport-Security	Enforce HTTPS	max-age=31536000; includeSubDomains

Content-Security-Policy	Prevent XSS and injection	Custom policy

Referrer-Policy	Control referrer header	strict-origin-when-cross-origin

🚦 Rate Limiting

Rate Limiting Configuration

javascript

const rateLimit = require('express-rate-limit');



// General rate limiter

const limiter = rateLimit({

&#x20;   windowMs: 15 \* 60 \* 1000, // 15 minutes

&#x20;   max: 100, // 100 requests per window

&#x20;   message: {

&#x20;       success: false,

&#x20;       message: 'Too many requests, please try again later.'

&#x20;   },

&#x20;   standardHeaders: true,

&#x20;   legacyHeaders: false

});



// Stricter limiter for auth routes

const authLimiter = rateLimit({

&#x20;   windowMs: 15 \* 60 \* 1000, // 15 minutes

&#x20;   max: 10, // 10 requests per window

&#x20;   message: {

&#x20;       success: false,

&#x20;       message: 'Too many login attempts, please try again later.'

&#x20;   },

&#x20;   standardHeaders: true,

&#x20;   legacyHeaders: false

});



// Apply to routes

app.use('/api/auth/login', authLimiter);

app.use('/api/', limiter);

💾 Database Security

MongoDB Connection Security

javascript

// Secure MongoDB connection

mongoose.connect(process.env.MONGO\_URL, {

&#x20;   useNewUrlParser: true,

&#x20;   useUnifiedTopology: true,

&#x20;   maxPoolSize: 10,

&#x20;   serverSelectionTimeoutMS: 5000,

&#x20;   socketTimeoutMS: 45000,

&#x20;   ssl: true, // Enable SSL/TLS

&#x20;   sslValidate: true // Validate SSL certificates

});

Database Security Best Practices

Practice	Implementation	Why

SSL/TLS	ssl: true	Encrypts data in transit

Network Isolation	Atlas IP whitelist	Prevents unauthorized access

Least Privilege	Limited database user roles	Minimizes damage potential

Backup Encryption	Atlas automatic encryption	Protects backups

Audit Logging	Atlas audit logs	Tracks access and changes

🔌 Third-Party Security

External Services Security

javascript

// Securely handling external API calls

const axios = require('axios');



async function callExternalAPI(endpoint, data) {

&#x20;   try {

&#x20;       const response = await axios.post(endpoint, data, {

&#x20;           headers: {

&#x20;               'Authorization': `Bearer ${process.env.API\_KEY}`,

&#x20;               'Content-Type': 'application/json'

&#x20;           },

&#x20;           timeout: 30000, // 30 second timeout

&#x20;           validateStatus: (status) => status < 500 // Only retry on server errors

&#x20;       });

&#x20;       return response.data;

&#x20;   } catch (error) {

&#x20;       // Log error but don't expose sensitive data

&#x20;       console.error('External API error:', error.message);

&#x20;       throw new Error('External service temporarily unavailable');

&#x20;   }

}

Third-Party Security Checklist

✅ Use environment variables for API keys



✅ Never log API keys or tokens



✅ Implement timeout for external calls



✅ Validate external responses



✅ Handle errors gracefully



✅ Limit retry attempts



✅ Use HTTPS for all external calls



✅ Security Checklist

Development Security Checklist

Use .env for all secrets



Never commit secrets to Git



Use httpOnly cookies for JWT



Use secure flag in production



Implement rate limiting



Validate all user input



Sanitize all user input



Hash passwords with bcrypt



Use Helmet.js for security headers



Enable CORS with specific origins



Use HTTPS in production



Keep dependencies updated



Run security audits (npm audit)



Implement proper error handling



Log security events



Production Security Checklist

HTTPS enabled



Security headers configured



Rate limiting enabled



MongoDB Atlas IP whitelist set



Strong JWT secret



Production environment variables



Error logging configured



Monitoring configured



Backup strategy in place



Incident response plan documented



🚨 Incident Response

Security Incident Response Plan

text

1\. DETECT

&#x20;  └── Identify potential security incident

&#x20;      ├── Monitoring alerts

&#x20;      ├── User reports

&#x20;      └── Audit logs



2\. CONTAIN

&#x20;  └── Limit the impact

&#x20;      ├── Isolate affected systems

&#x20;      ├── Disable compromised accounts

&#x20;      └── Block malicious traffic



3\. INVESTIGATE

&#x20;  └── Determine root cause

&#x20;      ├── Analyze logs

&#x20;      ├── Review access patterns

&#x20;      └── Identify vulnerabilities



4\. REMEDIATE

&#x20;  └── Fix the issue

&#x20;      ├── Patch vulnerabilities

&#x20;      ├── Rotate compromised secrets

&#x20;      └── Update security controls



5\. RECOVER

&#x20;  └── Restore normal operations

&#x20;      ├── Re-enable systems

&#x20;      ├── Restore from backup

&#x20;      └── Verify security



6\. LEARN

&#x20;  └── Prevent future incidents

&#x20;      ├── Document the incident

&#x20;      ├── Update security practices

&#x20;      └── Train team members

Emergency Contact List

Role	Contact	Response Time

Security Lead	security@healthlink.com	15 minutes

DevOps Lead	devops@healthlink.com	30 minutes

Project Manager	pm@healthlink.com	1 hour

📚 Additional Resources

Security Resources

OWASP Top 10



Node.js Security Best Practices



Express.js Security



MongoDB Security



Tools

npm audit - Security audit



Snyk - Vulnerability scanning



Helmet.js - Security headers



Express Rate Limit - Rate limiting



Last Updated: July 2026

