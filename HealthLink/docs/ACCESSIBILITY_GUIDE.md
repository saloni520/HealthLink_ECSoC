\# ♿ HealthLink - Accessibility Guide for Contributors



\## 📋 Overview



This guide documents accessibility best practices for the HealthLink project. Following these guidelines ensures that our application is usable by everyone, including people with disabilities. Accessibility is not just a requirement—it's a fundamental part of creating inclusive healthcare technology.



\---



\## 📑 Table of Contents



\- \[Why Accessibility Matters](#why-accessibility-matters)

\- \[Accessibility Principles](#accessibility-principles)

\- \[Semantic HTML](#semantic-html)

\- \[Form Accessibility](#form-accessibility)

\- \[Color Contrast \& Visual Design](#color-contrast--visual-design)

\- \[Keyboard Navigation](#keyboard-navigation)

\- \[ARIA Guidelines](#aria-guidelines)

\- \[Testing for Accessibility](#testing-for-accessibility)

\- \[Common Issues \& Fixes](#common-issues--fixes)

\- \[Resources](#resources)



\---



\## 🌟 Why Accessibility Matters



\### The Impact



| Statistic | Impact |

|-----------|--------|

| \*\*1 billion+\*\* | People worldwide live with some form of disability |

| \*\*15%\*\* | Of the global population has a disability |

| \*\*70%\*\* | Of disabilities are invisible (e.g., cognitive, hearing) |

| \*\*$6 trillion\*\* | Annual spending power of people with disabilities |



\### Legal \& Ethical Considerations



\- \*\*WCAG 2.1\*\*: Web Content Accessibility Guidelines (global standard)

\- \*\*Section 508\*\*: US government accessibility requirement

\- \*\*EAA\*\*: European Accessibility Act

\- \*\*ADA\*\*: Americans with Disabilities Act



\### Healthcare-Specific Importance



\- Patients with disabilities need equal access to healthcare tools

\- Health information must be accessible to all users

\- Medical applications have ethical obligations to include all users



\---



\## 📐 Accessibility Principles (POUR)



\### 1. Perceivable

Users must be able to perceive the content in some way.



| Principle | Implementation |

|-----------|----------------|

| \*\*Text Alternatives\*\* | Provide alt text for images |

| \*\*Captions\*\* | Provide captions for audio/video |

| \*\*Adaptable\*\* | Content can be presented in different ways |

| \*\*Distinguishable\*\* | Make it easy to see and hear content |



\### 2. Operable

Users must be able to operate the interface.



| Principle | Implementation |

|-----------|----------------|

| \*\*Keyboard Accessible\*\* | All functionality available via keyboard |

| \*\*Enough Time\*\* | Users have enough time to read and use content |

| \*\*Seizures\*\* | No flashing content |

| \*\*Navigable\*\* | Help users navigate and find content |



\### 3. Understandable

Users must be able to understand the content and interface.



| Principle | Implementation |

|-----------|----------------|

| \*\*Readable\*\* | Text is readable and understandable |

| \*\*Predictable\*\* | Interface behaves in consistent ways |

| \*\*Input Assistance\*\* | Help users avoid and correct mistakes |



\### 4. Robust

Content must be robust enough to work with assistive technologies.



| Principle | Implementation |

|-----------|----------------|

| \*\*Compatible\*\* | Compatible with current and future assistive technologies |

| \*\*Valid HTML\*\* | Use valid, well-formed HTML |

| \*\*ARIA\*\* | Use ARIA only when needed |



\---



\## 🏗️ Semantic HTML



\### Correct Heading Hierarchy



```html

<!-- ✅ GOOD: Proper heading hierarchy -->

<h1>Dashboard</h1>

&#x20; <h2>Your Appointments</h2>

&#x20;   <h3>Upcoming Appointments</h3>

&#x20;   <h3>Past Appointments</h3>

&#x20; <h2>Quick Actions</h2>



<!-- ❌ BAD: Skipping heading levels -->

<h1>Dashboard</h1>

&#x20; <h3>Your Appointments</h3> <!-- Skipped h2 -->

&#x20; <h4>Upcoming Appointments</h4> <!-- Skipped h3 -->





Landmark Elements

html

<!-- ✅ GOOD: Using semantic landmarks -->

<header>

&#x20;   <nav>

&#x20;       <!-- Navigation -->

&#x20;   </nav>

</header>



<main>

&#x20;   <!-- Main content -->

</main>



<aside>

&#x20;   <!-- Sidebar content -->

</aside>



<footer>

&#x20;   <!-- Footer content -->

</footer>



<!-- ❌ BAD: Using divs for everything -->

<div class="header">

&#x20;   <div class="nav">

&#x20;       <!-- Navigation -->

&#x20;   </div>

</div>

Lists

html

<!-- ✅ GOOD: Using semantic lists -->

<ul>

&#x20;   <li>Appointment 1</li>

&#x20;   <li>Appointment 2</li>

&#x20;   <li>Appointment 3</li>

</ul>



<ol>

&#x20;   <li>Step 1: Login</li>

&#x20;   <li>Step 2: Book appointment</li>

&#x20;   <li>Step 3: Confirm</li>

</ol>



<!-- ❌ BAD: Using divs for lists -->

<div>

&#x20;   <div>Appointment 1</div>

&#x20;   <div>Appointment 2</div>

&#x20;   <div>Appointment 3</div>

</div>

Buttons vs Links

html

<!-- ✅ GOOD: Use button for actions -->

<button onclick="submitForm()">Submit</button>



<!-- ✅ GOOD: Use link for navigation -->

<a href="/dashboard">Go to Dashboard</a>



<!-- ❌ BAD: Using link for actions -->

<a href="#" onclick="submitForm()">Submit</a>



<!-- ❌ BAD: Using button for navigation -->

<button onclick="location.href='/dashboard'">Go to Dashboard</button>

📝 Form Accessibility

Label Association

html

<!-- ✅ GOOD: Explicit label association -->

<label for="email">Email Address</label>

<input type="email" id="email" name="email" required>



<!-- ✅ GOOD: Implicit label wrapping -->

<label>

&#x20;   Email Address

&#x20;   <input type="email" name="email" required>

</label>



<!-- ❌ BAD: No label association -->

<input type="email" placeholder="Email" required>

Fieldset \& Legend

html

<!-- ✅ GOOD: Grouping related fields -->

<fieldset>

&#x20;   <legend>Personal Information</legend>

&#x20;   

&#x20;   <label for="firstName">First Name</label>

&#x20;   <input type="text" id="firstName" name="firstName">

&#x20;   

&#x20;   <label for="lastName">Last Name</label>

&#x20;   <input type="text" id="lastName" name="lastName">

</fieldset>



<fieldset>

&#x20;   <legend>Contact Details</legend>

&#x20;   

&#x20;   <label for="email">Email</label>

&#x20;   <input type="email" id="email" name="email">

</fieldset>

Error Messages

html

<!-- ✅ GOOD: Accessible error messages -->

<div>

&#x20;   <label for="email">Email Address</label>

&#x20;   <input type="email" id="email" name="email" 

&#x20;          aria-describedby="email-error" 

&#x20;          aria-invalid="true">

&#x20;   <div id="email-error" role="alert">

&#x20;       Please enter a valid email address

&#x20;   </div>

</div>



<!-- ❌ BAD: No error identification -->

<div>

&#x20;   <label for="email">Email Address</label>

&#x20;   <input type="email" id="email" name="email">

&#x20;   <div style="color:red;">

&#x20;       Please enter a valid email address

&#x20;   </div>

</div>

Required Field Indicators

html

<!-- ✅ GOOD: Clear required field indicators -->

<label for="email">

&#x20;   Email Address

&#x20;   <span aria-hidden="true">\*</span>

&#x20;   <span class="sr-only">(required)</span>

</label>

<input type="email" id="email" name="email" required>



<!-- ✅ GOOD: Using required attribute -->

<label for="email">Email Address</label>

<input type="email" id="email" name="email" required>

Form Focus Management

html

<!-- ✅ GOOD: Focus management -->

<form id="signupForm" novalidate>

&#x20;   <div>

&#x20;       <label for="name">Name</label>

&#x20;       <input type="text" id="name" name="name" required>

&#x20;       <div class="error" role="alert" id="name-error"></div>

&#x20;   </div>

&#x20;   <button type="submit">Sign Up</button>

</form>



<script>

&#x20;   const form = document.getElementById('signupForm');

&#x20;   form.addEventListener('submit', function(e) {

&#x20;       // Focus first invalid field

&#x20;       const firstError = document.querySelector('.error:not(:empty)');

&#x20;       if (firstError) {

&#x20;           const inputId = firstError.id.replace('-error', '');

&#x20;           document.getElementById(inputId).focus();

&#x20;           e.preventDefault();

&#x20;       }

&#x20;   });

</script>

🎨 Color Contrast \& Visual Design

Minimum Contrast Ratios

Text Size	WCAG AA	WCAG AAA

Normal Text (16px+)	4.5:1	7:1

Large Text (24px+)	3:1	4.5:1

Non-text (UI elements)	3:1	3:1

Contrast Checker Tools

WebAIM Contrast Checker



Contrast Ratio Calculator



Tanaguru Contrast Finder



Color Usage

css

/\* ✅ GOOD: Sufficient contrast \*/

.login-button {

&#x20;   background-color: #64ffda;

&#x20;   color: #0a192f; /\* Dark text on light background \*/

}



/\* ❌ BAD: Insufficient contrast \*/

.login-button {

&#x20;   background-color: #64ffda;

&#x20;   color: #ffffff; /\* White text on light background \*/

}

Color Blindness Considerations

css

/\* ✅ GOOD: Color-blind friendly design \*/

.error-message {

&#x20;   color: #d32f2f;

&#x20;   /\* Add icon for additional visual cue \*/

&#x20;   padding-left: 24px;

&#x20;   background: url('/icons/error.svg') left center no-repeat;

}



/\* ❌ BAD: Color-only indication \*/

.error-message {

&#x20;   color: #d32f2f; /\* Color only \*/

}



/\* Good practices \*/

/\* ✅ Use patterns, icons, or text in addition to color \*/

/\* ✅ Test designs with color blindness simulators \*/

/\* ✅ Use accessible color palettes \*/

Focus Indicators

css

/\* ✅ GOOD: Visible focus indicator \*/

button:focus-visible,

input:focus-visible,

a:focus-visible {

&#x20;   outline: 3px solid #64ffda;

&#x20;   outline-offset: 2px;

}



/\* ✅ GOOD: Focus indicator with fallback \*/

button:focus {

&#x20;   outline: 3px solid #64ffda;

&#x20;   outline-offset: 2px;

}



button:focus:not(:focus-visible) {

&#x20;   outline: none;

}



/\* ❌ BAD: Removing focus indicator \*/

button:focus {

&#x20;   outline: none; /\* Don't do this! \*/

}

⌨️ Keyboard Navigation

Tab Order

html

<!-- ✅ GOOD: Logical tab order -->

<nav>

&#x20;   <a href="/">Home</a>

&#x20;   <a href="/dashboard">Dashboard</a>

&#x20;   <a href="/profile">Profile</a>

</nav>



<main>

&#x20;   <h1>Welcome</h1>

&#x20;   <button>Action 1</button>

&#x20;   <button>Action 2</button>

</main>



<!-- ❌ BAD: Using tabindex incorrectly -->

<button tabindex="3">Action 1</button>

<button tabindex="1">Action 2</button>

<button tabindex="2">Action 3</button>

<!-- Tab order should be natural, not forced -->

Skip Links

html

<!-- ✅ GOOD: Skip link for keyboard users -->

<body>

&#x20;   <a href="#main-content" class="skip-link">

&#x20;       Skip to main content

&#x20;   </a>

&#x20;   

&#x20;   <header>

&#x20;       <nav><!-- Navigation --></nav>

&#x20;   </header>

&#x20;   

&#x20;   <main id="main-content">

&#x20;       <!-- Main content -->

&#x20;   </main>

</body>



<style>

&#x20;   .skip-link {

&#x20;       position: absolute;

&#x20;       top: -100%;

&#x20;       left: 0;

&#x20;       padding: 12px;

&#x20;       background: #0a192f;

&#x20;       color: white;

&#x20;       z-index: 1000;

&#x20;   }

&#x20;   

&#x20;   .skip-link:focus {

&#x20;       top: 0;

&#x20;   }

</style>

Keyboard Shortcuts

html

<!-- ✅ GOOD: Keyboard shortcuts -->

<button onclick="submit()" accesskey="s">

&#x20;   Submit (Alt+S)

</button>



<!-- ✅ GOOD: Keyboard shortcuts with hints -->

<div class="shortcut-hint">

&#x20;   <button onclick="submit()">

&#x20;       Submit

&#x20;       <span class="shortcut">Alt+S</span>

&#x20;   </button>

</div>

Focus Management for Modals

javascript

// ✅ GOOD: Focus trapping in modals

function openModal() {

&#x20;   const modal = document.getElementById('modal');

&#x20;   const firstFocusable = modal.querySelector('button');

&#x20;   const lastFocusable = modal.querySelectorAll('button').pop();

&#x20;   

&#x20;   modal.classList.add('active');

&#x20;   firstFocusable.focus();

&#x20;   

&#x20;   // Trap focus

&#x20;   modal.addEventListener('keydown', function(e) {

&#x20;       if (e.key === 'Tab') {

&#x20;           if (e.shiftKey \&\& document.activeElement === firstFocusable) {

&#x20;               e.preventDefault();

&#x20;               lastFocusable.focus();

&#x20;           } else if (!e.shiftKey \&\& document.activeElement === lastFocusable) {

&#x20;               e.preventDefault();

&#x20;               firstFocusable.focus();

&#x20;           }

&#x20;       }

&#x20;   });

}



function closeModal() {

&#x20;   // Return focus to trigger element

&#x20;   const trigger = document.querySelector('\[data-modal-trigger]');

&#x20;   trigger.focus();

}

♿ ARIA Guidelines

When to Use ARIA

Use ARIA when:



Semantic HTML is not available



Dynamic content changes



Custom interactive elements



Don't use ARIA when:



Semantic HTML works



Native HTML attributes are available



You can achieve the same with HTML



Common ARIA Attributes

Attribute	Purpose	Example

aria-label	Label for non-text elements	<button aria-label="Close menu">✕</button>

aria-labelledby	Reference to label element	<div aria-labelledby="title">

aria-describedby	Reference to description	<input aria-describedby="hint">

aria-expanded	Expandable content state	<button aria-expanded="false">

aria-controls	Controls another element	<button aria-controls="menu">

aria-hidden	Hide from screen readers	<div aria-hidden="true">

role	Define element role	<div role="dialog">

aria-live	Live region updates	<div aria-live="polite">

ARIA Examples

html

<!-- ✅ GOOD: ARIA for custom elements -->

<div role="button" tabindex="0" 

&#x20;    aria-pressed="false"

&#x20;    onclick="toggleState(this)">

&#x20;   Toggle State

</div>



<!-- ✅ GOOD: ARIA for live updates -->

<div id="notification" role="alert" aria-live="polite">

&#x20;   Appointment booked successfully!

</div>



<!-- ✅ GOOD: ARIA for expandable content -->

<button aria-expanded="false" 

&#x20;       aria-controls="menu-section"

&#x20;       onclick="toggleMenu()">

&#x20;   Menu

</button>

<div id="menu-section" hidden>

&#x20;   <!-- Menu content -->

</div>

🧪 Testing for Accessibility

Automated Testing

Tool	Purpose	Platform

axe DevTools	Comprehensive accessibility testing	Browser extension

WAVE	Visual feedback on accessibility	Browser extension

Lighthouse	Performance + accessibility	Chrome DevTools

Pa11y	Automated testing	CLI tool

Accessibility Insights	Full testing suite	Browser extension

Manual Testing

1\. Keyboard Testing

bash

\# Test the page using only keyboard

\# - Tab: Move forward

\# - Shift+Tab: Move backward

\# - Enter/Space: Activate button/link

\# - Esc: Close modals/dropdowns

Checklist:



Can navigate to all interactive elements



Focus indicator visible on all elements



Tab order is logical



No keyboard traps



All actions work via keyboard



2\. Screen Reader Testing

Screen Reader	Platform	Setup

NVDA	Windows	Free

JAWS	Windows	Commercial

VoiceOver	macOS/iOS	Built-in

TalkBack	Android	Built-in

ChromeVox	Chrome	Browser extension

Checklist:



All content announced correctly



Form labels read



Error messages announced



Dynamic content updates announced



Images have alt text



3\. Visual Testing

Checklist:



Color contrast sufficient



Content visible in high contrast mode



Text resizes correctly



Zoom works (200%+)



Content readable without CSS



Testing Script

javascript

// Basic accessibility testing script

function testAccessibility() {

&#x20;   // 1. Check for alt text

&#x20;   document.querySelectorAll('img').forEach(img => {

&#x20;       if (!img.alt \&\& !img.getAttribute('aria-hidden')) {

&#x20;           console.warn('Missing alt text:', img);

&#x20;       }

&#x20;   });

&#x20;   

&#x20;   // 2. Check for labels

&#x20;   document.querySelectorAll('input, select, textarea').forEach(field => {

&#x20;       if (!field.id || !document.querySelector(`label\[for="${field.id}"]`)) {

&#x20;           console.warn('Missing label for:', field);

&#x20;       }

&#x20;   });

&#x20;   

&#x20;   // 3. Check for heading hierarchy

&#x20;   let lastLevel = 0;

&#x20;   document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {

&#x20;       const level = parseInt(heading.tagName.charAt(1));

&#x20;       if (level > lastLevel + 1) {

&#x20;           console.warn('Skipped heading level:', heading);

&#x20;       }

&#x20;       lastLevel = level;

&#x20;   });

&#x20;   

&#x20;   // 4. Check for focus indicators

&#x20;   document.querySelectorAll('a, button, input, select, textarea').forEach(el => {

&#x20;       const styles = getComputedStyle(el);

&#x20;       if (styles.outline === 'none' || styles.outline === '0px') {

&#x20;           console.warn('Missing focus indicator:', el);

&#x20;       }

&#x20;   });

}

🔧 Common Issues \& Fixes

Issue 1: Missing Alt Text

html

<!-- ❌ BAD -->

<img src="logo.png">



<!-- ✅ GOOD -->

<img src="logo.png" alt="HealthLink Logo">

<img src="logo.png" alt="" role="presentation"> <!-- Decorative image -->

Issue 2: No Labels on Forms

html

<!-- ❌ BAD -->

<input type="text" placeholder="Email">



<!-- ✅ GOOD -->

<label for="email">Email</label>

<input type="text" id="email" name="email">

Issue 3: Color-Only Indication

html

<!-- ❌ BAD -->

<span style="color: red;">Error: Invalid input</span>



<!-- ✅ GOOD -->

<span style="color: red;" role="alert">

&#x20;   <span aria-hidden="true">⚠️</span> Error: Invalid input

</span>

Issue 4: Poor Focus Visibility

css

/\* ❌ BAD \*/

button:focus {

&#x20;   outline: none;

}



/\* ✅ GOOD \*/

button:focus-visible {

&#x20;   outline: 3px solid #64ffda;

&#x20;   outline-offset: 2px;

}

Issue 5: Empty Links/Buttons

html

<!-- ❌ BAD -->

<a href="#"></a>

<button></button>



<!-- ✅ GOOD -->

<a href="/dashboard">Go to Dashboard</a>

<button>Submit</button>

<button aria-label="Close">✕</button>

Issue 6: Missing Error Announcements

html

<!-- ❌ BAD -->

<div class="error">Invalid email</div>



<!-- ✅ GOOD -->

<div class="error" role="alert" aria-live="polite">

&#x20;   Invalid email

</div>

📚 Resources

Guidelines \& Standards

WCAG 2.1 Guidelines



WAI-ARIA Practices



WebAIM Accessibility



Tools

axe DevTools



WAVE Evaluation Tool



Chrome DevTools Accessibility Panel



Training \& Learning

Google Accessibility Course



FreeCodeCamp Accessibility



Udemy Accessibility Courses



Last Updated: July 2026





