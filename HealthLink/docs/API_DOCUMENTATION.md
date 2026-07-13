&#x20;# 📚 HealthLink API Documentation



\## Authentication Routes (`authRoutes.js`)



\### Overview

The Authentication module handles user registration and login functionality. It provides secure endpoints for creating new accounts and authenticating existing users using JWT (JSON Web Token) for session management.



\---



\## 🔐 Authentication Endpoints



\### 1. User Registration (Sign Up)

Creates a new user account in the system with role-based access (patient or doctor).



\#### Endpoint Details

| Property | Value |

|----------|-------|

| \*\*URL\*\* | `/api/auth/signup` |

| \*\*Method\*\* | `POST` |

| \*\*Authentication\*\* | Not Required |

| \*\*Content-Type\*\* | `application/json` or `application/x-www-form-urlencoded` |



\#### Request Parameters

| Parameter | Type | Required | Description | Valid Values |

|-----------|------|----------|-------------|--------------|

| `name` | String | ✅ Yes | Full name of the user | Any string, max 100 characters |

| `email` | String | ✅ Yes | Valid email address | Must be a valid email format |

| `password` | String | ✅ Yes | User password | Minimum 6 characters |

| `role` | String | ✅ Yes | User role in the system | `"patient"` or `"doctor"` |



\#### Request Examples



\*\*HTML Form Example:\*\*

```html

<form method="POST" action="/api/auth/signup">

&#x20;   <input type="text" name="name" placeholder="Full Name" required>

&#x20;   <input type="email" name="email" placeholder="Email Address" required>

&#x20;   <input type="password" name="password" placeholder="Password" required>

&#x20;   <select name="role" required>

&#x20;       <option value="patient">Patient</option>

&#x20;       <option value="doctor">Doctor</option>

&#x20;   </select>

&#x20;   <button type="submit">Sign Up</button>

</form>

```



\*\*JSON Request Example:\*\*

```json

{

&#x20;   "name": "John Doe",

&#x20;   "email": "john.doe@example.com",

&#x20;   "password": "SecurePass123",

&#x20;   "role": "patient"

}

```



\*\*cURL Request Example:\*\*

```bash

curl -X POST http://localhost:5000/api/auth/signup \\

&#x20; -H "Content-Type: application/json" \\

&#x20; -d '{

&#x20;   "name": "John Doe",

&#x20;   "email": "john.doe@example.com",

&#x20;   "password": "SecurePass123",

&#x20;   "role": "patient"

&#x20; }'

```



\#### Response Examples



\*\*✅ Success Response:\*\*

```

Status: 302 (Redirect)

Location: /login

Message: Redirects to login page

```



\*\*❌ Error Response (User Already Exists):\*\*

```

Status: 200 (OK)

Body: "User already exists. Please login."

```



\*\*❌ Error Response (Server Error):\*\*

```

Status: 500 (Internal Server Error)

Body: "Error signing up. Try again."

```



\#### Flow Diagram

```

1\. User submits registration form

2\. System checks if email already exists

&#x20;  ├── If exists → Returns error message

&#x20;  └── If not exists → Continues

3\. Password is hashed using bcrypt (10 rounds)

4\. New user document is created in MongoDB

5\. User is redirected to login page

```



\---



\### 2. User Authentication (Login)

Authenticates existing users and generates a JWT token for session management.



\#### Endpoint Details

| Property | Value |

|----------|-------|

| \*\*URL\*\* | `/api/auth/login` |

| \*\*Method\*\* | `POST` |

| \*\*Authentication\*\* | Not Required |

| \*\*Content-Type\*\* | `application/json` or `application/x-www-form-urlencoded` |



\#### Request Parameters

| Parameter | Type | Required | Description |

|-----------|------|----------|-------------|

| `email` | String | ✅ Yes | Registered email address |

| `password` | String | ✅ Yes | Account password |



\#### Request Examples



\*\*HTML Form Example:\*\*

```html

<form method="POST" action="/api/auth/login">

&#x20;   <input type="email" name="email" placeholder="Email Address" required>

&#x20;   <input type="password" name="password" placeholder="Password" required>

&#x20;   <button type="submit">Login</button>

</form>

```



\*\*JSON Request Example:\*\*

```json

{

&#x20;   "email": "john.doe@example.com",

&#x20;   "password": "SecurePass123"

}

```



\*\*cURL Request Example:\*\*

```bash

curl -X POST http://localhost:5000/api/auth/login \\

&#x20; -H "Content-Type: application/json" \\

&#x20; -d '{

&#x20;   "email": "john.doe@example.com",

&#x20;   "password": "SecurePass123"

&#x20; }'

```



