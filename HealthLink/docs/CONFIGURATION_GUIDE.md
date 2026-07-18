\# ⚙️ HealthLink - Configuration Reference Guide



\## 📋 Overview



This document provides a comprehensive reference for all configuration options available in the HealthLink application. It covers environment variables, server settings, database configuration, security options, and more. Use this guide to understand and modify the application's behavior.



\---



\## 📑 Table of Contents



\- \[Environment Variables](#environment-variables)

\- \[Server Configuration](#server-configuration)

\- \[Database Configuration](#database-configuration)

\- \[Authentication Configuration](#authentication-configuration)

\- \[Security Configuration](#security-configuration)

\- \[AI Integration Configuration](#ai-integration-configuration)

\- \[Email Configuration](#email-configuration)

\- \[Static Assets Configuration](#static-assets-configuration)

\- \[Feature Flags](#feature-flags)

\- \[Best Practices](#best-practices)



\---



\## 🔧 Environment Variables



\### Required Variables



| Variable | Description | Default | Example |

|----------|-------------|---------|---------|

| `NODE\_ENV` | Application environment | `development` | `production` |

| `PORT` | Server port | `5000` | `3000` |

| `MONGO\_URL` | MongoDB connection string | None | `mongodb+srv://...` |

| `JWT\_SECRET` | JWT signing secret | None | `your-secure-secret-key-here` |

| `OPENAI\_API\_KEY` | OpenAI API key | None | `sk-...` |



\### Optional Variables



| Variable | Description | Default | Example |

|----------|-------------|---------|---------|

| `CLIENT\_URL` | CORS allowed origin | `\*` | `https://healthlink.com` |

| `COOKIE\_SECRET` | Cookie encryption secret | None | `your-cookie-secret` |

| `LOG\_LEVEL` | Logging level | `info` | `debug` |

| `RATE\_LIMIT\_WINDOW` | Rate limit window (ms) | `60000` | `30000` |

| `RATE\_LIMIT\_MAX` | Maximum requests per window | `100` | `50` |

| `SENDGRID\_API\_KEY` | SendGrid API key | None | `SG.xxx` |

| `FROM\_EMAIL` | Sender email address | None | `noreply@healthlink.com` |

| `SENTRY\_DSN` | Sentry error tracking DSN | None | `https://...` |

| `CACHE\_TTL` | Cache time-to-live (ms) | `300000` | `600000` |



\### Environment-Specific Values



| Variable | Development | Production |

|----------|-------------|------------|

| `NODE\_ENV` | `development` | `production` |

| `PORT` | `5000` | `5000` |

| `MONGO\_URL` | Test database | Production database |

| `JWT\_SECRET` | Test secret | Strong secret |

| `COOKIE\_SECURE` | `false` | `true` |

| `LOG\_LEVEL` | `debug` | `info` |



\---



\## 🖥️ Server Configuration



\### Express.js Configuration



| Setting | Description | Default | Recommended |

|---------|-------------|---------|-------------|

| `PORT` | Server port | `5000` | `5000` |

| `JSON\_LIMIT` | JSON body size limit | `10mb` | `10mb` |

| `URL\_ENCODED\_LIMIT` | URL-encoded body limit | `10mb` | `10mb` |

| `TRUST\_PROXY` | Trust proxy headers | `false` | `true` (production) |



\### CORS Configuration



```javascript

// Current CORS configuration

app.use(cors({

&#x20;   origin: process.env.CLIENT\_URL || '\*',

&#x20;   credentials: true

}));







Setting	Description	Default

origin	Allowed origins	\* (or CLIENT\_URL)

credentials	Allow credentials	true

methods	Allowed HTTP methods	GET, POST, PUT, DELETE

💾 Database Configuration

MongoDB Connection Options

javascript

const options = {

&#x20;   useNewUrlParser: true,

&#x20;   useUnifiedTopology: true,

&#x20;   maxPoolSize: 10,

&#x20;   serverSelectionTimeoutMS: 5000,

&#x20;   socketTimeoutMS: 45000

};

Option	Description	Default	Recommended

maxPoolSize	Maximum connections in pool	10	10-50

serverSelectionTimeoutMS	Server selection timeout	5000ms	5000ms

socketTimeoutMS	Socket timeout	45000ms	45000ms

ssl	Enable SSL/TLS	true	true

sslValidate	Validate SSL certificates	true	true

Connection Pool Sizing

Environment	Max Connections	Recommended

Development	5	For local testing

Production	20-50	Based on application load

🔐 Authentication Configuration

JWT Configuration

javascript

const jwtConfig = {

&#x20;   secret: process.env.JWT\_SECRET,

&#x20;   expiresIn: '1h',

&#x20;   algorithm: 'HS256'

};

Setting	Description	Default	Recommended

JWT\_SECRET	Signing secret	None	32+ character string

expiresIn	Token expiration	1h	1h or 24h

algorithm	Signing algorithm	HS256	HS256

Cookie Configuration

javascript

res.cookie('token', token, {

&#x20;   httpOnly: true,

&#x20;   secure: process.env.NODE\_ENV === 'production',

&#x20;   maxAge: 3600000,

&#x20;   sameSite: 'strict'

});

Setting	Description	Default	Recommended

httpOnly	Prevent JavaScript access	true	true

secure	HTTPS only	false	true (production)

maxAge	Cookie lifetime (ms)	3600000	3600000

sameSite	CSRF protection	strict	strict or lax

🛡️ Security Configuration

Rate Limiting

javascript

// General rate limiter

const limiter = rateLimit({

&#x20;   windowMs: 15 \* 60 \* 1000,

&#x20;   max: 100,

&#x20;   message: {

&#x20;       success: false,

&#x20;       message: 'Too many requests, please try again later.'

&#x20;   }

});



// Authentication rate limiter

const authLimiter = rateLimit({

&#x20;   windowMs: 15 \* 60 \* 1000,

&#x20;   max: 10,

&#x20;   message: {

&#x20;       success: false,

&#x20;       message: 'Too many login attempts, please try again later.'

&#x20;   }

});

Limiter	Window	Max Requests	Purpose

General	15 min	100	All routes

Authentication	15 min	10	Login/Signup routes

Chat	1 min	10	Chat endpoint

Security Headers (Helmet.js)

javascript

app.use(helmet({

&#x20;   contentSecurityPolicy: {

&#x20;       directives: {

&#x20;           defaultSrc: \["'self'"],

&#x20;           scriptSrc: \["'self'", "'unsafe-inline'"],

&#x20;           styleSrc: \["'self'", "'unsafe-inline'"],

&#x20;           imgSrc: \["'self'", "data:", "https:"]

&#x20;       }

&#x20;   },

&#x20;   hsts: {

&#x20;       maxAge: 31536000,

&#x20;       includeSubDomains: true,

&#x20;       preload: true

&#x20;   },

&#x20;   frameguard: { action: 'deny' }

}));

🤖 AI Integration Configuration

OpenAI Configuration

javascript

const openai = new OpenAI({

&#x20;   apiKey: process.env.OPENAI\_API\_KEY,

&#x20;   timeout: 30000,

&#x20;   maxRetries: 2

});

Setting	Description	Default	Recommended

apiKey	OpenAI API key	None	Set in .env

timeout	Request timeout (ms)	30000	30000

maxRetries	Maximum retry attempts	2	2-3

model	Default model	gpt-3.5-turbo	gpt-3.5-turbo

max\_tokens	Max response tokens	150	150-300

temperature	Response creativity	0.7	0.5-0.8

AI Endpoint Configuration

Endpoint	Model	Timeout	Purpose

/chat	gpt-3.5-turbo	30s	General chat

/analyze-health	mistralai/Mistral-7B-Instruct	30s	Health analysis

📧 Email Configuration

SendGrid Configuration

javascript

const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID\_API\_KEY);

Setting	Description	Default	Required

SENDGRID\_API\_KEY	SendGrid API key	None	Yes

FROM\_EMAIL	Sender email	None	Yes

FROM\_NAME	Sender display name	HealthLink	No

EMAIL\_TEMPLATES	Template IDs	None	For template emails

Email Templates

Template	Purpose	Variables

welcome	Welcome new user	name, email

appointment-confirmation	Appointment confirmation	patientName, doctorName, date

appointment-reminder	Appointment reminder	patientName, doctorName, date

password-reset	Password reset	name, link

📁 Static Assets Configuration

Static File Serving

javascript

app.use(express.static(path.join(\_\_dirname, 'public')));

Setting	Description	Default

public	Static assets directory	/public

max-age	Cache control	1 year (production)

etag	Enable ETag	true

Upload Configuration

javascript

const multer = require('multer');



const storage = multer.diskStorage({

&#x20;   destination: './uploads/',

&#x20;   filename: (req, file, cb) => {

&#x20;       cb(null, Date.now() + '-' + file.originalname);

&#x20;   }

});



const upload = multer({

&#x20;   storage: storage,

&#x20;   limits: { fileSize: 5 \* 1024 \* 1024 }, // 5MB

&#x20;   fileFilter: (req, file, cb) => {

&#x20;       const allowedTypes = \['image/jpeg', 'image/png', 'image/gif'];

&#x20;       cb(null, allowedTypes.includes(file.mimetype));

&#x20;   }

});

Setting	Description	Default	Recommended

fileSize	Maximum file size	5MB	5-10MB

allowedTypes	Allowed MIME types	Images only	Based on needs

destination	Upload directory	/uploads	/uploads

🚩 Feature Flags

Available Feature Flags

Feature	Flag	Status	Description

AI Chatbot	ENABLE\_CHATBOT	true	Enable/disable chatbot

Health Analysis	ENABLE\_HEALTH\_ANALYSIS	true	Enable/disable health analysis

Email Notifications	ENABLE\_EMAIL	false	Enable/disable email notifications

Rate Limiting	ENABLE\_RATE\_LIMIT	true	Enable/disable rate limiting

CORS	ENABLE\_CORS	true	Enable/disable CORS

Adding Feature Flags

javascript

// In .env

ENABLE\_NEW\_FEATURE=true



// In code

const isFeatureEnabled = process.env.ENABLE\_NEW\_FEATURE === 'true';

if (isFeatureEnabled) {

&#x20;   // New feature logic

}

📝 Best Practices

Configuration Best Practices

Practice	Why	How

Use .env files	Keep secrets out of code	Store all variables in .env

Never commit .env	Prevent secret exposure	Add .env to .gitignore

Use strong secrets	Prevent brute force	32+ character random strings

Environment-specific values	Different settings per env	Use NODE\_ENV checks

Document all variables	Help developers	Update this guide

Validate config on startup	Catch errors early	Check required variables

Use sensible defaults	Reduce configuration burden	Provide fallback values

Configuration Validation

javascript

// Validate required environment variables

function validateConfig() {

&#x20;   const required = \['MONGO\_URL', 'JWT\_SECRET'];

&#x20;   const missing = required.filter(key => !process.env\[key]);

&#x20;   

&#x20;   if (missing.length > 0) {

&#x20;       throw new Error(`Missing required environment variables: ${missing.join(', ')}`);

&#x20;   }

&#x20;   

&#x20;   // Validate JWT\_SECRET strength

&#x20;   if (process.env.JWT\_SECRET \&\& process.env.JWT\_SECRET.length < 32) {

&#x20;       console.warn('⚠️ JWT\_SECRET should be at least 32 characters long');

&#x20;   }

}



// Call on startup

validateConfig();

📚 Additional Resources

Configuration Files

File	Purpose

.env	Environment variables (local)

.env.example	Environment template

package.json	Package configuration

nodemon.json	Nodemon configuration

Links

Express.js Configuration Guide



MongoDB Connection Options



Helmet.js Documentation



Express Rate Limit



Last Updated: July 2026





