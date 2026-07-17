/**
 * ============================================
 * PASSWORD VALIDATION UTILITIES
 * ============================================
 * Provides comprehensive password validation
 * for enhanced authentication security.
 * 
 * @module utils/passwordValidator
 */

/**
 * ============================================
 * COMMON WEAK PASSWORDS BLOCKLIST
 * ============================================
 * Top 100+ most common passwords that should
 * be rejected immediately
 */
const COMMON_PASSWORDS = new Set([
    // Top 50 most common passwords
    'password', '123456', '12345678', '123456789', '12345',
    '1234567', '1234567890', 'qwerty', 'abc123', 'password123',
    'admin', 'admin123', 'letmein', 'welcome', 'monkey',
    'dragon', 'master', 'hello', 'freedom', 'whatever',
    'qwertyuiop', 'asdfghjkl', 'zxcvbnm', 'iloveyou', 'sunshine',
    'princess', 'rockyou', '123123', 'qwerty123', 'password1',
    'admin123', '1234', '123456789', '111111', '000000',
    'superman', 'batman', 'trustno1', 'qwertyui', 'qwerty123',
    'abc123456', '123456a', 'qwerty12345', '1q2w3e4r', 'password!',
    'passw0rd', 'pa55word', 'p@ssw0rd', 'P@ssw0rd', 'Password1',
    '123qwe', '123qweasd', 'qwe123', 'qweasd', 'asd123',
    'zxcvbn', 'zaq12wsx', '1qaz2wsx', '1q2w3e', '1q2w3e4r5t',
    'qwerty123456', '123456789a', 'password1234', 'admin1234',
    'letmein123', 'welcome123', 'monkey123', 'dragon123',
    'master123', 'hello123', 'freedom123', 'whatever123',
    'iloveyou123', 'sunshine123', 'princess123', 'rockyou123',
    'superman123', 'batman123', 'trustno123', 'qwertyuiop123',
    'qwerty123456', 'abc123456789', '123456789qwe', 'qwerty123!',
    'password123!', 'admin123!', 'letmein!', 'welcome!',
    'P@ssword', 'p@ssword', 'password@123', 'admin@123',
    '123456@qwerty', 'qwerty@123', 'abc@123', 'test123',
    'testpassword', 'changeme', 'default', 'user123',
    'guest', 'guest123', 'root', 'root123', 'toor',
    'linux', 'ubuntu', 'debian', 'raspberry', 'raspberrypi'
]);

/**
 * ============================================
 * COMMON PATTERNS TO REJECT
 * ============================================
 */
const PATTERNS = {
    // Sequential characters
    sequential: /^(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789|890|012|qwerty|asdf|zxcv|qwer|asdfgh|zxcvbn|qwertyui|asdfghjkl|zxcvbnm)$/i,
    
    // Keyboard patterns
    keyboard: /^(?:qwerty|asdfgh|zxcvbn|qwertyui|asdfghjkl|zxcvbnm|1q2w3e|qweasd|qwerty123|qwertyuiop|asdfghjkl|zxcvbnm)$/i,
    
    // Repeated characters
    repeated: /^(.)\1{3,}$/,
    
    // Common date patterns
    date: /^(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])$/,
    
    // Only numbers
    onlyNumbers: /^\d+$/,
    
    // Only letters
    onlyLetters: /^[a-zA-Z]+$/,
    
    // Only alphanumeric (no special chars)
    onlyAlphanumeric: /^[a-zA-Z0-9]+$/
};

/**
 * ============================================
 * PASSWORD VALIDATION FUNCTIONS
 * ============================================
 */

/**
 * Validates password against all security requirements
 * 
 * @param {string} password - Password to validate
 * @param {Object} userData - User data for personal info check
 * @param {string} userData.name - User's name
 * @param {string} userData.email - User's email
 * @returns {Object} Validation result with errors array
 * 
 * @example
 * const result = validatePassword('MySecurePass123!', { name: 'John', email: 'john@email.com' });
 * if (!result.valid) {
 *     console.log(result.errors); // Array of error messages
 * }
 */
