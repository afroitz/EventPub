import { Request, Response, NextFunction } from 'express';

export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.user) {
    next();
  } else {
    return res.status(401).send('Not logged in');
  }
}