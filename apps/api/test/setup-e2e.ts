import { getTestDatabaseUrl } from './test-database.js';

process.env.DATABASE_URL = getTestDatabaseUrl();