function validatePassword(password, userData = {}) {
    const errors = [];

    // 1. Check if password is provided
    if (!password || password.length === 0) {
        errors.push('Password is required');
        return { valid: false, errors };
    }

    // 2. Check length (min 8, max 64)
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (password.length > 64) {
        errors.push('Password cannot exceed 64 characters');
    }

    // 3. Check for character diversity
    let hasUpperCase = /[A-Z]/.test(password);
    let hasLowerCase = /[a-z]/.test(password);
    let hasNumber = /[0-9]/.test(password);
    let hasSpecial = /[^a-zA-Z0-9]/.test(password);

    if (!hasUpperCase) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumber) {
        errors.push('Password must contain at least one number');
    }
    if (!hasSpecial) {
        errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?/~)');
    }

    // 4. Check against common passwords blocklist
    const normalizedPassword = password.toLowerCase();
    if (COMMON_PASSWORDS.has(normalizedPassword)) {
        errors.push('This password is too common. Please choose a more secure password');
    }

    // 5. Check for sequential characters
    if (PATTERNS.sequential.test(normalizedPassword)) {
        errors.push('Password contains sequential characters (e.g., abc, 123, qwerty)');
    }

    // 6. Check for keyboard patterns
    if (PATTERNS.keyboard.test(normalizedPassword)) {
        errors.push('Password contains common keyboard patterns (e.g., qwerty, asdf)');
    }

    // 7. Check for repeated characters (3+ times)
    if (PATTERNS.repeated.test(password)) {
        errors.push('Password contains repeated characters too many times (e.g., aaaa, 1111)');
    }

    // 8. Check for only numbers
    if (PATTERNS.onlyNumbers.test(password)) {
        errors.push('Password cannot consist only of numbers');
    }

    // 9. Check for only letters
    if (PATTERNS.onlyLetters.test(password)) {
        errors.push('Password cannot consist only of letters');
    }

    // 10. Check for only alphanumeric (no special chars)
    if (PATTERNS.onlyAlphanumeric.test(password) && password.length > 0) {
        errors.push('Password must contain at least one special character');
    }

    // 11. Check for personal information
    if (userData.name && userData.name.length > 0) {
        const nameParts = userData.name.toLowerCase().split(/\s+/);
        for (const part of nameParts) {
            if (part.length > 2 && password.toLowerCase().includes(part)) {
                errors.push('Password should not contain your name');
                break;
            }
        }
    }

    if (userData.email && userData.email.length > 0) {
        const emailParts = userData.email.split('@')[0].toLowerCase();
        if (emailParts.length > 2 && password.toLowerCase().includes(emailParts)) {
            errors.push('Password should not contain your email username');
        }
    }

    // 12. Check for year patterns (1990-2024)
    const currentYear = new Date().getFullYear();
    for (let year = 1990; year <= currentYear; year++) {
        if (password.includes(year.toString())) {
            errors.push('Password should not contain common year patterns');
            break;
        }
    }

    return {
        valid: errors.length === 0,
        errors: errors,
        strength: calculateStrength(password, errors.length)
    };
}

/**
 * Calculate password strength based on validation results
 * 
 * @param {string} password - The password
 * @param {number} errorCount - Number of validation errors
 * @returns {Object} Strength object with label and class
 */
function calculateStrength(password, errorCount) {
    let score = 0;
    
    // Length score
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    
    // Character diversity score
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    // Pattern detection (penalize for patterns)
    if (PATTERNS.sequential.test(password.toLowerCase())) score -= 2;
    if (PATTERNS.keyboard.test(password.toLowerCase())) score -= 2;
    if (PATTERNS.repeated.test(password)) score -= 1;
    
    // Common password penalty
    if (COMMON_PASSWORDS.has(password.toLowerCase())) score -= 3;
    
    // Normalize score
    score = Math.max(0, Math.min(10, score));
    
    let label, className;
    if (score <= 3) {
        label = 'Very Weak';
        className = 'very-weak';
    } else if (score <= 5) {
        label = 'Weak';
        className = 'weak';
    } else if (score <= 7) {
        label = 'Moderate';
        className = 'moderate';
    } else if (score <= 9) {
        label = 'Strong';
        className = 'strong';
    } else {
        label = 'Very Strong';
        className = 'very-strong';
    }
    
    // If there are validation errors, downgrade strength
    if (errorCount > 2) {
        label = 'Weak';
        className = 'weak';
    }
    
    return { label, className, score };
}

/**
 * Get password requirements as a formatted list
 * 
 * @returns {Array} Array of requirement strings
 */
function getPasswordRequirements() {
    return [
        'At least 8 characters long',
        'At least one uppercase letter (A-Z)',
        'At least one lowercase letter (a-z)',
        'At least one number (0-9)',
        'At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?/~)',
        'Cannot be a commonly used password',
        'Cannot contain sequential characters (abc, 123, qwerty)',
        'Cannot contain keyboard patterns (qwerty, asdf)',
        'Cannot contain repeated characters (aaaa, 1111)',
        'Cannot contain your name or email username'
    ];
}

/**
 * Get password requirements as HTML
 * 
 * @returns {string} HTML formatted requirements
 */
function getPasswordRequirementsHTML() {
    const requirements = getPasswordRequirements();
    return requirements.map(req => `<li>${req}</li>`).join('');
}

module.exports = {
    validatePassword,
    getPasswordRequirements,
    getPasswordRequirementsHTML,
    COMMON_PASSWORDS,
    PATTERNS
};