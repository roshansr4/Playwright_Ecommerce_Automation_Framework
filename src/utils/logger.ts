/* eslint-disable no-console */
type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

function timestamp(): string {
  return new Date().toISOString();
}

function write(level: LogLevel, scope: string, message: string, meta?: unknown): void {
  const line = `[${timestamp()}] [${level}] [${scope}] ${message}`;
  if (level === 'ERROR') {
    console.error(line, meta ?? '');
  } else if (level === 'WARN') {
    console.warn(line, meta ?? '');
  } else {
    console.log(line, meta ?? '');
  }
}

export class Logger {
  constructor(private readonly scope: string) {}

  info(message: string, meta?: unknown): void {
    write('INFO', this.scope, message, meta);
  }

  warn(message: string, meta?: unknown): void {
    write('WARN', this.scope, message, meta);
  }

  error(message: string, meta?: unknown): void {
    write('ERROR', this.scope, message, meta);
  }

  debug(message: string, meta?: unknown): void {
    if (process.env.DEBUG) write('DEBUG', this.scope, message, meta);
  }
}

export function createLogger(scope: string): Logger {
  return new Logger(scope);
}
