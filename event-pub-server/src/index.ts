import express, { Express, Request, Response } from 'express';
import { drizzle } from "drizzle-orm/node-postgres";
import dotenv from 'dotenv';
import pg from 'pg';


dotenv.config();

const { Pool } = pg;

const pool = process.env.DATABASE_ENVIRONMENT === 'development' ? new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PW,
  port: Number(process.env.DB_PORT),
}) : new Pool({ connectionString: process.env.DATABASE_URL });

const db = drizzle(pool);

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

const app: Express = express();
const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});