CONTRIBUTING\_GUIDE.md

markdown

\# 🤝 HealthLink - Contributing Guide



Welcome to HealthLink! We're excited to have you contribute to our project. This guide will help you understand how to contribute effectively.



\## 📋 Table of Contents

\- \[Code of Conduct](#code-of-conduct)

\- \[Getting Started](#getting-started)

\- \[Development Workflow](#development-workflow)

\- \[Branch Naming](#branch-naming)

\- \[Commit Messages](#commit-messages)

\- \[Pull Requests](#pull-requests)

\- \[Code Review](#code-review)

\- \[Coding Standards](#coding-standards)

\- \[Testing](#testing)

\- \[Reporting Issues](#reporting-issues)



\---



\## 📜 Code of Conduct



We are committed to providing a welcoming and inclusive environment. Please be respectful and considerate of others.



\### Our Standards

\- Use welcoming and inclusive language

\- Be respectful of differing viewpoints

\- Accept constructive criticism gracefully

\- Focus on what's best for the community



\---



\## 🚀 Getting Started



\### Prerequisites

\- Node.js v18+

\- MongoDB Atlas account

\- Git

\- Basic knowledge of JavaScript, Express.js, MongoDB



\### First-Time Setup



```bash

\# 1. Fork the repository

\# Click "Fork" button on GitHub



\# 2. Clone your fork

git clone https://github.com/your-username/HealthLink.git

cd HealthLink



\# 3. Add upstream remote

git remote add upstream https://github.com/pranav-gujar/HealthLink.git



\# 4. Install dependencies

npm install



\# 5. Create environment file

cp .env.example .env

\# Add your credentials to .env



\# 6. Start development server

npm run dev

🔄 Development Workflow

1\. Find an Issue

Browse open issues labeled good-first-issue or help-wanted



Comment on the issue to express interest



Wait for assignment from maintainers



2\. Create a Branch

bash

\# Always create branch from develop

git checkout develop

git pull upstream develop



\# Create feature branch

git checkout -b feature/your-feature-name

3\. Make Changes

Write clean, readable code



Add comments where necessary



Update documentation



Write tests for new features



4\. Commit Changes

bash

\# Stage changes

git add .



\# Commit with proper message format

git commit -m "feat(auth): add password reset functionality"



\# Push to your fork

git push origin feature/your-feature-name

5\. Create Pull Request

Go to GitHub and create a PR from your branch



Use the PR template



Link related issue



Request review from maintainers



🌿 Branch Naming Convention

Format: type/description

Prefix	Purpose	Example

feature/	New features	feature/patient-dashboard

fix/	Bug fixes	fix/login-validation

docs/	Documentation	docs/api-update

refactor/	Code refactoring	refactor/auth-service

test/	Adding tests	test/appointment-tests

chore/	Maintenance tasks	chore/update-dependencies

Examples

bash

feature/add-appointment-booking

fix/resolve-login-issue

docs/update-readme

refactor/optimize-database-queries

✍️ Commit Message Guidelines

Format

text

<type>(<scope>): <subject>



<body>



<footer>

Types

Type	Description	Example

feat	New feature	feat(auth): add JWT authentication

fix	Bug fix	fix(booking): correct date validation

docs	Documentation	docs(readme): update setup guide

style	Code style	style(login): format CSS

refactor	Code refactoring	refactor(user): optimize queries

test	Adding tests	test(api): add unit tests

chore	Maintenance	chore(deps): update express

Good Examples

text

feat(appointment): add appointment status tracking



\- Add status field to Appointment model

\- Create status update endpoint

\- Implement status change notifications



Closes #42

text

fix(auth): resolve password reset token expiration



Fix token expiration logic to properly handle expired tokens

and provide clear error messages to users.



Fixes #56

📥 Pull Request Process

PR Title Format

\[Type] Short description of changes



PR Checklist

Tests added/updated



Documentation updated



Self-review completed



No console.log statements



No commented-out code



Code follows style guide



PR Template

markdown

\### What does this PR do?



\### Why is this change needed?



\### How has this been tested?



\### Screenshots (if applicable)



\### Related Issues

Closes #(issue number)



\### Additional Context

👀 Code Review Guidelines

Reviewer Responsibilities

Check code functionality



Verify test coverage



Review code style



Provide constructive feedback



Reviewee Responsibilities

Respond to comments promptly



Make requested changes



Explain design decisions



Be open to suggestions



Review Checklist

Code is readable and maintainable



Tests are sufficient



Documentation is updated



No security issues



Performance considered



📝 Coding Standards

JavaScript/Node.js

javascript

// Use ES6+

const express = require('express');

const app = express();



// Use const/let, avoid var

const PORT = process.env.PORT || 5000;

let userCount = 0;



// Use async/await

const getUser = async (id) => {

&#x20;   try {

&#x20;       return await User.findById(id);

&#x20;   } catch (error) {

&#x20;       console.error('Error fetching user:', error);

&#x20;       throw error;

&#x20;   }

};



// Use descriptive variable names

const getUserById = async (userId) => {

&#x20;   // Good

&#x20;   const user = await User.findById(userId);

&#x20;   // Bad: const u = await User.findById(id);

};

CSS

css

/\* Use BEM naming convention \*/

.dashboard-container {}

.dashboard-container\_\_header {}

.dashboard-container\_\_button--primary {}



/\* Use meaningful class names \*/

.error-message {}  /\* Good \*/

.red-text {}       /\* Bad \*/



/\* Follow mobile-first approach \*/

.container {

&#x20;   width: 100%;

&#x20;   padding: 10px;

}



@media (min-width: 768px) {

&#x20;   .container {

&#x20;       padding: 20px;

&#x20;   }

}

HTML/EJS

html

<!-- Use semantic HTML -->

<header>

&#x20;   <nav>

&#x20;       <ul>

&#x20;           <li><a href="/">Home</a></li>

&#x20;       </ul>

&#x20;   </nav>

</header>



<!-- Avoid inline styles -->

<!-- Good -->

<div class="user-profile"></div>

<!-- Bad -->

<div style="color: red; padding: 10px;"></div>



<!-- Use proper indentation -->

<section>

&#x20;   <h1>Welcome, <%= user.name %></h1>

&#x20;   <p>Email: <%= user.email %></p>

</section>

🧪 Testing Requirements

Testing Levels

Level	Coverage Target	Tool

Unit Tests	80%	Jest

Integration Tests	Critical paths	Supertest

E2E Tests	User flows	Cypress (future)

Test Example

javascript

// Example unit test

describe('User Authentication', () => {

&#x20;   test('should hash password correctly', async () => {

&#x20;       const password = 'test123';

&#x20;       const hashed = await bcrypt.hash(password, 10);

&#x20;       const match = await bcrypt.compare(password, hashed);

&#x20;       expect(match).toBe(true);

&#x20;   });

});

🐛 Reporting Issues

Bug Report Template

markdown

\*\*Describe the bug\*\*

A clear description of what the bug is.



\*\*To Reproduce\*\*

Steps to reproduce the behavior:

1\. Go to '...'

2\. Click on '....'

3\. See error



\*\*Expected behavior\*\*

What you expected to happen.



\*\*Screenshots\*\*

If applicable, add screenshots.



\*\*Environment\*\*

\- OS: \[e.g., Windows 10]

\- Browser: \[e.g., Chrome 120]

\- Node Version: \[e.g., 18.15.0]



\*\*Additional context\*\*

Add any other context about the problem.

📚 Additional Resources

GitHub Flow



Conventional Commits



Semantic Versioning



Thank you for contributing to HealthLink! 🎉





