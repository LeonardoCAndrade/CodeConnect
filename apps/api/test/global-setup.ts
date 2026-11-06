import { execSync } from 'node:child_process';
import { getTestDatabaseUrl } from './test-database.js';

// Cria o banco de testes, se necessário, e aplica as migrations antes da suíte.
export default function setup(): void {
  execSync('pnpm exec prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: getTestDatabaseUrl() },
    stdio: 'inherit',
  });
}
