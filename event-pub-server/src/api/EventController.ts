import { NextFunction, Request, Response } from "express";
import EventRepository from "../db/EventRepository";

class EventController {

  repository: EventRepository

  constructor() {
    this.repository = new EventRepository();
  }

  public createEvent =  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        event_title: eventTitle,
        event_summary: eventSummary,
      } = req.body;

      console.log('creating event'.toUpperCase());
      console.log('eventTitle', eventTitle);
      console.log('eventSummary', eventSummary);

      await this.repository.create({
        title: eventTitle,
        summary: eventSummary,
      });

      res.status(200).send("event created");

    } catch (e) {
      console.log(e);
      res.status(500).send("error creating event");
    }
  }
}

export default EventController;