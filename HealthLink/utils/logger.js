/**
 * Centralized logging utility for the HealthLink application.
 * Maintain existing log levels (info, warn, error, debug) and
 * add request logging method to support custom HTTP logging format.
 */

const logger = {
    info: (message, meta = {}) => {
        console.log(`[${new Date().toISOString()}] ℹ️ INFO: ${message}`, meta);
    },
    warn: (message, meta = {}) => {
        console.warn(`[${new Date().toISOString()}] ⚠️ WARN: ${message}`, meta);
    },
    error: (message, meta = {}) => {
        console.error(`[${new Date().toISOString()}] ❌ ERROR: ${message}`, meta);
    },
    debug: (message, meta = {}) => {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[${new Date().toISOString()}] 🔍 DEBUG: ${message}`, meta);
        }
    },
    /**
     * Specialized logging for HTTP request details.
     * Logs exactly in format: [timestamp] 🚀 METHOD URL STATUS TIMEms
     */
    request: (message, meta = null) => {
        const timestamp = new Date().toISOString();
        if (meta) {
            console.log(`[${timestamp}] ${message}`, meta);
        } else {
            console.log(`[${timestamp}] ${message}`);
        }
    }
};

module.exports = logger;
