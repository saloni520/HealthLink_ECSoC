\# 🧪 HealthLink - Manual Testing Guide



\## 📋 Overview



This guide provides comprehensive instructions for manually testing the HealthLink application before submitting a pull request. Following these testing procedures ensures consistent quality and helps identify issues early in the development cycle.



\---



\## 📑 Table of Contents



\- \[Getting Started](#getting-started)

\- \[Authentication Testing](#authentication-testing)

\- \[CRUD Operations Testing](#crud-operations-testing)

\- \[Form Validation Testing](#form-validation-testing)

\- \[Dashboard Testing](#dashboard-testing)

\- \[AI Features Testing](#ai-features-testing)

\- \[Browser Compatibility](#browser-compatibility)

\- \[Mobile Responsiveness](#mobile-responsiveness)

\- \[Manual Testing Checklist](#manual-testing-checklist)

\- \[Bug Reporting](#bug-reporting)



\---



\## 🚀 Getting Started



\### Test Environment Setup



```bash

\# 1. Clone the repository

git clone https://github.com/pranav-gujar/HealthLink.git

cd HealthLink



\# 2. Install dependencies

npm install



\# 3. Configure environment

cp .env.example .env

\# Add test credentials to .env



\# 4. Start development server

npm run dev



\# 5. Access the application

\# Open browser: http://localhost:5000





Test Data Preparation

Before testing, create these test accounts:



Role	Email	Password	Purpose

Patient	patient@test.com	Test@123	Testing patient features

Doctor	doctor@test.com	Test@123	Testing doctor features

Invalid User	invalid@test.com	wrongpass	Testing login failures

🔐 Authentication Testing

1\. Signup Testing

Test Case: Successful Registration

Steps:



Navigate to /signup



Fill in registration form:



Name: John Doe



Email: john.doe@test.com



Password: SecurePass123!



Role: Patient



Click "Sign Up"



Expected Result:



✅ Redirected to /login



✅ User created in database



✅ No error messages



Verification:



javascript

// Check database

const user = await User.findOne({ email: 'john.doe@test.com' });

console.log(user); // Should show user document

Test Case: Duplicate Email Registration

Steps:



Navigate to /signup



Fill in registration form with existing email



Click "Sign Up"



Expected Result:



❌ Error message: "User already exists. Please login."



✅ Stay on signup page



✅ Form data preserved



Test Case: Missing Required Fields

Steps:



Navigate to /signup



Leave required fields empty



Click "Sign Up"



Expected Result:



❌ Validation error messages



✅ Focus on first empty field



✅ Form not submitted



2\. Login Testing

Test Case: Successful Login

Steps:



Navigate to /login



Enter valid credentials



Click "Login"



Expected Result:



✅ Redirected to /dashboard



✅ JWT token set in cookies



✅ Welcome message displayed



Verification:



javascript

// Check cookie

document.cookie; // Should contain token

Test Case: Invalid Credentials

Steps:



Navigate to /login



Enter invalid email or password



Click "Login"



Expected Result:



❌ Error message displayed



✅ Stay on login page



✅ No token set



Test Case: Missing Credentials

Steps:



Navigate to /login



Leave fields empty



Click "Login"



Expected Result:



❌ Validation error message



✅ Form not submitted



3\. Logout Testing

Steps:



Login successfully



Click "Logout" button



Expected Result:



✅ Redirected to /login



✅ Token removed from cookies



✅ Cannot access protected routes



📋 CRUD Operations Testing

1\. Appointment Booking (Patient)

Test Case: Create Appointment

Steps:



Login as patient



Navigate to /doctors



Select a doctor



Click "Book Appointment"



Fill in appointment form:



Patient Name: John Doe



Patient Age: 30



Symptoms: Headache and fever



Click "Book"



Expected Result:



✅ Redirected to dashboard



✅ Appointment appears in list



✅ Status: "Pending"



Verification:



javascript

// Check appointment in database

const appointment = await Appointment.findOne({ 

&#x20;   patientName: 'John Doe' 

});

console.log(appointment); // Should show appointment

Test Case: Missing Required Fields

Steps:



Navigate to booking form



Leave required fields empty



Submit form



Expected Result:



❌ Validation error messages



✅ Form not submitted



✅ Error messages specific to each field



Test Case: Invalid Age

Steps:



Navigate to booking form



Enter invalid age (e.g., 200)



Submit form



Expected Result:



❌ Error message: "Please enter a valid age"



✅ Form not submitted



2\. View Appointments (Doctor)

Test Case: View Appointments

Steps:



Login as doctor



Navigate to /view-appointments



Expected Result:



✅ List of all appointments



✅ Patient details displayed



✅ Status indicators visible



Test Case: Empty Appointments

Steps:



Login as doctor with no appointments



Navigate to /view-appointments



Expected Result:



✅ Message: "No appointments found"



✅ Clean interface



📝 Form Validation Testing

1\. Signup Form Validation

Field	Test Case	Expected Result

Name	Empty	"Name is required"

Name	Single character	"Name must be at least 2 characters"

Email	Invalid format	"Please enter a valid email"

Email	Empty	"Email is required"

Password	Empty	"Password is required"

Password	Less than 6 chars	"Password must be at least 6 characters"

Role	Not selected	"Please select a role"

2\. Login Form Validation

Field	Test Case	Expected Result

Email	Empty	"Email is required"

Email	Invalid format	"Please enter a valid email"

Password	Empty	"Password is required"

3\. Appointment Form Validation

Field	Test Case	Expected Result

Patient Name	Empty	"Patient name is required"

Patient Name	Too short	"Name must be at least 2 characters"

Patient Age	Empty	"Age is required"

Patient Age	Negative	"Please enter a valid age"

Patient Age	> 150	"Please enter a valid age"

Symptoms	Empty	"Symptoms are required"

Symptoms	Too short	"Symptoms must be at least 3 characters"

📊 Dashboard Testing

1\. Patient Dashboard

Steps:



Login as patient



Navigate to /dashboard



Expected Results:



✅ Welcome message with user name



✅ Role badge displayed



✅ Appointment list visible



✅ "Schedule Appointment" button



✅ Quick actions menu



2\. Doctor Dashboard

Steps:



Login as doctor



Navigate to /dashboard



Expected Results:



✅ Welcome message with user name



✅ Role badge displayed



✅ "View Appointments" button



✅ Quick stats (if implemented)



✅ Patient management options



3\. Navigation Testing

Steps:



Login to dashboard



Test all navigation links:



Home



HealthLink AI



Our Team



Dashboard



Contact Us



Expected Results:



✅ All links work



✅ Correct pages load



✅ Active link highlighted



🤖 AI Features Testing

1\. Chatbot Testing

Test Case: Open Chatbot

Steps:



Navigate to any page



Click "Chat with AI" button



Expected Results:



✅ Chat window opens



✅ Welcome message displayed



✅ Input field available



Test Case: Send Message

Steps:



Open chat window



Type "Hello"



Click Send or press Enter



Expected Results:



✅ Message appears in chat



✅ AI response displayed



✅ Typing indicator shows



Test Case: Test Responses

Message	Expected Response Type

"Hello"	Greeting response

"I have a fever"	Medical advice

"What is HealthLink?"	Project information

"How to stay healthy?"	Health tips

"Bye"	Farewell response

2\. Health Analysis Testing

Steps:



Navigate to HealthLink AI



Enter health query



Submit for analysis



Expected Results:



✅ AI response received



✅ Appropriate health information



✅ No medical diagnosis provided



🌐 Browser Compatibility

Test Browsers

Browser	Version	Test Status

Google Chrome	Latest	✅ Must Pass

Mozilla Firefox	Latest	✅ Must Pass

Microsoft Edge	Latest	✅ Should Pass

Safari	Latest	✅ Should Pass

Cross-Browser Testing Checklist

Feature	Chrome	Firefox	Edge	Safari

Login Page	✅	✅	✅	✅

Signup Page	✅	✅	✅	✅

Dashboard	✅	✅	✅	✅

Chatbot	✅	✅	✅	✅

Forms	✅	✅	✅	✅

Navigation	✅	✅	✅	✅

📱 Mobile Responsiveness

Test Devices

Device	Screen Size	Test Status

iPhone 12/13	390x844	✅ Must Pass

Samsung Galaxy	360x800	✅ Must Pass

iPad	768x1024	✅ Should Pass

Desktop	1920x1080	✅ Must Pass

Mobile Testing Checklist

Feature	Mobile	Tablet	Desktop

Navigation Menu	Hamburger	Collapsible	Full

Chatbot	Bottom fixed	Bottom fixed	Right fixed

Forms	Full width	Centered	Centered

Dashboard	Stacked	Grid	Grid

Buttons	Touch friendly	Touch friendly	Clickable

✅ Manual Testing Checklist

Pre-PR Testing Checklist

Authentication

Signup works with valid data



Signup fails with invalid data



Login works with valid credentials



Login fails with invalid credentials



Logout works correctly



Protected routes require login



Role-based access works



CRUD Operations

Create appointment works



View appointments works



Appointment status updates work



Delete/cancel appointment works



Forms

All required fields validated



Email validation works



Password validation works



Age validation works



Error messages clear and helpful



Dashboard

Patient dashboard renders correctly



Doctor dashboard renders correctly



Navigation works



Data displays correctly



Actions work as expected



AI Features

Chatbot opens/closes



Chatbot sends/receives messages



Health analysis works



Appropriate responses received



UI/UX

All pages render without errors



No broken links



No console errors



No 404 errors



Layout consistent



Browser Compatibility

Chrome works



Firefox works



Edge works



Safari works



Mobile Responsiveness

Mobile layout works



Tablet layout works



Desktop layout works



Touch interactions work



No horizontal scroll



Feature-Specific Checklist

Patient Features

Can view doctors list



Can book appointments



Can view own appointments



Can cancel appointments



Can update profile (if available)



Doctor Features

Can view appointments



Can accept appointments



Can reject appointments



Can view patient details



Can update availability (if available)



🐛 Bug Reporting

Bug Report Template

markdown

\*\*Bug Title:\*\* \[Brief description]



\*\*Steps to Reproduce:\*\*

1\. Go to '...'

2\. Click on '....'

3\. Scroll down to '....'

4\. See error



\*\*Expected Behavior:\*\*

What should happen



\*\*Actual Behavior:\*\*

What actually happens



\*\*Screenshots:\*\*

\[Add screenshots if applicable]



\*\*Environment:\*\*

\- OS: \[e.g., Windows 10]

\- Browser: \[e.g., Chrome 120]

\- Device: \[e.g., Desktop, iPhone 12]

\- Screen Size: \[e.g., 1920x1080]



\*\*Additional Context:\*\*

Any other information

Bug Severity Levels

Severity	Description	Example

Critical	Feature broken, no workaround	Cannot login

Major	Feature broken, has workaround	Appointment booking fails

Minor	UI issue, no functionality impact	Button misaligned

Trivial	Cosmetic issue	Typo in text

📊 Test Report Template

markdown

\# Test Report - HealthLink



\## Test Summary

\- \*\*Date:\*\* \[Date]

\- \*\*Tester:\*\* \[Name]

\- \*\*Environment:\*\* \[Local/Staging/Production]



\## Test Results



| Feature | Status | Notes |

|---------|--------|-------|

| Authentication | ✅ Pass | - |

| CRUD Operations | ✅ Pass | - |

| Forms | ✅ Pass | - |

| Dashboard | ✅ Pass | - |

| AI Features | ✅ Pass | - |

| Browser Compatibility | ✅ Pass | - |

| Mobile Responsiveness | ✅ Pass | - |



\## Issues Found



\### Critical Issues

\- None



\### Major Issues

\- None



\### Minor Issues

\- None



\## Recommendations

\- None



\## Sign-off

\- \[ ] Approved by QA

\- \[ ] Approved by Product Owner

📚 Additional Resources

Testing Tools

Browser DevTools (F12)



Postman - API Testing



MongoDB Compass - Database inspection



Chrome Lighthouse - Performance testing



Links

Project Repository



Bug Tracking



Last Updated: July 2026





