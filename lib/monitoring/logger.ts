/**
 * Logger
 * 
 * A structured logging utility for consistent logging across the application.
 * Supports different log levels, context enrichment, and error tracking.
 */

export class Logger {
  private context: Record<string, unknown> = {};
  
  /**
   * Creates a new Logger instance
   * 
   * @param component - The component name for this logger
   */
  constructor(private component: string) {}
  
  /**
   * Creates a new logger with additional context
   * 
   * @param context - Additional context to add to log entries
   * @returns A new Logger instance with the combined context
   */
  withContext(context: Record<string, unknown>): Logger {
    return Object.assign(new Logger(this.component), { 
      context: { ...this.context, ...context } 
    });
  }
  
  /**
   * Logs an informational message
   * 
   * @param message - The message to log
   * @param data - Optional data to include with the log
   */
  info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, data);
  }
  
  /**
   * Logs a warning message
   * 
   * @param message - The message to log
   * @param data - Optional data to include with the log
   */
  warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, data);
  }
  
  /**
   * Logs an error message
   * 
   * @param message - The message to log
   * @param error - Optional error object
   * @param data - Optional data to include with the log
   */
  error(message: string, error?: Error, data?: Record<string, unknown>): void {
    this.log('error', message, { 
      ...data, 
      error: error ? { 
        message: error.message, 
        stack: error.stack,
        name: error.name
      } : undefined
    });
    
    // Send to error tracking service in production
    if (process.env.NODE_ENV === 'production' && error) {
      // This would integrate with an error tracking service like Sentry
      // captureException(error, { extra: { ...this.context, ...data } });
    }
  }
  
  /**
   * Logs a debug message (only in development)
   * 
   * @param message - The message to log
   * @param data - Optional data to include with the log
   */
  debug(message: string, data?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== 'production') {
      this.log('debug', message, data);
    }
  }
  
  /**
   * Internal method to format and output logs
   * 
   * @param level - The log level
   * @param message - The message to log
   * @param data - Optional data to include with the log
   */
  private log(level: string, message: string, data?: Record<string, unknown>): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      component: this.component,
      message,
      ...this.context,
      ...data
    };
    
    // In development, pretty print logs
    if (process.env.NODE_ENV !== 'production') {
      if (level === 'error') {
        console.error(`[${logEntry.timestamp}] [${level.toUpperCase()}] [${this.component}] ${message}`, {
          ...this.context,
          ...data
        });
      } else {
        console.log(`[${logEntry.timestamp}] [${level.toUpperCase()}] [${this.component}] ${message}`, {
          ...this.context,
          ...data
        });
      }
    } else {
      // In production, output structured JSON for log aggregation
      console.log(JSON.stringify(logEntry));
    }
  }
}
