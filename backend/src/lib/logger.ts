import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, colorize, errors } = format;

const devFormat = combine(
    colorize(),
    timestamp({ format: 'HH:mm:ss' }),
    errors({ stack: true }),
    printf(({ level, message, timestamp, stack }) =>
        stack ? `${timestamp} ${level}: ${message}\n${stack}` : `${timestamp} ${level}: ${message}`
    )
);

const prodFormat = combine(
    timestamp(),
    errors({ stack: true }),
    format.json()
);

const logger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
    transports: [
        new transports.Console(),
        // In production add file transport or ship to log aggregator (Papertrail, Logtail, etc.)
        ...(process.env.NODE_ENV === 'production'
            ? [new transports.File({ filename: 'logs/error.log', level: 'error' }),
               new transports.File({ filename: 'logs/combined.log' })]
            : []),
    ],
    exitOnError: false,
});

export default logger;
