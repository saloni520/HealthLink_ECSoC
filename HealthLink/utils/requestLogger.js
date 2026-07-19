const logger = require('./logger');

/**
 * Request logging middleware for monitoring and debugging.
 * Hook into Express response 'finish' event to calculate response time
 * and log details with dynamic log levels (detailed in dev, essential in prod).
 */
const requestLogger = (req, res, next) => {
    const start = process.hrtime();

    res.on('finish', () => {
        const diff = process.hrtime(start);
        const timeInMs = Math.round(diff[0] * 1e3 + diff[1] * 1e-6);
        const method = req.method;
        const url = req.originalUrl || req.url;
        const statusCode = res.statusCode;

        // Essential log format: 🚀 METHOD URL STATUS TIMEms
        const logMsg = `🚀 ${method} ${url} ${statusCode} ${timeInMs}ms`;

        // Check configured log level via environment variable
        // LOG_LEVEL can be 'development'/'detailed' or 'production'/'essential'
        const envLogLevel = (process.env.LOG_LEVEL || '').toLowerCase();
        const isDetailed = envLogLevel
            ? (envLogLevel === 'detailed' || envLogLevel === 'development')
            : (process.env.NODE_ENV !== 'production');

        if (isDetailed) {
            // Detailed logging: include metadata context
            const meta = {
                ip: req.ip || req.connection?.remoteAddress || 'unknown',
                requestId: req.requestId || 'unknown',
                userId: req.user?._id || req.user?.id || 'unauthenticated'
            };
            
            if (req.query && Object.keys(req.query).length > 0) {
                meta.query = req.query;
            }
            
            if (req.body && Object.keys(req.body).length > 0) {
                // Sensitive field filtering
                const safeBody = { ...req.body };
                const sensitiveFields = ['password', 'token', 'secret', 'passwordConfirm'];
                for (const field of sensitiveFields) {
                    if (field in safeBody) {
                        safeBody[field] = '********';
                    }
                }
                meta.body = safeBody;
            }
            logger.request(logMsg, meta);
        } else {
            // Essential logging: only log the essential message
            logger.request(logMsg);
        }
    });

    next();
};

module.exports = requestLogger;
