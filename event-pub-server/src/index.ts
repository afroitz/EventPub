import 'dotenv/config';
import express, { Express  } from 'express';
import router from './api/router';
import cors from 'cors';
import session from 'express-session';
import { pool } from './db/db';
import connectPgSimple from 'connect-pg-simple';

declare module 'express-session' {
  export interface SessionData {
    user: { [key: string]: any };
  }
}

const app: Express = express();
const port = process.env.PORT;

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
  credentials: true,
}))

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// setup sessions
const PgSession = connectPgSimple(session);

app.use(session({
  store: new PgSession({
    pool: pool,
    tableName: 'session',
  }),
  secret: process.env.SESSION_SECRET as string,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: false
  },
}));

// Router should be last middleware
app.use('/', router);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});