\#### Response Examples



\*\*✅ Success Response:\*\*

```

Status: 200 (OK)

Message: "Login successful! Welcome, patient"

Cookies: 

&#x20; - token: \[JWT Token]

Notes: JWT token is set as a cookie for authentication

```



\*\*❌ Error Response (User Not Found):\*\*

```

Status: 200 (OK)

Body: "No account found. Please sign up first."

```



\*\*❌ Error Response (Incorrect Password):\*\*

```

Status: 200 (OK)

Body: "Incorrect password. Try again."

```



\*\*❌ Error Response (Server Error):\*\*

```

Status: 500 (Internal Server Error)

Body: "Error logging in. Try again."

```



\#### JWT Token Details

| Property | Value |

|----------|-------|

| \*\*Algorithm\*\* | HS256 |

| \*\*Secret\*\* | `your\_secret\_key` (configure in environment) |

| \*\*Expiration\*\* | 1 hour |

| \*\*Payload\*\* | `{ id: user.\_id, role: user.role }` |



\#### Flow Diagram

```

1\. User submits login credentials

2\. System searches for user by email

&#x20;  ├── If not found → Returns error

&#x20;  └── If found → Continues

3\. Compares provided password with hashed password

&#x20;  ├── If mismatch → Returns error

&#x20;  └── If match → Continues

4\. Generates JWT token with user ID and role

5\. Sets JWT as HTTP-only cookie

6\. Returns success message to user

```



\---



\## 🛡️ Dashboard Routes (`dashboard.js`)



\### Overview

The Dashboard module provides protected routes for patients and doctors to access their respective dashboards. All routes are protected by authentication middleware.



\### Authentication Middleware (`requireAuth`)



\#### Purpose

Validates JWT tokens for protected routes and ensures users are authenticated.



\#### Middleware Flow

```

1\. Extract token from cookies

2\. If no token → Redirect to /login

3\. Verify JWT token using secret key

&#x20;  ├── If invalid → Redirect to /login

&#x20;  └── If valid → Continues

4\. Fetch user from database by ID

5\. Attach user object to request

6\. Proceed to next middleware/route

```



\---



\### 1. Patient Dashboard

Provides patients with access to their personalized dashboard.



\#### Endpoint Details

| Property | Value |

|----------|-------|

| \*\*URL\*\* | `/dashboard/patient-dashboard` |

| \*\*Method\*\* | `GET` |

| \*\*Authentication\*\* | ✅ Required (JWT Token) |

| \*\*Access\*\* | Patients Only |



\#### Request Headers

| Header | Required | Description |

|--------|----------|-------------|

| `Cookie` | ✅ Yes | Must contain valid JWT token |



\#### Request Example

```bash

curl -X GET http://localhost:5000/dashboard/patient-dashboard \\

&#x20; --cookie "token=your\_jwt\_token"

```



\#### Response Examples



\*\*✅ Success Response:\*\*

```

Status: 200 (OK)

Renders: patientDashboard.ejs view

Data: { user: req.user }

Description: Renders the patient dashboard with user data

```



\*\*❌ Error Response (No Token):\*\*

```

Status: 302 (Redirect)

Location: /login

```



\*\*❌ Error Response (Invalid Token):\*\*

```

Status: 302 (Redirect)

Location: /login

```



\*\*❌ Error Response (Wrong Role):\*\*

```

Status: 302 (Redirect)

Location: /login

Message: Redirects to login if user role is not 'patient'

```



\---



\### 2. Doctor Dashboard

Provides doctors with access to their professional dashboard.



\#### Endpoint Details

| Property | Value |

|----------|-------|

| \*\*URL\*\* | `/dashboard/doctor-dashboard` |

| \*\*Method\*\* | `GET` |

| \*\*Authentication\*\* | ✅ Required (JWT Token) |

| \*\*Access\*\* | Doctors Only |



\#### Request Headers

| Header | Required | Description |

|--------|----------|-------------|

| `Cookie` | ✅ Yes | Must contain valid JWT token |



\#### Request Example

```bash

curl -X GET http://localhost:5000/dashboard/doctor-dashboard \\

&#x20; --cookie "token=your\_jwt\_token"

```



\#### Response Examples



\*\*✅ Success Response:\*\*

```

Status: 200 (OK)

Renders: doctorDashboard.ejs view

Data: { user: req.user }

Description: Renders the doctor dashboard with user data

```



\*\*❌ Error Response (No Token):\*\*

```

Status: 302 (Redirect)

Location: /login

```



\*\*❌ Error Response (Invalid Token):\*\*

```

Status: 302 (Redirect)

Location: /login

```



