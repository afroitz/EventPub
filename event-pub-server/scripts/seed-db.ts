import 'dotenv/config';
import { Pool } from 'pg';
import { NewServer, NewUser } from '../src/db/schema';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcrypt";

export const pool = process.env.DATABASE_ENVIRONMENT === 'development' ? new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PW,
  port: Number(process.env.DB_PORT),
}) : new Pool({ connectionString: process.env.DATABASE_URL });

const seedDb = async () => {
  // add test servers
  const servers: NewServer[] = [
    {
      id: uuidv4(),
      inbox: "http://localhost:4012/test_inbox_1",
    },
    {
      id: uuidv4(),
      inbox: "http://localhost:4012/test_inbox_2",
    },
  ];

  const users: NewUser[] = [
    {
      username: 'test',
      password: 'test',
    },
  ];

  const insertServerQuery = `
    INSERT INTO event_pub_schema.servers (id, inbox)
    VALUES ($1, $2)
  `;

  const insertUserQuery = `
    INSERT INTO event_pub_schema.users (username, password)
    VALUES ($1, $2)
  `;

  try {
    for (const server of servers) {
      await pool.query(insertServerQuery, [server.id, server.inbox]);
    }
    console.log('Servers added successfully.');

    for (const user of users) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(user.password, salt);
      await pool.query(insertUserQuery, [user.username, hashedPassword]);
    }

    console.log('Users added successfully.');

  } catch (error) {
    console.error('Error seeding db:', error);
  } finally {
    await pool.end();
  }

}

seedDb();
