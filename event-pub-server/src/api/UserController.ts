import { Request, Response, NextFunction } from "express";
import { db } from "../db/db";
import { eq } from "drizzle-orm";
import { dbUsers } from "../db/schema";
import bcrypt from "bcrypt";
import UserRepository from "../db/UserRepository";

type NewUser = typeof dbUsers.$inferInsert;

class UserController {

  repository: UserRepository

  constructor() {
    this.repository = new UserRepository();
  }

  public register = async (req: Request, res: Response) => {

    try {
      const { username, password } = req.body;
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      await this.repository.create({
        username: username,
        password: hashedPassword,
      });

    } catch (error) {
      console.log(error)
      return res.status(400).send("Error registering user. Username might be taken.");
    }

    res.status(200).send("User registered");

  }

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {

      const { username, password } = req.body;

      // load user from db and check existence
      const user = await db.query.dbUsers.findFirst({
        where: eq(dbUsers.username, username)
      });

      if (!user) {
        return res.status(401).send('User not found');
      }

      // check password
      if (!await bcrypt.compare(password, user.password)) {
        return res.status(401).send('Invalid password');
      }

      // initialize session
      req.session.user = user

      return res.status(200).send('Logged in');
    } catch (error) {
      console.log(error);
      res.status(500).send("Error logging in");
    }
  }

  public logout = async (req: Request, res: Response) => {
    try {
      req.session.destroy((error) => {
        if (error) {
          throw error;
        }
      });
      res.clearCookie('sid');
      res.status(200).send({message: 'Logged out'});
    } catch (error) {
      console.log(error);
      res.status(500).send({message: "Error logging out"});
    }
  }
   

  // TODO: Make this activitypub compliant
  public get = async (req: Request, res: Response) => {
    try {
      const { username } = req.params;

      const user = await db.query.dbUsers.findFirst({
        where: eq(dbUsers.username, username)
      });

      if (!user) {
        return res.status(404).send('User not found');
      }

      return res.status(200).send(user);
    } catch (error) {
      console.log(error);
      res.status(500).send("Error getting user");
    }
  }

  public checkSession = async (req: Request, res: Response) => {
    if (req.session.user) {
      return res.send({loggedIn: true})
    } else {
      return res.send({loggedIn: false})
    }
  }
}

export default UserController;