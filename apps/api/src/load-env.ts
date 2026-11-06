import { existsSync } from 'node:fs';

// Carrega o .env do diretório atual sem sobrescrever variáveis já definidas.
export function loadEnvFile(path = '.env'): void {
  if (existsSync(path)) {
    process.loadEnvFile(path);
  }
}
