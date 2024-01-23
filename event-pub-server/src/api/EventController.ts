import { NextFunction, Request, Response } from "express";
import EventRepository from "../db/EventRepository";
// import { uuid } from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from "uuid";
import EventService from "../services/EventService";
import UserService from "../services/UserService";
import { db } from "../db/db";
import { dbActivityQueue } from "../db/schema";

class EventController {
  repository: EventRepository;
  eventService: EventService;
  userService: UserService;

  constructor() {
    this.repository = new EventRepository();
    this.eventService = new EventService();
    this.userService = new UserService();
  }

  public listEvents = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const events = await this.repository.list();

      // check whether user is owner of event and add this info to response
      const responseData = events.map((event) => {
        return {
          isOwner:
            event.attributedTo ==
            `${process.env.APP_URL}/users/${req.session.user?.username}`,
          data: event,
        };
      });

      res.status(200).send(responseData);
    } catch (e) {
      console.log(e);
      return res.status(500).send("error listing events");
    }
  };

  public receiveEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("receiving event".toUpperCase());

      const { context: context, type: type, actor: attributedTo } = req.body;

      console.log("received event:".toUpperCase());
      console.log("context:", context);
      console.log("type:", type);
      console.log("attributedTo:", attributedTo);

      if (type == "Create") {
        console.log("received create event");
        await this.handleCreate(req, res, next);
      }
      if (type == "Update") {
        console.log("received update event");
        await this.handleUpdate(req, res, next);
      }
      if (type == "Accept") {
        console.log("received accept event");
        await this.handleAccept(req, res, next);
      }
      if (type == "Reject") {
        console.log("received reject event");
        await this.handleReject(req, res, next);
      }
      if (type == "Undo") {
        console.log("received delete event");
        //await this.handleUndo(req, res, next);
      }
      if (type == "Delete") {
        console.log("received delete event");
        await this.handleDelete(req, res, next);
      }
    } catch (e) {
      console.log("error receiving event");
      console.log(e);
    }
  };

  public handleCreate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("processing create event".toUpperCase());

      const {
        actor: attributedTo,
        object: {
          id: id,
          name: name,
          content: content,
          startTime: startTime,
          endTime: endTime,
          location: location,
          accepted: accepted,
          rejected: rejected,
          published: published,
          updated: updated,
        },
      } = req.body;

      console.log("id:", id);
      console.log("attributedTo:", attributedTo);
      console.log("name:", name);
      console.log("content:", content);
      console.log("startTime:", startTime);
      console.log("endTime:", endTime);
      console.log("location:", location);
      console.log("accepted:", accepted);
      console.log("rejected:", rejected);
      console.log("published:", published);
      console.log("updated:", updated);

      try {
        await this.repository.create({
          id: uuidv4(),
          federationId: id,
          attributedTo: attributedTo,
          name: name,
          content: content,
          startTime: startTime,
          endTime: endTime,
          location: location,
          accepted: accepted,
          rejected: rejected,
          published: published,
          updated: updated,
        });
        console.log("event saved in db");
      } catch (e) {
        console.log("error saving event in db");
        console.log(e);
      }

      //console.log('req:', req);
      res.status(200).send("Event created");
    } catch (e) {
      console.error(e);
      res.status(500).send("Error creating event");
    }
  };

  public handleUpdate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("processing update event".toUpperCase());

      const {
        actor: attributedTo,
        object: {
          id: id,
          name: name,
          content: content,
          startTime: startTime,
          endTime: endTime,
          location: location,
          accepted: accepted,
          rejected: rejected,
          published: published,
          updated: updated,
        },
      } = req.body;

      console.log("id:", id);
      console.log("attributedTo:", attributedTo);
      console.log("name:", name);
      console.log("content:", content);
      console.log("startTime:", startTime);
      console.log("endTime:", endTime);
      console.log("location:", location);
      console.log("accepted:", accepted);
      console.log("rejected:", rejected);
      console.log("published:", published);
      console.log("updated:", updated);

      try {
        await this.repository.update({
          id: uuidv4(),
          federationId: id,
          attributedTo: attributedTo,
          name: name,
          content: content,
          startTime: startTime,
          endTime: endTime,
          location: location,
          accepted: accepted,
          rejected: rejected,
          published: published,
          updated: updated,
        });
        console.log("event updated in db");
      } catch (e) {
        console.log("error updating event in db");
        console.log(e);
      }

      res.status(200).send("Event updated");
    } catch (e) {
      console.error(e);
      res.status(500).send("Error updating event");
    }
  };

  public handleDelete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("processing delete event".toUpperCase());

      const {
        object: { id: id, name: name },
      } = req.body;

      try {
        await this.repository.delete(id);
      } catch (e) {
        console.log("error deleting event ${id}");
        console.log(e);
      }

      res.status(200).send("Event deleted");
    } catch (e) {
      console.error(e);
      res.status(500).send("Error deleting event");
    }
  };

  public handleAccept = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("processing accept event".toUpperCase());

      const {
        actor: actor,
        object: { id: id },
      } = req.body;

      try {
        // get event from db
        const accepted_event = await this.repository.getEvent(id);

        if(!accepted_event){
          throw new Error("Event not found");
        }

        // add actor to accepted
        console.log("Adding actor to accepted");
        accepted_event.accepted = accepted_event.accepted + ", " + actor;

        // update event in db
        await this.repository.update({
          id: uuidv4(),
          federationId: id,
          attributedTo: accepted_event.attributedTo,
          name: accepted_event.name,
          content: accepted_event.content,
          startTime: accepted_event.startTime,
          endTime: accepted_event.endTime,
          location: accepted_event.location,
          accepted: accepted_event.accepted,
          rejected: accepted_event.rejected,
          published: accepted_event.published,
          updated: accepted_event.updated,
        });
      } catch (e) {
        console.log("error updating event");
        console.log(e);
      }

      res.status(200).send("Accepted invitation added");
    } catch (e) {
      console.error(e);
      res.status(500).send("Error accepting invite");
    }
  };

  public handleReject = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("processing reject event".toUpperCase());

      const {
        actor: actor,
        object: { id: id },
      } = req.body;

      try {
        // get event from db
        const accepted_event = await this.repository.getEvent(id);

        if(!accepted_event){
          throw new Error("Event not found");
        }

        // add actor to acceptedx
        console.log("Adding actor to rejected");
        accepted_event.rejected = accepted_event.rejected + ", " + actor;

        console.log("updated event:", accepted_event);

        // update event in db
        await this.repository.update({
          id: uuidv4(),
          federationId: id,
          attributedTo: accepted_event.attributedTo,
          name: accepted_event.name,
          content: accepted_event.content,
          startTime: accepted_event.startTime,
          endTime: accepted_event.endTime,
          location: accepted_event.location,
          accepted: accepted_event.accepted,
          rejected: accepted_event.rejected,
          published: accepted_event.published,
          updated: accepted_event.updated,
        });
      } catch (e) {
        console.log("error updating event");
        console.log(e);
      }

      res.status(200).send("Rejected invitation added");
    } catch (e) {
      console.error(e);
      res.status(500).send("Error rejecting invite");
    }
  };

  public createEvent = async (req: Request, res: Response) => {
    try {
      // parse event data from request body
      const {
        name: name,
        content: content,
        startTime: startTime,
        endTime: endTime,
        location: location,
      } = req.body;

      // create event in db
      const newId = uuidv4();

      const newEvent = (
        await this.repository.create({
          id: newId,
          context: "our cool context",
          type: "Event",
          attributedTo: this.userService.getUserFederationId(req.session.user?.username),
          federationId: `${process.env.APP_URL}/events/${newId}`,
          name: name,
          content: content,
          startTime: startTime,
          endTime: endTime,
          location: location,
          accepted: "accepted",
          rejected: "rejected",
        })
      )[0];

      // make create activity and save to activity queue
      const createActivity = this.eventService.getApCreateEvent(newEvent);
      const serverIds = (await db.query.dbServers.findMany()).map(s => s.id);

      await db.insert(dbActivityQueue).values({
        activity: createActivity,
        publishTo: JSON.stringify(serverIds),
      });

      console.log("CREATE ACTIVITY:")
      console.log(JSON.stringify(createActivity, null, 2));
      res.status(200).send("event created");
    } catch (e) {
      console.log(e);
      res.status(500).send("error creating event");
    }
  };

  public get = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const event = await this.repository.getEvent(id);
      
      if (!event) {
        return res.status(404).send('Event not found');
      }
      
      const apEvent = this.eventService.getApEvent(event);
      return res.status(200).send(apEvent);
    } catch (error) {
      console.log(error);
      res.status(500).send("Error getting user");
    }
  }
}

export default EventController;
