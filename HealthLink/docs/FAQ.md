❓ HealthLink - Frequently Asked Questions (FAQ)

📋 Overview

Welcome to the HealthLink FAQ! This document addresses common questions, troubleshooting tips, and development workflows to help you get started with the project quickly.



🚀 Getting Started

Q1: What are the system requirements to run HealthLink locally?

A: You'll need the following:



Node.js: v18.x or higher



MongoDB: MongoDB Atlas account (free tier works) or local MongoDB installation



Git: For cloning the repository



Modern Browser: Chrome, Firefox, Edge, or Safari (latest versions)



RAM: Minimum 4GB (8GB recommended)



Q2: How do I set up the project for the first time?

A: Follow these steps:



bash

\# 1. Clone the repository

git clone https://github.com/pranav-gujar/HealthLink.git

cd HealthLink



\# 2. Install dependencies

npm install



\# 3. Create .env file

cp .env.example .env



\# 4. Update .env with your credentials

\# - Add MongoDB connection string

\# - Add JWT secret

\# - Add OpenAI API key



\# 5. Start the development server

npm run dev

Q3: I'm getting "MongoDB Connection Error". What should I do?

A: This usually indicates a connection issue. Try these solutions:



Verify your connection string in .env file:



text

MONGO\_URI=mongodb+srv://username:password@cluster.mongodb.net/healthlink

Check IP whitelist in MongoDB Atlas:



Go to Network Access → Add IP Address



Add your current IP or 0.0.0.0/0 for testing



Verify database name exists in MongoDB Atlas



Test connection using MongoDB Compass



🛠️ Common Issues

Q4: The app runs but I can't login. What's wrong?

A: Common login issues and fixes:



Issue	Solution

"No account found"	User needs to sign up first

"Incorrect password"	Use password reset or create new account

Token error	Clear browser cookies and try again

Role mismatch	Ensure you're using correct login page

Q5: How do I reset my database?

A: Use these methods:



bash

\# Method 1: Drop collections via MongoDB Shell

use healthlink

db.users.drop()

db.appointments.drop()



\# Method 2: Use provided seed script (if available)

npm run seed



\# Method 3: Manual deletion via MongoDB Compass

Q6: Why is my AI chatbot not responding?

A: Check these common issues:



API Key missing: Ensure OPENAI\_API\_KEY is in .env



API Key expired: Regenerate key in OpenAI dashboard



Rate limiting: Wait before making more requests



Network issues: Check internet connectivity



💻 Development Workflows

Q7: What's the recommended Git workflow?

A: We follow this branching strategy:



bash

\# 1. Create feature branch

git checkout -b feature/your-feature-name



\# 2. Make changes and commit

git add .

git commit -m "feat: describe your changes"



\# 3. Push to remote

git push origin feature/your-feature-name



\# 4. Create Pull Request

\# - Go to GitHub repo

\# - Click "New Pull Request"

\# - Describe your changes

Q8: How should I format commit messages?

A: Use conventional commit format:



Type	Description	Example

feat	New feature	feat: add password reset functionality

fix	Bug fix	fix: resolve login validation error

docs	Documentation	docs: update API documentation

style	Code style	style: format code with prettier

refactor	Code refactoring	refactor: optimize database queries

test	Testing	test: add unit tests for auth routes

Q9: How do I test my changes locally?

A: Run these commands:



bash

\# Run all tests

npm test



\# Run specific test file

npm test -- auth.test.js



\# Run with coverage

npm run test:coverage



\# Lint code

npm run lint



\# Fix lint issues

npm run lint:fix

Q10: What environment variables do I need?

A: Required environment variables:



Variable	Purpose	Example

PORT	Server port	5000

MONGO\_URL	MongoDB connection	mongodb+srv://...

JWT\_SECRET	JWT signing key	your-secret-key-here

OPENAI\_API\_KEY	OpenAI API key	sk-...

NODE\_ENV	Environment mode	development or production

🏗️ Architecture Questions

Q11: How is the project structured?

A: HealthLink follows MVC architecture:



text

HealthLink/

├── server.js           # Entry point

├── models/             # Database models

│   ├── User.js

│   └── Appointment.js

├── views/              # EJS templates

│   ├── login.ejs

│   ├── signup.ejs

│   └── dashboard.ejs

├── public/             # Static files

│   ├── css/

│   ├── js/

│   └── img/

└── routes/             # Route definitions

&#x20;   ├── authRoutes.js

&#x20;   └── dashboard.js

Q12: Which database are we using and why?

A: We use MongoDB Atlas because:



Scalability: Handles growing data needs



Flexibility: Schema-less design for rapid iterations



Cloud-native: No server management needed



Free tier: Perfect for development



Built-in security: Encryption, authentication, and authorization



🔧 Troubleshooting

Q13: "Port 5000 already in use" error?

A: Fix by:



bash

\# Find process using port 5000

lsof -i :5000



\# Kill the process

kill -9 \[PID]



\# Or use different port

PORT=5001 npm start

Q14: "npm install" fails?

A: Try these solutions:



bash

\# Clear npm cache

npm cache clean --force



\# Delete node\_modules and reinstall

rm -rf node\_modules package-lock.json

npm install



\# Use specific Node version

nvm use 18

Q15: How do I debug the application?

A: Use these debugging tools:



VS Code Debugger: Launch configuration included



Console.log: Standard logging



Node Inspector: node --inspect server.js



MongoDB Compass: Visual database explorer



Postman: API testing tool



Q16: My changes aren't reflecting in browser?

A: Common fixes:



Clear browser cache: Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)



Restart server: Stop and restart npm run dev



Check browser dev tools: Look for errors in console



Force refresh: Ctrl+F5 or Cmd+Shift+R



🤝 Community \& Support

Q17: How can I contribute to HealthLink?

A: Check out our Contributing Guide for detailed information. Quick steps:



Browse open issues labeled good-first-issue



Comment on the issue you'd like to work on



Follow the Git workflow mentioned above



Submit your PR for review



Q18: Where can I get help if I'm stuck?

A: Reach out through:



GitHub Issues: Post technical questions



Discord Community: Chat with other developers



Email: healthlink-support@example.com



Documentation: Check our Wiki



Q19: What's the testing strategy?

A: We follow this testing pyramid:



Unit Tests (70%): Individual functions and components



Integration Tests (20%): API endpoints and database



End-to-End Tests (10%): User workflows



Q20: Are there any security considerations?

A: Yes, follow these practices:



Never commit .env file



Use environment variables for secrets



Validate all user inputs



Hash passwords with bcrypt



Use HTTPS in production



Regular dependency updates



📚 Additional Resources

Useful Links

Project Documentation



API Reference



Style Guide



Issue Tracker



Last Updated: November 2026 | Version: 1.0.0

