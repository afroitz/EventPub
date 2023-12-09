import 'dotenv/config';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from './db';

const runMigration = async () => {
  await migrate(db, { migrationsFolder: './drizzle' });
  await pool.end();
}

runMigration();