\# 🔧 HealthLink - Development Workflow Guide



\## 📋 Overview

This document outlines the complete development workflow for HealthLink, from local setup to deployment. Follow these guidelines to ensure smooth development and collaboration.



\---



\## 📋 Table of Contents

\- \[System Requirements](#system-requirements)

\- \[Local Setup](#local-setup)

\- \[Development Cycle](#development-cycle)

\- \[Git Workflow](#git-workflow)

\- \[Testing Guide](#testing-guide)

\- \[Build \& Deploy](#build--deploy)

\- \[Debugging Tips](#debugging-tips)



\---



\## 💻 System Requirements



\### Minimum Requirements

| Component | Version | Notes |

|-----------|---------|-------|

| Node.js | v18+ | Required for runtime |

| npm | v9+ | Package manager |

| MongoDB Atlas | Free Tier (M0) | Database |

| Git | Latest | Version control |

| RAM | 4GB+ | For development |

| Storage | 2GB+ | For dependencies |



\### Recommended Setup

\- \*\*OS\*\*: macOS/Linux/Windows 10+

\- \*\*Browser\*\*: Chrome/Firefox/Edge (latest)

\- \*\*IDE\*\*: VS Code with extensions:

&#x20; - ESLint

&#x20; - Prettier

&#x20; - MongoDB for VS Code

&#x20; - EJS language support



\---



\## 🚀 Local Setup



\### Step 1: Clone Repository



```bash

\# Clone the repository

git clone https://github.com/pranav-gujar/HealthLink.git

cd HealthLink



\# Checkout develop branch

git checkout develop



Step 2: Install Dependencies

bash

\# Install npm packages

npm install



\# If issues, try

npm ci

Step 3: Configure Environment

bash

\# Create .env file

touch .env



\# Add required variables

cat > .env << EOF

PORT=5000

MONGO\_URL=your\_mongodb\_connection\_string

JWT\_SECRET=your\_secret\_key

OPENAI\_API\_KEY=your\_openai\_api\_key

NODE\_ENV=development

EOF

Step 4: Verify Setup

bash

\# Start development server

npm run dev



\# Check server is running

curl http://localhost:5000/health

🔄 Development Cycle

1\. Pick a Task

Check open issues



Get assigned or create issue



Discuss with team if needed



2\. Create Feature Branch

bash

git checkout develop

git pull upstream develop

git checkout -b feature/my-feature

3\. Development

bash

\# Start dev server with auto-reload

npm run dev



\# Lint code

npm run lint



\# Format code

npm run format



\# Run tests

npm test

4\. Commit Changes

bash

git add .

git commit -m "type(scope): description"



\# For multiple files

git commit -m "feat(auth): add password reset" -m "Implement email-based password reset"

5\. Push \& Create PR

bash

git push origin feature/my-feature

\# Create PR on GitHub

🌿 Git Workflow

Branch Structure

text

main               # Production branch

└── develop        # Development branch

&#x20;   ├── feature/\*  # New features

&#x20;   ├── fix/\*      # Bug fixes

&#x20;   ├── docs/\*     # Documentation

&#x20;   └── refactor/\* # Code refactoring

Daily Workflow

bash

\# 1. Start your day

git checkout develop

git pull upstream develop



\# 2. Create feature branch

git checkout -b feature/your-feature



\# 3. Work on your feature

git add .

git commit -m "feat: implement feature"



\# 4. Stay updated

git fetch upstream

git rebase develop

git push origin feature/your-feature



\# 5. End of day

git push origin feature/your-feature

Commands Reference

Command	Purpose

git checkout -b branch-name	Create new branch

git add .	Stage all changes

git commit -m "message"	Commit changes

git push origin branch	Push to remote

git pull upstream develop	Pull latest changes

git rebase develop	Rebase on develop

git stash	Save uncommitted changes

🧪 Testing Guide

Testing Setup

bash

\# Install test dependencies

npm install --save-dev jest supertest



\# Create test directory structure

mkdir -p tests/unit tests/integration

Writing Tests

Unit Test Example:



javascript

// tests/unit/auth.test.js

const bcrypt = require('bcryptjs');

const User = require('../../models/User');



describe('User Model', () => {

&#x20;   test('should hash password', async () => {

&#x20;       const password = 'test123';

&#x20;       const hashed = await bcrypt.hash(password, 10);

&#x20;       const match = await bcrypt.compare(password, hashed);

&#x20;       expect(match).toBe(true);

&#x20;   });

});

Integration Test Example:



javascript

// tests/integration/auth.test.js

const request = require('supertest');

const app = require('../../server');



describe('Auth Endpoints', () => {

&#x20;   test('should register new user', async () => {

&#x20;       const res = await request(app)

&#x20;           .post('/signup')

&#x20;           .send({

&#x20;               name: 'Test User',

&#x20;               email: 'test@example.com',

&#x20;               password: 'Test123!',

&#x20;               role: 'patient'

&#x20;           });

&#x20;       expect(res.status).toBe(302);

&#x20;   });

});

Running Tests

bash

\# Run all tests

npm test



\# Run specific test file

npm test -- auth.test.js



\# Watch mode

npm test -- --watch



\# With coverage

npm test -- --coverage

📦 Build \& Deploy

Build Process

bash

\# Production build

npm run build



\# Start production server

NODE\_ENV=production npm start



\# Verify deployment

curl http://localhost:5000/health

Deployment on Render

yaml

\# Render Configuration

buildCommand: npm install

startCommand: node server.js

envVars:

&#x20; - MONGO\_URL

&#x20; - JWT\_SECRET

&#x20; - OPENAI\_API\_KEY

&#x20; - NODE\_ENV=production

Pre-deployment Checklist

All tests passing



Environment variables set



Database migrations ready



Performance tested



Security reviewed



Documentation updated



🐛 Debugging Tips

Common Debugging Techniques

1\. Console Logging



javascript

console.log('Variable value:', variable);

console.log('Request body:', req.body);

console.error('Error:', error);

2\. VS Code Debugger



javascript

// Add launch.json for VS Code

{

&#x20;   "version": "0.2.0",

&#x20;   "configurations": \[

&#x20;       {

&#x20;           "type": "node",

&#x20;           "request": "launch",

&#x20;           "name": "Launch Server",

&#x20;           "program": "${workspaceFolder}/server.js"

&#x20;       }

&#x20;   ]

}

3\. MongoDB Debugging



javascript

// Enable mongoose debug

mongoose.set('debug', true);



// Query logging

const user = await User.find({}).explain('executionStats');

4\. Network Debugging



bash

\# Check ports

lsof -i :5000



\# Check API with curl

curl http://localhost:5000/health



\# Check with POST

curl -X POST http://localhost:5000/login \\

&#x20; -H "Content-Type: application/json" \\

&#x20; -d '{"email":"test@test.com","password":"test123"}'

🎯 Performance Tips

Database Optimization

Use .lean() for read-only queries



Add indexes on frequently queried fields



Use aggregation pipelines for complex queries



Limit result sets with .limit()



Code Optimization

Use const and let instead of var



Avoid blocking operations



Use async/await for asynchronous code



Cache frequently accessed data



Development Speed

Use nodemon for auto-reload



Use environment variables for configuration



Set up prettier for auto-formatting



Use git hooks for pre-commit checks



🔄 CI/CD Workflow

GitHub Actions Configuration

yaml

\# .github/workflows/ci.yml

name: CI/CD



on:

&#x20; push:

&#x20;   branches: \[ develop, main ]

&#x20; pull\_request:

&#x20;   branches: \[ develop ]



jobs:

&#x20; test:

&#x20;   runs-on: ubuntu-latest

&#x20;   steps:

&#x20;     - uses: actions/checkout@v3

&#x20;     - uses: actions/setup-node@v3

&#x20;       with:

&#x20;         node-version: '18'

&#x20;     - run: npm ci

&#x20;     - run: npm test

&#x20;     - run: npm run lint



&#x20; deploy:

&#x20;   needs: test

&#x20;   runs-on: ubuntu-latest

&#x20;   if: github.ref == 'refs/heads/main'

&#x20;   steps:

&#x20;     - name: Deploy to Render

&#x20;       run: curl -X POST ${{ secrets.RENDER\_DEPLOY\_URL }}

📚 Additional Resources

GitHub Flow Guide



Jest Documentation



MongoDB Debugging



Node.js Debugging



Happy Coding! 🚀





