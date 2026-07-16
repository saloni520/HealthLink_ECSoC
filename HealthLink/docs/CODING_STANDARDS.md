\# 📐 HealthLink - Coding Standards \& Style Guide



\## 📋 Table of Contents

\- \[Introduction](#introduction)

\- \[General Principles](#general-principles)

\- \[JavaScript/Node.js Standards](#javascriptnodejs-standards)

\- \[CSS/Styling Standards](#cssstyling-standards)

\- \[EJS Template Standards](#ejs-template-standards)

\- \[Git \& Commit Standards](#git--commit-standards)

\- \[Testing Standards](#testing-standards)

\- \[Documentation Standards](#documentation-standards)

\- \[Code Review Checklist](#code-review-checklist)



\---



\## 🎯 Introduction



This document defines the coding standards and style guidelines for the HealthLink project. Following these standards ensures:

\- Consistent codebase across the team

\- Improved readability and maintainability

\- Easier onboarding for new developers

\- Reduced code review friction

\- Higher code quality overall



\---



\## 🌟 General Principles



\### 1. Readability First

\- Write code for humans, not machines

\- Use descriptive variable and function names

\- Keep functions small and focused

\- Comment complex logic



\### 2. Consistency

\- Follow the established patterns

\- Use the same style throughout the project

\- Don't mix different coding styles



\### 3. Simplicity

\- Keep it simple (KISS principle)

\- Avoid over-engineering

\- Write straightforward solutions

\- Prefer clarity over cleverness



\### 4. DRY Principle

\- Don't Repeat Yourself

\- Extract reusable functions

\- Use utility modules

\- Share common logic



\### 5. Error Handling

\- Always handle errors gracefully

\- Log meaningful error messages

\- Don't swallow exceptions silently

\- Provide user-friendly error messages



\---



\## 📦 JavaScript/Node.js Standards



\### 1. Variable Declarations



```javascript

// ✅ GOOD: Use const for values that don't change

const PORT = process.env.PORT || 5000;

const MAX\_RETRIES = 3;



// ✅ GOOD: Use let for values that change

let userCount = 0;

let isAuthenticated = false;



// ❌ BAD: Never use var

var userName = "John"; // Don't use this



2\. Function Declarations

javascript

// ✅ GOOD: Arrow functions for callbacks

app.get("/users", (req, res) => {

&#x20;   res.json(users);

});



// ✅ GOOD: Async/await for promises

async function fetchUser(id) {

&#x20;   try {

&#x20;       const user = await User.findById(id);

&#x20;       return user;

&#x20;   } catch (error) {

&#x20;       console.error("Error fetching user:", error);

&#x20;       throw error;

&#x20;   }

}



// ✅ GOOD: Descriptive function names

function getUserByEmail(email) { ... }

function calculateTotalPrice(items) { ... }



// ❌ BAD: Vague function names

function getData() { ... }

function calc() { ... }

3\. Module Imports/Exports

javascript

// ✅ GOOD: Import at the top of file

const express = require("express");

const mongoose = require("mongoose");

const User = require("./models/User");



// ✅ GOOD: Export at the bottom

module.exports = router;

module.exports = User;



// ✅ GOOD: Named exports

const helpers = { validateEmail, hashPassword };

module.exports = helpers;



// ❌ BAD: Imports scattered throughout file

4\. Error Handling Pattern

javascript

// ✅ GOOD: Comprehensive error handling

app.post("/login", async (req, res) => {

&#x20;   const { email, password } = req.body;



&#x20;   try {

&#x20;       const user = await User.findOne({ email });

&#x20;       if (!user) {

&#x20;           return res.status(404).json({

&#x20;               success: false,

&#x20;               message: "User not found"

&#x20;           });

&#x20;       }



&#x20;       const isMatch = await bcrypt.compare(password, user.password);

&#x20;       if (!isMatch) {

&#x20;           return res.status(401).json({

&#x20;               success: false,

&#x20;               message: "Invalid credentials"

&#x20;           });

&#x20;       }



&#x20;       res.json({ success: true, user });

&#x20;   } catch (error) {

&#x20;       console.error("Login error:", error);

&#x20;       res.status(500).json({

&#x20;           success: false,

&#x20;           message: "Internal server error"

&#x20;       });

&#x20;   }

});



// ❌ BAD: Empty catch block

try {

&#x20;   // code

} catch (error) {

&#x20;   // Do nothing

}

5\. Object Destructuring

javascript

// ✅ GOOD: Use destructuring

const { name, email, role } = req.body;

const { id } = req.params;



// ✅ GOOD: Use spread operator

const updatedUser = { ...user, lastLogin: new Date() };



// ❌ BAD: Accessing properties directly

const name = req.body.name;

const email = req.body.email;

🎨 CSS/Styling Standards

1\. BEM Naming Convention

css

/\* ✅ GOOD: BEM methodology \*/

.dashboard {}

.dashboard\_\_header {}

.dashboard\_\_header--active {}

.dashboard\_\_card {}

.dashboard\_\_card--primary {}



/\* ❌ BAD: Inconsistent naming \*/

.dashboard-header {}

.dashHeader {}

.dash-head {}

2\. File Organization

css

/\* ✅ GOOD: Organized CSS \*/

/\* ============================================

&#x20;  1. GLOBAL RESET

&#x20;  ============================================ \*/



/\* ============================================

&#x20;  2. LAYOUT

&#x20;  ============================================ \*/



/\* ============================================

&#x20;  3. COMPONENTS

&#x20;  ============================================ \*/



/\* ============================================

&#x20;  4. RESPONSIVE

&#x20;  ============================================ \*/

3\. Responsive Design

css

/\* ✅ GOOD: Mobile-first approach \*/

.container {

&#x20;   width: 100%;

&#x20;   padding: 10px;

}



@media (min-width: 768px) {

&#x20;   .container {

&#x20;       max-width: 720px;

&#x20;       padding: 20px;

&#x20;   }

}



@media (min-width: 1024px) {

&#x20;   .container {

&#x20;       max-width: 960px;

&#x20;       padding: 30px;

&#x20;   }

}

4\. Color Variables

css

/\* ✅ GOOD: CSS variables for colors \*/

:root {

&#x20;   --color-primary: #64ffda;

&#x20;   --color-primary-dark: #52e0c4;

&#x20;   --color-bg-dark: #0a192f;

&#x20;   --color-text-light: #ccd6f6;

&#x20;   --color-text-muted: #8892b0;

}

📄 EJS Template Standards

1\. Template Structure

html

<!-- ✅ GOOD: Clean template structure -->

<!DOCTYPE html>

<html lang="en">

<head>

&#x20;   <meta charset="UTF-8">

&#x20;   <meta name="viewport" content="width=device-width, initial-scale=1.0">

&#x20;   <title><%= title %></title>

&#x20;   <link rel="stylesheet" href="/css/style.css">

</head>

<body>

&#x20;   <%- include('partials/header', { user: user }) %>

&#x20;   

&#x20;   <main>

&#x20;       <h1>Welcome, <%= user.name %></h1>

&#x20;       <%- content %>

&#x20;   </main>

&#x20;   

&#x20;   <%- include('partials/footer') %>

</body>

</html>

2\. Logic in Templates

html

<!-- ✅ GOOD: Simple logic in templates -->

<% if (user.role === 'patient') { %>

&#x20;   <a href="/doctors">Find a Doctor</a>

<% } else if (user.role === 'doctor') { %>

&#x20;   <a href="/appointments">View Appointments</a>

<% } %>



<!-- ❌ BAD: Complex logic in templates -->

<% 

&#x20;   const appointments = await getAppointments();

&#x20;   const filtered = appointments.filter(a => a.status === 'pending');

%>

🌿 Git \& Commit Standards

1\. Branch Naming

bash

\# ✅ GOOD: Branch naming format

feature/patient-dashboard

fix/login-validation-error

docs/update-api-documentation

refactor/optimize-database-queries

chore/update-dependencies



\# ❌ BAD: Unclear branch names

my-fix

testing

new-feature

2\. Commit Messages

bash

\# ✅ GOOD: Conventional commit format

feat(auth): implement password reset functionality

fix(booking): resolve appointment timezone issue

docs(api): update endpoint documentation

refactor(user): optimize database queries



\# ✅ GOOD: Detailed commit with body

feat(appointment): add appointment cancellation feature



\- Implement cancel endpoint

\- Send cancellation notification

\- Update appointment status

\- Add cancellation reason field



Closes #42



\# ❌ BAD: Vague commit messages

fixed bug

updated code

changes

3\. Commit Types

Type	Description	Example

feat	New feature	feat(auth): add JWT authentication

fix	Bug fix	fix(login): correct password validation

docs	Documentation	docs(readme): update setup guide

style	Code style	style(login): format CSS

refactor	Code refactoring	refactor(user): optimize queries

test	Adding tests	test(api): add unit tests

chore	Maintenance	chore(deps): update express

🧪 Testing Standards

1\. Test Organization

javascript

// tests/unit/auth.test.js

const { validateEmail, validatePassword } = require('../../utils/validation');



describe('Validation Utilities', () => {

&#x20;   describe('Email Validation', () => {

&#x20;       test('should accept valid email', () => {

&#x20;           expect(validateEmail('test@example.com')).toBe(true);

&#x20;       });



&#x20;       test('should reject invalid email', () => {

&#x20;           expect(validateEmail('invalid-email')).toBe(false);

&#x20;       });

&#x20;   });



&#x20;   describe('Password Validation', () => {

&#x20;       test('should accept strong password', () => {

&#x20;           expect(validatePassword('Test123!')).toBe(true);

&#x20;       });



&#x20;       test('should reject weak password', () => {

&#x20;           expect(validatePassword('123')).toBe(false);

&#x20;       });

&#x20;   });

});

2\. Test Naming

javascript

// ✅ GOOD: Descriptive test names

test('should hash password correctly', () => { ... });

test('should throw error when user not found', () => { ... });



// ❌ BAD: Vague test names

test('test hash', () => { ... });

test('test error', () => { ... });

📚 Documentation Standards

1\. JSDoc Comments

javascript

/\*\*

&#x20;\* Get user by email address

&#x20;\* 

&#x20;\* @async

&#x20;\* @function getUserByEmail

&#x20;\* @param {string} email - User's email address

&#x20;\* @returns {Promise<Object>} User object

&#x20;\* @throws {Error} If user not found

&#x20;\* 

&#x20;\* @example

&#x20;\* const user = await getUserByEmail('john@example.com');

&#x20;\*/

async function getUserByEmail(email) {

&#x20;   const user = await User.findOne({ email });

&#x20;   if (!user) throw new Error('User not found');

&#x20;   return user;

}

2\. Inline Comments

javascript

// ✅ GOOD: Explaining WHY, not WHAT

// Validate age before creating appointment

if (patientAge < 0 || patientAge > 150) {

&#x20;   throw new Error('Invalid age');

}



// ❌ BAD: Stating the obvious

// Set age to 0

let age = 0;

✅ Code Review Checklist

Before Submitting PR

Code follows style guide



Tests added/updated



Documentation updated



No console.log statements



No commented-out code



Error handling implemented



Performance considered



Security reviewed



During Review

Code is readable and clear



Logic is correct



Edge cases handled



Tests are comprehensive



No security vulnerabilities



Performance is acceptable



Last Updated: November 2026

