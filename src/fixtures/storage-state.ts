import * as path from 'path';
import * as fs from 'fs';

const AUTH_DIR = path.resolve(__dirname, '../../.auth');

export function ensureAuthDir(): void {
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }
}
