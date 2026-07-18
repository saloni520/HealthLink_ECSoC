\# 📋 HealthLink - API Error Reference Guide



\## 📋 Overview



This document provides a comprehensive reference for all API error responses returned by the HealthLink API. Understanding these errors helps developers debug issues, implement proper error handling, and build robust integrations.



\---



\## 📑 Table of Contents



\- \[HTTP Status Codes](#http-status-codes)

\- \[Error Response Format](#error-response-format)

\- \[Error Categories](#error-categories)

\- \[Validation Errors](#validation-errors)

\- \[Authentication Errors](#authentication-errors)

\- \[Authorization Errors](#authorization-errors)

\- \[Not Found Errors](#not-found-errors)

\- \[Conflict Errors](#conflict-errors)

\- \[Rate Limiting Errors](#rate-limiting-errors)

\- \[Server Errors](#server-errors)

\- \[Error Codes Reference](#error-codes-reference)



\---



\## 🌐 HTTP Status Codes



\### Success Codes



| Code | Meaning | Description |

|------|---------|-------------|

| `200 OK` | Success | Request succeeded |

| `201 Created` | Created | Resource successfully created |

| `204 No Content` | No Content | Request succeeded, no content to return |

| `302 Found` | Redirect | Temporary redirect (e.g., after login) |



\### Client Error Codes (4xx)



| Code | Meaning | Description |

|------|---------|-------------|

| `400 Bad Request` | Bad Request | Invalid request data or validation failed |

| `401 Unauthorized` | Unauthorized | Authentication required or invalid credentials |

| `403 Forbidden` | Forbidden | Insufficient permissions |

| `404 Not Found` | Not Found | Resource not found |

| `409 Conflict` | Conflict | Resource conflict (e.g., duplicate email) |

| `429 Too Many Requests` | Too Many Requests | Rate limit exceeded |



\### Server Error Codes (5xx)



| Code | Meaning | Description |

|------|---------|-------------|

| `500 Internal Server Error` | Internal Server Error | Unexpected server error |



\---



\## 📝 Error Response Format



\### Standard Error Response



```json

{

&#x20;   "success": false,

&#x20;   "status": 400,

&#x20;   "message": "Validation failed",

&#x20;   "code": "VALIDATION\_ERROR",

&#x20;   "timestamp": "2024-11-24T10:00:00.000Z",

&#x20;   "requestId": "abc123def456",

&#x20;   "path": "/api/auth/signup",

&#x20;   "errors": \[

&#x20;       {

&#x20;           "field": "email",

&#x20;           "message": "Email is required"

&#x20;       }

&#x20;   ]

}



Response Fields

Field	Type	Description

success	Boolean	Always false for errors

status	Number	HTTP status code

message	String	User-friendly error message

code	String	Error code for programmatic handling

timestamp	String	ISO timestamp of error

requestId	String	Unique request ID for debugging

path	String	API endpoint path

errors	Array	Detailed error information (optional)

stack	String	Stack trace (development only)

🚫 Error Categories

Validation Errors (400)

Validation errors occur when request data fails validation rules.



Example: Missing Required Fields

Request:



text

POST /api/auth/signup

Content-Type: application/json



{

&#x20;   "email": "john@example.com"

&#x20;   // Missing name, password, role

}

Response:



json

{

&#x20;   "success": false,

&#x20;   "status": 400,

&#x20;   "message": "Validation failed",

&#x20;   "code": "VALIDATION\_ERROR",

&#x20;   "timestamp": "2024-11-24T10:00:00.000Z",

&#x20;   "requestId": "abc123def456",

&#x20;   "path": "/api/auth/signup",

&#x20;   "errors": \[

&#x20;       {

&#x20;           "field": "name",

&#x20;           "message": "Name is required"

&#x20;       },

&#x20;       {

&#x20;           "field": "password",

&#x20;           "message": "Password is required"

&#x20;       },

&#x20;       {

&#x20;           "field": "role",

&#x20;           "message": "Role is required"

&#x20;       }

&#x20;   ]

}

Example: Invalid Email Format

Request:



text

POST /api/auth/signup

Content-Type: application/json



{

&#x20;   "name": "John Doe",

&#x20;   "email": "invalid-email",

&#x20;   "password": "SecurePass123!",

&#x20;   "role": "patient"

}

Response:



json

{

&#x20;   "success": false,

&#x20;   "status": 400,

&#x20;   "message": "Validation failed",

&#x20;   "code": "VALIDATION\_ERROR",

&#x20;   "timestamp": "2024-11-24T10:00:00.000Z",

&#x20;   "requestId": "abc123def456",

&#x20;   "path": "/api/auth/signup",

&#x20;   "errors": \[

&#x20;       {

&#x20;           "field": "email",

&#x20;           "message": "Please enter a valid email address"

&#x20;       }

&#x20;   ]

}

Example: Invalid Password Length

Request:



text

POST /api/auth/signup

Content-Type: application/json



{

&#x20;   "name": "John Doe",

&#x20;   "email": "john@example.com",

&#x20;   "password": "123",

&#x20;   "role": "patient"

}

Response:



json

{

&#x20;   "success": false,

&#x20;   "status": 400,

&#x20;   "message": "Validation failed",

&#x20;   "code": "VALIDATION\_ERROR",

&#x20;   "timestamp": "2024-11-24T10:00:00.000Z",

&#x20;   "requestId": "abc123def456",

&#x20;   "path": "/api/auth/signup",

&#x20;   "errors": \[

&#x20;       {

&#x20;           "field": "password",

&#x20;           "message": "Password must be at least 6 characters long"

&#x20;       }

&#x20;   ]

}

Common Validation Errors

Field	Error	Message

name	Required	"Name is required"

name	Too short	"Name must be at least 2 characters long"

name	Too long	"Name cannot exceed 100 characters"

email	Required	"Email is required"

email	Invalid format	"Please enter a valid email address"

password	Required	"Password is required"

password	Too short	"Password must be at least 6 characters long"

role	Required	"Role is required"

role	Invalid value	"Role must be either 'doctor' or 'patient'"

patientAge	Required	"Patient age is required"

patientAge	Invalid range	"Please enter a valid age between 0 and 150"

symptoms	Required	"Symptoms description is required"

symptoms	Too short	"Symptoms must be at least 3 characters long"

doctor	Required	"Doctor reference is required"

patient	Required	"Patient reference is required"

Authentication Errors (401)

Authentication errors occur when the user is not authenticated or credentials are invalid.



Example: No Token Provided

Request:



text

GET /api/dashboard

Cookie: (no token)

Response:



json

{

&#x20;   "success": false,

&#x20;   "status": 401,

&#x20;   "message": "Authentication required",

&#x20;   "code": "AUTHENTICATION\_ERROR",

&#x20;   "timestamp": "2024-11-24T10:00:00.000Z",

&#x20;   "requestId": "abc123def456",

&#x20;   "path": "/api/dashboard"

}

Example: Invalid Credentials

Request:



text

POST /api/auth/login

Content-Type: application/json



{

&#x20;   "email": "john@example.com",

&#x20;   "password": "wrongpassword"

}

Response:



json

{

&#x20;   "success": false,

&#x20;   "status": 401,

&#x20;   "message": "Incorrect password. Try again.",

&#x20;   "code": "AUTHENTICATION\_ERROR",

&#x20;   "timestamp": "2024-11-24T10:00:00.000Z",

&#x20;   "requestId": "abc123def456",

&#x20;   "path": "/api/auth/login"

}

Example: Expired Token

Request:



text

GET /api/dashboard

Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (expired)

Response:



json

{

&#x20;   "success": false,

&#x20;   "status": 401,

&#x20;   "message": "Token expired. Please login again.",

&#x20;   "code": "TOKEN\_EXPIRED",

&#x20;   "timestamp": "2024-11-24T10:00:00.000Z",

&#x20;   "requestId": "abc123def456",

&#x20;   "path": "/api/dashboard"

}

Example: Invalid Token

Request:



text

GET /api/dashboard

Cookie: token=invalid-token

Response:



json

{

&#x20;   "success": false,

&#x20;   "status": 401,

&#x20;   "message": "Invalid token. Please login again.",

&#x20;   "code": "AUTHENTICATION\_ERROR",

&#x20;   "timestamp": "2024-11-24T10:00:00.000Z",

&#x20;   "requestId": "abc123def456",

&#x20;   "path": "/api/dashboard"

}

Common Authentication Errors

Scenario	Code	Message

No token provided	AUTHENTICATION\_ERROR	"Authentication required"

User not found	AUTHENTICATION\_ERROR	"User not found"

Invalid password	AUTHENTICATION\_ERROR	"Incorrect password. Try again."

Expired token	TOKEN\_EXPIRED	"Token expired. Please login again."

Invalid token	AUTHENTICATION\_ERROR	"Invalid token. Please login again."

Authorization Errors (403)

Authorization errors occur when the user lacks permission for a resource.



Example: Patient Accessing Doctor Dashboard

Request:



text

GET /api/doctor-dashboard

Cookie: token=valid-token (patient role)

Response:



json

{

&#x20;   "success": false,

&#x20;   "status": 403,

&#x20;   "message": "You do not have permission to perform this action",

&#x20;   "code": "AUTHORIZATION\_ERROR",

&#x20;   "timestamp": "2024-11-24T10:00:00.000Z",

&#x20;   "requestId": "abc123def456",

&#x20;   "path": "/api/doctor-dashboard"

}

Example: Non-Patient Booking Appointment

Request:



text

POST /api/appointment/doctor-123

Cookie: token=valid-token (doctor role)

Response:



json

{

&#x20;   "success": false,

&#x20;   "status": 403,

&#x20;   "message": "Only patients can book appointments",

&#x20;   "code": "AUTHORIZATION\_ERROR",

&#x20;   "timestamp": "2024-11-24T10:00:00.000Z",

&#x20;   "requestId": "abc123def456",

&#x20;   "path": "/api/appointment/doctor-123"

}

Common Authorization Errors

Scenario	Code	Message

Wrong role	AUTHORIZATION\_ERROR	"You do not have permission to perform this action"

Patient booking	AUTHORIZATION\_ERROR	"Only patients can book appointments"

Doctor viewing	AUTHORIZATION\_ERROR	"Access denied. Doctor only."

Not Found Errors (404)

Not found errors occur when a requested resource does not exist.



Example: User Not Found

Request:



text

POST /api/auth/login

Content-Type: application/json



{

&#x20;   "email": "nonexistent@example.com",

&#x20;   "password": "password123"

}

Response:



json

{

&#x20;   "success": false,

&#x20;   "status": 404,

&#x20;   "message": "No account found. Please sign up first.",

&#x20;   "code": "NOT\_FOUND\_ERROR",

&#x20;   "timestamp": "2024-11-24T10:00:00.000Z",

&#x20;   "requestId": "abc123def456",

&#x20;   "path": "/api/auth/login"

}

Example: Doctor Not Found

Request:



text

POST /api/appointment/invalid-doctor-id

Cookie: token=valid-token (patient role)

Response:



json

{

&#x20;   "success": false,

&#x20;   "status": 404,

&#x20;   "message": "Doctor not found",

&#x20;   "code": "NOT\_FOUND\_ERROR",

&#x20;   "timestamp": "2024-11-24T10:00:00.000Z",

&#x20;   "requestId": "abc123def456",

&#x20;   "path": "/api/appointment/invalid-doctor-id"

}

Common Not Found Errors

Scenario	Code	Message

Route not found	NOT\_FOUND\_ERROR	"Route GET /api/unknown not found"

User not found	NOT\_FOUND\_ERROR	"No account found. Please sign up first."

Doctor not found	NOT\_FOUND\_ERROR	"Doctor not found"

Resource not found	NOT\_FOUND\_ERROR	"Resource not found"

Conflict Errors (409)

Conflict errors occur when the request conflicts with the current state of the server.



Example: Duplicate Email

Request:



text

POST /api/auth/signup

Content-Type: application/json



{

&#x20;   "name": "John Doe",

&#x20;   "email": "existing@example.com",

&#x20;   "password": "SecurePass123!",

&#x20;   "role": "patient"

}

Response:



json

{

&#x20;   "success": false,

&#x20;   "status": 409,

&#x20;   "message": "User already exists. Please login.",

&#x20;   "code": "CONFLICT\_ERROR",

&#x20;   "timestamp": "2024-11-24T10:00:00.000Z",

&#x20;   "requestId": "abc123def456",

&#x20;   "path": "/api/auth/signup"

}

Common Conflict Errors

Scenario	Code	Message

Duplicate email	CONFLICT\_ERROR	"User already exists. Please login."

Duplicate entry	DUPLICATE\_ERROR	"Duplicate entry found"

Rate Limiting Errors (429)

Rate limiting errors occur when too many requests are made in a short time.



Example: Rate Limit Exceeded

Request:



text

POST /api/chat

Content-Type: application/json

(10th request in 1 minute)

Response:



json

{

&#x20;   "success": false,

&#x20;   "status": 429,

&#x20;   "message": "Rate limit exceeded. Please try again later.",

&#x20;   "code": "RATE\_LIMIT\_ERROR",

&#x20;   "timestamp": "2024-11-24T10:00:00.000Z",

&#x20;   "requestId": "abc123def456",

&#x20;   "path": "/api/chat"

}

Common Rate Limiting Scenarios

Endpoint	Limit	Window

/api/auth/login	10 requests	15 minutes

/api/chat	10 requests	1 minute

/api/analyze-health	20 requests	5 minutes

General API	100 requests	15 minutes

Server Errors (500)

Server errors occur when something goes wrong on the server.



Example: Database Error

Response:



json

{

&#x20;   "success": false,

&#x20;   "status": 500,

&#x20;   "message": "Internal server error",

&#x20;   "code": "INTERNAL\_ERROR",

&#x20;   "timestamp": "2024-11-24T10:00:00.000Z",

&#x20;   "requestId": "abc123def456",

&#x20;   "path": "/api/dashboard"

}

Example: External Service Error

Response:



json

{

&#x20;   "success": false,

&#x20;   "status": 500,

&#x20;   "message": "AI service temporarily unavailable",

&#x20;   "code": "EXTERNAL\_SERVICE\_ERROR",

&#x20;   "timestamp": "2024-11-24T10:00:00.000Z",

&#x20;   "requestId": "abc123def456",

&#x20;   "path": "/api/analyze-health"

}

Common Server Errors

Scenario	Code	Message

General error	INTERNAL\_ERROR	"Internal server error"

Database error	DATABASE\_ERROR	"Database operation failed"

External service	EXTERNAL\_SERVICE\_ERROR	"External service temporarily unavailable"

Unhandled error	INTERNAL\_ERROR	"Internal server error"

📊 Error Codes Reference

Complete Error Code List

Code	HTTP Status	Description	When Used

VALIDATION\_ERROR	400	Validation failed	Invalid request data

AUTHENTICATION\_ERROR	401	Authentication failed	Invalid credentials, no token

TOKEN\_EXPIRED	401	Token expired	Expired JWT token

INVALID\_TOKEN	401	Invalid token	Malformed or tampered token

AUTHORIZATION\_ERROR	403	Permission denied	Insufficient permissions

NOT\_FOUND\_ERROR	404	Resource not found	Resource doesn't exist

CONFLICT\_ERROR	409	Resource conflict	Duplicate or conflicting state

DUPLICATE\_ERROR	409	Duplicate entry	Duplicate key violation

RATE\_LIMIT\_ERROR	429	Rate limit exceeded	Too many requests

INTERNAL\_ERROR	500	Internal server error	Unhandled server error

DATABASE\_ERROR	500	Database error	Database operation failed

EXTERNAL\_SERVICE\_ERROR	500	External service error	Third-party API failure

🛠️ Debugging Tips

Using Request ID

Every error response includes a requestId field. Use this ID to trace logs and debug issues.



Common Error Scenarios

Error Code	Common Cause	Solution

VALIDATION\_ERROR	Missing/invalid fields	Check request body

AUTHENTICATION\_ERROR	No token or invalid token	Login again

TOKEN\_EXPIRED	Token expired	Login again

AUTHORIZATION\_ERROR	Wrong role	Use correct account type

NOT\_FOUND\_ERROR	Resource doesn't exist	Check ID or URL

CONFLICT\_ERROR	Duplicate entry	Use different email

RATE\_LIMIT\_ERROR	Too many requests	Wait and retry

INTERNAL\_ERROR	Server issue	Contact support

📚 Resources

Related Documentation

API Documentation



Configuration Guide



Testing Guide



HTTP Status Codes

MDN HTTP Status Codes



HTTP Status Codes Reference



Last Updated: July 2026





