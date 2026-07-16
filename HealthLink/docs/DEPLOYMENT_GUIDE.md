\# 🚀 HealthLink - Deployment \& Production Guide



\## 📋 Table of Contents

\- \[Deployment Overview](#deployment-overview)

\- \[Environment Setup](#environment-setup)

\- \[Pre-Deployment Checklist](#pre-deployment-checklist)

\- \[Deployment Process](#deployment-process)

\- \[Post-Deployment Verification](#post-deployment-verification)

\- \[Rollback Procedures](#rollback-procedures)

\- \[Monitoring \& Maintenance](#monitoring--maintenance)

\- \[Troubleshooting](#troubleshooting)



\---



\## 🎯 Deployment Overview



\### Architecture



┌─────────────────────────────────────────────────────────────┐

│ PRODUCTION ENVIRONMENT │

├─────────────────────────────────────────────────────────────┤

│ │

│ ┌─────────────────────────────────────────────────────┐ │

│ │ Render Platform │ │

│ │ │ │

│ │ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │ │

│ │ │ Node.js │ │ Node.js │ │ Node.js │ │ │

│ │ │ Instance │ │ Instance │ │ Instance │ │ │

│ │ └─────────────┘ └─────────────┘ └───────────┘ │ │

│ └─────────────────────────────────────────────────────┘ │

│ │ │

│ ▼ │

│ ┌─────────────────────────────────────────────────────┐ │

│ │ MongoDB Atlas │ │

│ │ ┌─────────────┐ ┌─────────────┐ │ │

│ │ │ Primary │ │ Secondary │ │ │

│ │ └─────────────┘ └─────────────┘ │ │

│ └─────────────────────────────────────────────────────┘ │

│ │

└─────────────────────────────────────────────────────────────┘



text



\### Key Components

\- \*\*Application Server\*\*: Node.js running on Render

\- \*\*Database\*\*: MongoDB Atlas (production cluster)

\- \*\*File Storage\*\*: Render's persistent storage

\- \*\*CDN\*\*: Render's built-in CDN



\---



\## 🔧 Environment Setup



\### Required Environment Variables



```env

\# Server Configuration

PORT=5000

NODE\_ENV=production



\# Database

MONGO\_URL=mongodb+srv://username:password@cluster.mongodb.net/healthlink



\# JWT Authentication

JWT\_SECRET=your-production-secret-key



\# AI Services

OPENAI\_API\_KEY=sk-your-production-api-key



\# Email Service (SendGrid)

SENDGRID\_API\_KEY=your-sendgrid-api-key

FROM\_EMAIL=noreply@healthlink.com



\# Security

COOKIE\_SECRET=your-cookie-secret

CORS\_ORIGIN=https://healthlink.com



\# Monitoring

SENTRY\_DSN=your-sentry-dsn (optional)

Setting Up Secrets

bash

\# Render Platform

\# 1. Go to Dashboard → HealthLink Service

\# 2. Click "Environment"

\# 3. Add each variable

\# 4. Click "Save"



\# Command Line (if using CLI)

render env set MONGO\_URL="your-mongo-url"

render env set JWT\_SECRET="your-secret"

✅ Pre-Deployment Checklist

Before Deployment

All tests passing (npm test)



Code coverage meets threshold (80%+)



No security vulnerabilities (npm audit)



Dependencies updated (npm outdated)



Environment variables configured



Database migrations ready



Documentation updated



Performance tested locally



Logging configured



Code Quality Check

bash

\# Run linting

npm run lint



\# Run tests with coverage

npm test -- --coverage



\# Check for vulnerabilities

npm audit



\# Check for outdated packages

npm outdated

🚀 Deployment Process

Step 1: Build the Application

bash

\# Install production dependencies

npm install --production



\# Build frontend assets (if any)

npm run build



\# Run database migrations (if any)

npm run migrate

Step 2: Deploy to Render

Option A: Automatic Deployment (GitHub Integration)



bash

\# 1. Push to main branch

git push origin main



\# 2. Render auto-detects changes

\# 3. Builds and deploys automatically

\# 4. Wait for deployment completion

Option B: Manual Deployment



bash

\# 1. Login to Render

\# 2. Go to HealthLink service

\# 3. Click "Manual Deploy"

\# 4. Choose branch

\# 5. Click "Deploy"

Option C: CLI Deployment



bash

\# Install Render CLI

npm install -g render-cli



\# Login

render login



\# Deploy

render deploy

Step 3: Verify Deployment

bash

\# Health check

curl https://healthlink.com/health



\# Check logs

\# Render Dashboard → Logs



\# Test endpoints

curl https://healthlink.com/api/users

🔍 Post-Deployment Verification

1\. Health Check

bash

\# Check API health

curl https://healthlink.com/health



\# Expected Response

{

&#x20;   "status": "healthy",

&#x20;   "timestamp": "2024-11-24T10:00:00.000Z",

&#x20;   "uptime": 3600,

&#x20;   "environment": "production"

}

2\. Smoke Test

bash

\# Test login

curl -X POST https://healthlink.com/login \\

&#x20;   -H "Content-Type: application/json" \\

&#x20;   -d '{"email":"test@test.com","password":"test123"}'



\# Test protected route

curl https://healthlink.com/dashboard \\

&#x20;   -H "Cookie: token=your-jwt-token"

3\. Database Verification

bash

\# Connect to MongoDB Atlas

mongo "mongodb+srv://cluster.mongodb.net/healthlink" \\

&#x20;   --username your-username



\# Check collections

show collections



\# Verify data

db.users.count()

db.appointments.count()

4\. Performance Testing

bash

\# Quick performance check

curl -w "@curl-format.txt" -o /dev/null -s https://healthlink.com



\# Using Apache Bench (if installed)

ab -n 100 -c 10 https://healthlink.com/health

🔄 Rollback Procedures

When to Rollback

Critical bugs discovered



Performance degradation



Data corruption



Security vulnerabilities



Broken functionality



Quick Rollback

bash

\# Step 1: Check previous versions

render versions



\# Step 2: Rollback to previous version

render rollback --version <version-id>



\# Step 3: Verify rollback

curl https://healthlink.com/health

Database Rollback

javascript

// If database migration needs rollback

const mongoose = require('mongoose');



async function rollbackMigration() {

&#x20;   await mongoose.connect(process.env.MONGO\_URL);

&#x20;   

&#x20;   // Revert changes

&#x20;   await Appointment.updateMany(

&#x20;       { status: 'Pending' },

&#x20;       { $set: { status: 'Confirmed' } }

&#x20;   );

&#x20;   

&#x20;   console.log('Migration rolled back');

}

📊 Monitoring \& Maintenance

Logging Setup

javascript

// Winston logger configuration

const winston = require('winston');



const logger = winston.createLogger({

&#x20;   level: 'info',

&#x20;   format: winston.format.json(),

&#x20;   transports: \[

&#x20;       new winston.transports.File({ filename: 'error.log', level: 'error' }),

&#x20;       new winston.transports.File({ filename: 'combined.log' })

&#x20;   ]

});



if (process.env.NODE\_ENV === 'production') {

&#x20;   logger.add(new winston.transports.Console({

&#x20;       format: winston.format.simple()

&#x20;   }));

}

Performance Monitoring

bash

\# Monitor application

render logs --tail



\# Monitor database

\# MongoDB Atlas → Metrics → Performance



\# Monitor uptime

\# Add UptimeRobot or Pingdom monitoring

Backup Strategy

bash

\# Database backup (daily)

mongodump --uri="mongodb+srv://..." --out="/backups/$(date +%Y%m%d)"



\# Application backup

\# Render automatically backs up environment variables

\# Code is version controlled

🐛 Troubleshooting

Common Issues \& Solutions

Issue 1: Application Fails to Start

Symptoms:



"Application failed to start" error



"Port 5000 already in use"



Solutions:



bash

\# Check if process is running

ps aux | grep node



\# Kill process

kill -9 <PID>



\# Restart application

npm start

Issue 2: Database Connection Failed

Symptoms:



"MongoNetworkError"



"Connection timed out"



Solutions:



bash

\# Check connection string

echo $MONGO\_URL



\# Verify IP whitelist

\# MongoDB Atlas → Network Access → Add IP



\# Test connection

node -e "require('mongoose').connect(process.env.MONGO\_URL)"

Issue 3: Environment Variables Missing

Symptoms:



"Environment variable is not defined"



"JWT\_SECRET is missing"



Solutions:



bash

\# Check environment variables

render env



\# Add missing variable

render env set VARIABLE\_NAME=value



\# Restart application

render restart

Issue 4: High Memory Usage

Symptoms:



"Out of memory" errors



Slow response times



Solutions:



javascript

// Increase Node memory limit

// In package.json

"scripts": {

&#x20;   "start": "node --max-old-space-size=4096 server.js"

}



// Check for memory leaks

// Use node --inspect for debugging

node --inspect server.js

📝 Deployment Checklist

Final Deployment Checklist

Code reviewed and approved



All tests passing



Environment variables configured



Database migrations prepared



Assets built and optimized



Documentation updated



Monitoring configured



Rollback plan ready



Post-Deployment Checklist

Health check passes



Smoke tests pass



Performance acceptable



Logs show no errors



Users can login



Core features working



Analytics tracking works



🔗 Additional Resources

External Links

Render Documentation



MongoDB Atlas Guide



Node.js Production Best Practices



Internal Resources

Project README



Architecture Overview



API Documentation



Last Updated: July 2026

