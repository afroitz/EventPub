import 'dotenv/config';
import { Pool } from 'pg';

export const pool = process.env.DATABASE_ENVIRONMENT === 'development' ? new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PW,
  port: Number(process.env.DB_PORT),
}) : new Pool({ connectionString: process.env.DATABASE_URL });

const createTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS "session" (
            "sid" varchar NOT NULL COLLATE "default",
            "sess" json NOT NULL,
            "expire" timestamp(6) NOT NULL
        )
        WITH (OIDS=FALSE);

        ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

        CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `;

    try {
        await pool.query(query);
        console.log('Session table created successfully.');
    } catch (error) {
        console.error('Error creating session table:', error);
    } finally {
        await pool.end();
    }
};

createTable();
