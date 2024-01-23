import "dotenv/config";
import express, { Express, Request, Response } from "express";

const app: Express = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/test_inbox_1", (req: Request, res: Response) => {
  console.log("\n-----\nReceived POST request to test_inbox_1:");
  console.log(req.body);
  res.sendStatus(200);
});

app.post("/test_inbox_2", (req: Request, res: Response) => {
  console.log("\n-----\nReceived POST request to test_inbox_2:");
  console.log(req.body);
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(
    `⚡️[server]: Dummy server is running at http://localhost:${port}`
  );
});
