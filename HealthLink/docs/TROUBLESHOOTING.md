\# 🐛 HealthLink - Troubleshooting Guide



\## 📋 Overview

This guide helps you resolve common issues encountered while setting up and developing the HealthLink application. If you encounter an issue not listed here, please open an issue on GitHub.



\---



\## 📋 Table of Contents

\- \[Installation Issues](#installation-issues)

\- \[Environment Variables Issues](#environment-variables-issues)

\- \[npm \& Package Issues](#npm--package-issues)

\- \[MongoDB Connection Issues](#mongodb-connection-issues)

\- \[Server \& Nodemon Issues](#server--nodemon-issues)

\- \[Port Conflicts](#port-conflicts)

\- \[Authentication Issues](#authentication-issues)

\- \[Browser \& UI Issues](#browser--ui-issues)

\- \[Database Query Issues](#database-query-issues)

\- \[Git Issues](#git-issues)



\---



\## 🔧 Installation Issues



\### Issue: "npm install" fails



\*\*Symptoms:\*\*

\- npm errors during installation

\- Package installation hangs

\- Network timeout errors



\*\*Solutions:\*\*



```bash

\# Solution 1: Clear npm cache

npm cache clean --force



\# Solution 2: Delete node\_modules and reinstall

rm -rf node\_modules package-lock.json

npm install



\# Solution 3: Use npm ci

npm ci



\# Solution 4: Check Node version

node --version  # Should be v18+

nvm install 18  # If using nvm



\# Solution 5: Use different registry

npm config set registry https://registry.npmjs.org/


Issue: "Cannot find module" errors

Symptoms:



text

Error: Cannot find module 'express'

Error: Cannot find module 'mongoose'

Solutions:



bash

\# Solution 1: Reinstall missing modules

npm install express mongoose



\# Solution 2: Reinstall all dependencies

rm -rf node\_modules package-lock.json

npm install



\# Solution 3: Check import path

\# Ensure correct relative path

const express = require('express');  // ✅

const User = require('./models/User'); // ✅

🔑 Environment Variables Issues

Issue: .env not loading

Symptoms:



process.env.VARIABLE returns undefined



Application can't connect to MongoDB



JWT\_SECRET missing



Solutions:



bash

\# Solution 1: Check .env file location

\# Should be in project root

ls -la | grep .env



\# Solution 2: Check .env content

cat .env

\# Verify variables are set correctly



\# Solution 3: Use correct format

\# ✅ Correct

MONGO\_URL=mongodb+srv://user:pass@cluster.mongodb.net/db

\# ❌ Incorrect

MONGO\_URL = mongodb+srv://user:pass@cluster.mongodb.net/db



\# Solution 4: Restart server

npm run dev  # .env changes require restart

Issue: JWT Secret not working

Symptoms:



"Invalid token" errors



Login fails with token issues



Solutions:



javascript

// Solution 1: Check JWT\_SECRET in .env

JWT\_SECRET=your-strong-secret-key-here



// Solution 2: Verify secret is loaded

console.log('JWT\_SECRET:', process.env.JWT\_SECRET);



// Solution 3: Use consistent secret across environments

// Ensure same secret in development and production

📦 npm \& Package Issues

Issue: Package version conflicts

Symptoms:



text

npm ERR! peer dependency conflict

npm ERR! code ERESOLVE

Solutions:



bash

\# Solution 1: Use --legacy-peer-deps

npm install --legacy-peer-deps



\# Solution 2: Use --force

npm install --force



\# Solution 3: Update package versions

npm update



\# Solution 4: Check package.json for conflicting versions

\# Look for peer dependencies warnings

Issue: nodemon not working

Symptoms:



Changes don't reload server



"nodemon: command not found"



Solutions:



bash

\# Solution 1: Install globally

npm install -g nodemon



\# Solution 2: Use npx

npx nodemon server.js



\# Solution 3: Add to package.json

"scripts": {

&#x20;   "dev": "nodemon server.js"

}



\# Solution 4: Check nodemon.json configuration

\# Create nodemon.json:

{

&#x20;   "ignore": \["node\_modules", "\*.test.js"],

&#x20;   "watch": \["server.js", "models/", "routes/", "views/"],

&#x20;   "ext": "js,json,ejs"

}

🗄️ MongoDB Connection Issues

Issue: "MongoNetworkError"

Symptoms:



text

MongoNetworkError: connection failed

MongooseServerSelectionError

Solutions:



bash

\# Solution 1: Check MongoDB Atlas connection string

MONGO\_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname



\# Solution 2: Whitelist IP in MongoDB Atlas

\# Go to Network Access → Add IP Address

\# Add your current IP or 0.0.0.0/0



\# Solution 3: Check username/password

\# Ensure special characters are URL-encoded



\# Solution 4: Test connection with MongoDB Compass

\# Use same connection string to verify



\# Solution 5: Check network/VPN

\# Disable VPN temporarily

Issue: Authentication failed

Symptoms:



text

MongoError: Authentication failed

Solutions:



bash

\# Solution 1: Check credentials

MONGO\_URL=mongodb+srv://username:password@cluster.mongodb.net/db



\# Solution 2: Reset password in MongoDB Atlas

\# Users → Your User → Edit → Reset Password



\# Solution 3: Check database name

MONGO\_URL=mongodb+srv://user:pass@cluster.mongodb.net/healthlink



\# Solution 4: Ensure database exists in MongoDB Atlas

\# Create database if not exists

🖥️ Server \& Nodemon Issues

Issue: Server not starting

Symptoms:



Server crashes immediately



Port already in use



Syntax errors



Solutions:



bash

\# Solution 1: Check for syntax errors

node server.js  # Runs without nodemon



\# Solution 2: Check port availability

lsof -i :5000  # Check if port is in use

kill -9 PID     # Kill process if needed



\# Solution 3: Check environment variables

echo $MONGO\_URL  # Verify variables



\# Solution 4: Debug with --trace-warnings

node --trace-warnings server.js

Issue: Nodemon crashes

Symptoms:



"nodemon crashed" errors



Server stops unexpectedly



Solutions:



bash

\# Solution 1: Check nodemon logs

nodemon --verbose server.js



\# Solution 2: Clear nodemon cache

rm -rf node\_modules/.cache/



\# Solution 3: Update nodemon

npm update nodemon



\# Solution 4: Use restart option

nodemon --delay 500ms server.js

🌐 Port Conflicts

Issue: Port 5000 already in use

Symptoms:



text

Error: listen EADDRINUSE: address already in use :::5000

Solutions:



bash

\# Solution 1: Find process using port

lsof -i :5000  # Mac/Linux

netstat -ano | findstr :5000  # Windows



\# Solution 2: Kill process

kill -9 PID  # Mac/Linux

taskkill /PID PID /F  # Windows



\# Solution 3: Use different port

PORT=5001 npm run dev



\# Solution 4: Update .env

PORT=5001

🔐 Authentication Issues

Issue: Cannot login

Symptoms:



"No account found" error



"Incorrect password" error



Login redirects back to login page



Solutions:



javascript

// Solution 1: Check user exists in database

const user = await User.findOne({ email: 'test@test.com' });



// Solution 2: Check password hashing

const hashed = await bcrypt.hash(password, 10);

const match = await bcrypt.compare(password, hashed);



// Solution 3: Clear browser cookies

// Chrome: F12 → Application → Cookies → Clear



// Solution 4: Check JWT token

// Verify token in developer tools

// Application → Cookies → token

Issue: JWT token invalid

Symptoms:



"Invalid token" errors



Protected routes redirect to login



Solutions:



javascript

// Solution 1: Check JWT\_SECRET consistency

// Ensure same secret in .env and code



// Solution 2: Check token expiration

const token = jwt.sign(

&#x20;   { id: user.\_id },

&#x20;   process.env.JWT\_SECRET,

&#x20;   { expiresIn: '1h' }

);



// Solution 3: Check token format

// Verify token has header.payload.signature

const decoded = jwt.verify(token, process.env.JWT\_SECRET);

🌐 Browser \& UI Issues

Issue: CSS not loading

Symptoms:



Styling missing



404 errors for CSS files



Solutions:



bash

\# Solution 1: Check CSS path

<link rel="stylesheet" href="/css/style.css">  # ✅ Correct

<link rel="stylesheet" href="css/style.css">   # ❌ Wrong path



\# Solution 2: Clear browser cache

Ctrl+Shift+Delete  # Windows

Cmd+Shift+Delete   # Mac



\# Solution 3: Check public directory

app.use(express.static(path.join(\_\_dirname, 'public')));



\# Solution 4: Check file existence

ls public/css/style.css

Issue: JavaScript not working

Symptoms:



Console errors



Features not working



Solutions:



javascript

// Solution 1: Check script path

<script src="/js/script.js"></script>



// Solution 2: Check for syntax errors

// Open browser console (F12)

// Look for red error messages



// Solution 3: Use 'defer' attribute

<script src="/js/script.js" defer></script>

💾 Database Query Issues

Issue: Query returning empty results

Symptoms:



No data displayed



Empty arrays returned



Solutions:



javascript

// Solution 1: Check collection name

const users = await User.find({});  // Check if user exists



// Solution 2: Add debug logging

console.log('Query:', { role: 'doctor' });

const doctors = await User.find({ role: 'doctor' });

console.log('Result:', doctors);



// Solution 3: Check field names

// Model: role

// Query: { role: 'doctor' }  // ✅ Correct

// Query: { roles: 'doctor' }  // ❌ Wrong



// Solution 4: Check data types

// Use .lean() for plain objects

const users = await User.find({}).lean();

Issue: MongoDB aggregation failing

Symptoms:



$lookup returns empty



"Cannot read property '0' of undefined"



Solutions:



javascript

// Solution 1: Check field names in $lookup

{

&#x20;   $lookup: {

&#x20;       from: "users",        // Collection name in MongoDB

&#x20;       localField: "doctor",  // Field in current collection

&#x20;       foreignField: "\_id",   // Field in joined collection

&#x20;       as: "doctorDetails"

&#x20;   }

}



// Solution 2: Handle null results

{

&#x20;   $unwind: {

&#x20;       path: "$doctorDetails",

&#x20;       preserveNullAndEmptyArrays: true

&#x20;   }

}



// Solution 3: Add debug stage

{ $match: { patient: patientId } }

🛠️ Git Issues

Issue: Merge conflicts

Symptoms:



"merge conflict" errors



Cannot merge branches



Solutions:



bash

\# Solution 1: Identify conflicts

git status  # Shows conflicting files



\# Solution 2: Open conflicted file

\# Look for <<<<<<< HEAD and >>>>>>> branch



\# Solution 3: Resolve manually

\# Edit file to keep correct code



\# Solution 4: After resolving

git add .

git commit -m "resolve merge conflicts"



\# Solution 5: Use mergetool

git mergetool

Issue: Cannot push to GitHub

Symptoms:



"Permission denied"



"Authentication failed"



Solutions:



bash

\# Solution 1: Check credentials

git config --list  # Check git config



\# Solution 2: Update remote URL

git remote set-url origin https://username:token@github.com/username/repo.git



\# Solution 3: Use SSH instead

git remote set-url origin git@github.com:username/repo.git



\# Solution 4: Generate new token

\# GitHub Settings → Developer settings → Personal access tokens

🎯 Quick Reference

Common Error Codes \& Solutions

Error	Quick Fix

EADDRINUSE	Kill process on port

MongoNetworkError	Check IP whitelist

ERESOLVE	Use --legacy-peer-deps

MODULE\_NOT\_FOUND	Reinstall dependencies

JWT\_SECRET	Set in .env file

Command Shortcuts

bash

\# Start with clean slate

rm -rf node\_modules package-lock.json \&\& npm install



\# Debug server

node --inspect server.js



\# Check environment

node -e "console.log(process.env)"



\# Kill node processes

killall node  # Mac/Linux

taskkill /F /IM node.exe  # Windows

📞 Getting Help

If you're still stuck:



Check GitHub Issues: Search for similar problems



Create New Issue: Describe your problem in detail



Discord Community: Ask for help in our Discord



Team Email: Contact the core team directly



Last Updated: November 2026

