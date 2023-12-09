import pg from 'pg';
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from './schema';

const { Pool } = pg;

export const pool = process.env.DATABASE_ENVIRONMENT === 'development' ? new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PW,
  port: Number(process.env.DB_PORT),
}) : new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool, { schema});