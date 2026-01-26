/**
 * Production-ready logging utility
 * Only logs in development mode by default
 * Can be extended to integrate with external logging services (e.g., Sentry, LogRocket)
 */

const isDev = process.env.NODE_ENV !== 'production';

// Log levels
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Current log level - can be configured via environment variable
const currentLevel = isDev ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN;

/**
 * Format log message with timestamp and prefix
 */
const formatMessage = (level, prefix, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] [${prefix}] ${message}`;
};

/**
 * Logger object with methods for each log level
 */
const logger = {
  /**
   * Debug level - only in development
   */
  debug: (prefix, message, data = null) => {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      const formatted = formatMessage('DEBUG', prefix, message);
      if (data) {
        // console.log(formatted, data);
      } else {
        // console.log(formatted);
      }
    }
  },

  /**
   * Info level - general information
   */
  info: (prefix, message, data = null) => {
    if (currentLevel <= LOG_LEVELS.INFO) {
      const formatted = formatMessage('INFO', prefix, message);
      if (data) {
        // console.info(formatted, data);
      } else {
        // console.info(formatted);
      }
    }
  },

  /**
   * Warning level - potential issues
   */
  warn: (prefix, message, data = null) => {
    if (currentLevel <= LOG_LEVELS.WARN) {
      const formatted = formatMessage('WARN', prefix, message);
      if (data) {
        // console.warn(formatted, data);
      } else {
        console.warn(formatted);
      }
    }
  },

  /**
   * Error level - errors that should always be logged
   */
  error: (prefix, message, error = null) => {
    if (currentLevel <= LOG_LEVELS.ERROR) {
      const formatted = formatMessage('ERROR', prefix, message);
      if (error) {
        console.error(formatted, error);
        // In production, you could send to error tracking service here
        // Example: Sentry.captureException(error);
      } else {
        console.error(formatted);
      }
    }
  },

  /**
   * Auth-specific logging helper
   */
  auth: {
    debug: (message, data = null) => logger.debug('AUTH', message, data),
    info: (message, data = null) => logger.info('AUTH', message, data),
    warn: (message, data = null) => logger.warn('AUTH', message, data),
    error: (message, error = null) => logger.error('AUTH', error),
  },

  /**
   * API-specific logging helper
   */
  api: {
    request: (method, url, body = null) => {
      logger.debug('API', `${method} ${url}`, body ? { body } : null);
    },
    response: (status, statusText, data = null) => {
      const level = status >= 400 ? 'warn' : 'debug';
      logger[level]('API', `Response: ${status} ${statusText}`, data);
    },
    error: (message, error = null) => logger.error('API', message, error),
  },
};

export default logger;
