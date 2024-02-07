import 'dotenv/config';
const { Client } = require('pg');

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: "postgres",
  port: Number(process.env.DB_PORT),
});

async function main() {
  try {
    await client.connect();

    // Drop the existing database (if it exists)
    await client.query(`DROP DATABASE IF EXISTS ${process.env.DB_NAME}`);
    console.log('Database dropped.');

    // Create a new database
    await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
    console.log('Database created.');

  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await client.end();
  }
}

main();
