import 'dotenv/config';
import express, { Express  } from 'express';
import router from './api/router';
const cors = require('cors');

const app: Express = express();
const port = process.env.PORT;

app.use(cors({
  origin: 'http://localhost:3000'
}))

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use('/', router);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});