\*\*❌ Error Response (Wrong Role):\*\*

```

Status: 302 (Redirect)

Location: /login

Message: Redirects to login if user role is not 'doctor'

```



\---



\## 📊 Data Models



\### User Model

```javascript

{

&#x20;   name: String,                 // User's full name

&#x20;   email: String,                // Unique email address

&#x20;   password: String,             // Hashed password (bcrypt)

&#x20;   role: String,                 // "doctor" or "patient"

&#x20;   specialization: String,       // Doctor's specialty (doctor only)

&#x20;   experience: String,           // Years of experience (doctor only)

&#x20;   bio: String,                  // Professional bio (doctor only)

&#x20;   appointments: \[ObjectId]      // References to Appointment documents

}

```



\### Appointment Model

```javascript

{

&#x20;   patientName: String,          // Patient's full name

&#x20;   patientAge: Number,           // Patient's age

&#x20;   symptoms: String,             // Description of symptoms

&#x20;   doctor: ObjectId,             // Reference to doctor User

&#x20;   patient: ObjectId,            // Reference to patient User

&#x20;   date: Date,                   // Appointment date and time

&#x20;   status: String                // "Pending", "Confirmed", "Completed", "Cancelled"

}

```



\---



\## 🔒 Security Considerations



\### Password Protection

\- Passwords are hashed using bcrypt with 10 salt rounds

\- Never store plain-text passwords

\- Hash comparison is used for authentication



\### JWT Security

\- Tokens are stored in HTTP-only cookies (not accessible via JavaScript)

\- Tokens expire after 1 hour

\- Secret key should be stored in environment variables



\### Input Validation

\- Email format validation is recommended

\- Role validation ensures only valid roles ("patient", "doctor") are accepted

\- Password length requirements should be enforced



\---



\## 🔧 Environment Configuration



Create a `.env` file with the following variables:



```env

PORT=5000

JWT\_SECRET=your\_secure\_jwt\_secret\_key

MONGODB\_URI=your\_mongodb\_connection\_string

```



\---



\## 📦 Dependencies



| Package | Version | Purpose |

|---------|---------|---------|

| `express` | ^4.18.2 | Web framework |

| `bcryptjs` | ^2.4.3 | Password hashing |

| `jsonwebtoken` | ^9.0.0 | JWT generation and verification |

| `mongoose` | ^7.0.0 | MongoDB ODM |



\---



\## 🧪 Testing Examples



\### Unit Test Example for Signup

```javascript

const request = require('supertest');

const app = require('../server');



describe('Auth Endpoints', () => {

&#x20;   test('Should register new user', async () => {

&#x20;       const res = await request(app)

&#x20;           .post('/api/auth/signup')

&#x20;           .send({

&#x20;               name: 'Test User',

&#x20;               email: 'test@example.com',

&#x20;               password: 'TestPass123',

&#x20;               role: 'patient'

&#x20;           });

&#x20;       expect(res.statusCode).toBe(302);

&#x20;       expect(res.header.location).toBe('/login');

&#x20;   });

});

```



\### Test User Login

```javascript

describe('Login Endpoint', () => {

&#x20;   test('Should login existing user', async () => {

&#x20;       const res = await request(app)

&#x20;           .post('/api/auth/login')

&#x20;           .send({

&#x20;               email: 'test@example.com',

&#x20;               password: 'TestPass123'

&#x20;           });

&#x20;       expect(res.statusCode).toBe(200);

&#x20;       expect(res.text).toContain('Login successful');

&#x20;   });

});

```



\---



\## 🐛 Common Errors and Solutions



| Error Code | Error Message | Solution |

|------------|--------------|----------|

| 500 | Error signing up | Check database connection, validate input data |

| 500 | Error logging in | Verify MongoDB connectivity, check JWT secret |

| 302 | Redirect to /login | User not authenticated or invalid token |

| N/A | User already exists | User should use login instead |



\---



\## 🚀 Future Enhancements



\- \[ ] Implement refresh tokens for extended sessions

\- \[ ] Add email verification on signup

\- \[ ] Implement password reset functionality

\- \[ ] Add rate limiting to prevent brute force attacks

\- \[ ] Integrate with OAuth providers (Google, Facebook)

\- \[ ] Add two-factor authentication (2FA)

\- \[ ] Implement role-based access control (RBAC) middleware



\---



\## 📞 Support



For API-related issues, please:

1\. Check the error logs

2\. Verify your environment variables

3\. Ensure MongoDB is running

4\. Contact the development team with detailed error messages



\---



\*Documentation Version 1.0 | Last Updated: 2026\*

