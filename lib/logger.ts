/**
 * Structured logger for Avolve application
 * Provides consistent logging format and levels
 */

// Log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// Log entry interface
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error | unknown;
}

// Current environment
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Minimum log level based on environment
const MIN_LOG_LEVEL = isProduction ? LogLevel.INFO : LogLevel.DEBUG;

/**
 * Formats a log entry for console output
 */
function formatLogEntry(entry: LogEntry): string {
  const { timestamp, level, message, context } = entry;

  // Basic log format
  let logString = `[${timestamp}] ${level.toUpperCase()}: ${message}`;

  // Add context if available
  if (context && Object.keys(context).length > 0) {
    logString += `\nContext: ${JSON.stringify(context, null, isDevelopment ? 2 : 0)}`;
  }

  return logString;
}

/**
 * Determines if a log level should be processed
 */
function shouldLog(level: LogLevel): boolean {
  const levels = Object.values(LogLevel);
  const minLevelIndex = levels.indexOf(MIN_LOG_LEVEL);
  const currentLevelIndex = levels.indexOf(level);

  return currentLevelIndex >= minLevelIndex;
}

/**
 * Creates a log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, any>,
  error?: Error | unknown
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    error,
  };
}

/**
 * Logs a message at the specified level
 */
function log(
  level: LogLevel,
  message: string,
  context?: Record<string, any>,
  error?: Error | unknown
): void {
  if (!shouldLog(level)) return;

  const entry = createLogEntry(level, message, context, error);
  const formattedLog = formatLogEntry(entry);

  switch (level) {
    case LogLevel.DEBUG:
      console.debug(formattedLog);
      break;
    case LogLevel.INFO:
      console.info(formattedLog);
      break;
    case LogLevel.WARN:
      console.warn(formattedLog);
      break;
    case LogLevel.ERROR:
      console.error(formattedLog);
      if (error instanceof Error) {
        console.error(error.stack);
      }
      break;
  }

  // In a production environment, you might want to send logs to a service like Datadog, Sentry, etc.
  if (isProduction && level === LogLevel.ERROR) {
    // Example: Send to error monitoring service
    // sendToErrorMonitoring(entry);
  }
}

/**
 * Logger interface
 */
export const logger = {
  debug: (message: string, context?: Record<string, any>) => log(LogLevel.DEBUG, message, context),

  info: (message: string, context?: Record<string, any>) => log(LogLevel.INFO, message, context),

  warn: (message: string, context?: Record<string, any>) => log(LogLevel.WARN, message, context),

  error: (message: string, error?: Error | unknown, context?: Record<string, any>) =>
    log(LogLevel.ERROR, message, context, error),

  // Create a logger with predefined context
  withContext: (baseContext: Record<string, any>) => ({
    debug: (message: string, additionalContext?: Record<string, any>) =>
      log(LogLevel.DEBUG, message, { ...baseContext, ...additionalContext }),

    info: (message: string, additionalContext?: Record<string, any>) =>
      log(LogLevel.INFO, message, { ...baseContext, ...additionalContext }),

    warn: (message: string, additionalContext?: Record<string, any>) =>
      log(LogLevel.WARN, message, { ...baseContext, ...additionalContext }),

    error: (message: string, error?: Error | unknown, additionalContext?: Record<string, any>) =>
      log(LogLevel.ERROR, message, { ...baseContext, ...additionalContext }, error),
  }),
};
