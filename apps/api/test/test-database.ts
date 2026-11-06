import { loadEnvFile } from '../src/load-env.js';

const TEST_DATABASE = 'codeconnect_test';

// Os testes e2e usam um banco separado para não apagar os dados de desenvolvimento.
export function getTestDatabaseUrl(): string {
  loadEnvFile();
  if (process.env.DATABASE_URL_TEST) {
    return process.env.DATABASE_URL_TEST;
  }
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'Defina DATABASE_URL ou DATABASE_URL_TEST em apps/api/.env para os testes e2e',
    );
  }
  if (!/;database=[^;]*/i.test(url)) {
    throw new Error('DATABASE_URL precisa informar database=<nome>');
  }
  return url.replace(/;database=[^;]*/i, `;database=${TEST_DATABASE}`);
}
