import { Request, Response } from "express";
import EventRepository from "../db/EventRepository";
import { v4 as uuidv4 } from "uuid";
import EventService from "../services/EventService";
import UserService from "../services/UserService";
import { db } from "../db/db";
import { dbActivityQueue, dbEvents } from "../db/schema";
import { eq } from "drizzle-orm";
import { Feed } from "feed";

class EventController {
  repository: EventRepository;
  eventService: EventService;
  userService: UserService;

  constructor() {
    this.repository = new EventRepository();
    this.eventService = new EventService();
    this.userService = new UserService();
  }

  public list = async (
    req: Request,
    res: Response,
  ) => {
    try {
      const events = await this.repository.list();

      const currUserId = `${process.env.APP_URL}/users/${req.session.user?.username}`;

      // check whether user is owner of event and add this info to response
      const responseData = events.map((event) => {
        const currUserAccepted = event.accepted.includes(currUserId);
        const currUserRejected = event.rejected.includes(currUserId);

        return {
          isOwner: event.attributedTo === currUserId,
          data: event,
          rsvpStatus: currUserAccepted
            ? "accepted"
            : currUserRejected
            ? "rejected"
            : "none", // This would fail if user is both accepted and rejected. That should never happen.
        };
      });

      res.status(200).send(responseData);
    } catch (e) {
      console.log(e);
      return res.status(500).send("error listing events");
    }
  };

  public create = async (req: Request, res: Response) => {
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
          attributedTo: this.userService.getUserFederationId(
            req.session.user?.username
          ),
          federationId: `${process.env.APP_URL}/events/${newId}`,
          name: name,
          content: content,
          startTime: startTime,
          endTime: endTime,
          location: location,
          accepted: [],
          rejected: [],
          isInternal: true,
        })
      )[0];

      // make create activity and save to activity queue
      const createActivity = this.eventService.getApCreateEvent(newEvent);
      const serverIds = (await db.query.dbServers.findMany()).map((s) => s.id);

      await db.insert(dbActivityQueue).values({
        activity: createActivity,
        publishTo: JSON.stringify(serverIds),
      });

      console.log("CREATE ACTIVITY:");
      console.log(JSON.stringify(createActivity, null, 2));
      res.status(200).send("event created");
    } catch (e) {
      console.log(e);
      res.status(500).send("error creating event");
    }
  };

  public rsvp = async (req: Request, res: Response) => {
    try {
      const { id, action } = req.body;

      // get event from db
      const event = await this.repository.getEvent(id);

      if (!event) {
        return res.status(404).send("Event not found");
      }

      // get user federation id
      const currUserId = this.userService.getUserFederationId(
        req.session.user?.username
      );

      // check whether event is internal
      if (event.isInternal) {

        // add user to accepted or rejected
        if (action === "accept") {
          event.accepted = [...new Set([...event.accepted, currUserId])];
          event.rejected = event.rejected.filter((u) => u !== currUserId);
        } else if (action === "reject") {
          event.rejected = [...new Set([...event.rejected, currUserId])];
          event.accepted = event.accepted.filter((u) => u !== currUserId);
        } else if (action === "undo-accept") {
          event.accepted = event.accepted.filter((u) => u !== currUserId);
        } else if (action === "undo-reject") {
          event.rejected = event.rejected.filter((u) => u !== currUserId);
        }

        const updatedEvent = (await db
          .update(dbEvents)
          .set({
            accepted: event.accepted,
            rejected: event.rejected,
          })
          .where(eq(dbEvents.id, event.id)).returning())[0];

        // make update activity and save to activity queue
        const updateActivity = this.eventService.getApUpdateEvent(updatedEvent);
        const serverIds = (await db.query.dbServers.findMany()).map((s) => s.id);

        await db.insert(dbActivityQueue).values({
          activity: updateActivity,
          publishTo: JSON.stringify(serverIds),
        });
        
      } else {
        // event is external. Make corresponding activity and send to server of origin
        let activity = null;

        if (action === "accept") {
          activity = this.eventService.getApAcceptEvent(event.federationId, currUserId);
        } else if (action === "reject") {
          activity = this.eventService.getApRejectEvent(event.federationId, currUserId);
        } else if (action === "undo-accept") {
          activity = this.eventService.getApUndoAcceptEvent(event.federationId, currUserId);
        } else if (action === "undo-reject") {
          activity = this.eventService.getApUndoRejectEvent(event.federationId, currUserId);
        }

        // find server to which the event was published
        const userServerDomain = this.userService.getUserServerUrl(event.attributedTo)
        const servers = await db.query.dbServers.findMany();

        const userServer = servers.find((s) => {
          return userServerDomain === s.inbox.split("/").slice(0, 3).join("/");
        });

        if(!userServer) {
          throw new Error("Server not found");
        }

        // queue activity to be sent to server
        await db.insert(dbActivityQueue).values({
          activity: activity,
          publishTo: JSON.stringify([userServer.id]),
        });
        
      }
        
    } catch (error) {
      console.log(error);
      res.status(500).send("Error updating event");
    }
  };

  public get = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const event = await this.repository.getEvent(id);

      if (!event) {
        return res.status(404).send("Event not found");
      }

      const apEvent = this.eventService.getApEvent(event);
      return res.status(200).send(apEvent);
    } catch (error) {
      console.log(error);
      res.status(500).send("Error getting user");
    }
  };

  public getAccepted = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const event = await this.repository.getEvent(id);

      if (!event) {
        return res.status(404).send("Event not found");
      }

      const accepted = this.eventService.getApEventAccepted(event)
      return res.status(200).send(accepted);
    } catch (error) {
      console.log(error);
      res.status(500).send("Error getting accepted users");
    }
  }

  public getRejected = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const event = await this.repository.getEvent(id);

      if (!event) {
        return res.status(404).send("Event not found");
      }

      const rejected = this.eventService.getApEventRejected(event)
      return res.status(200).send(rejected);
    } catch (error) {
      console.log(error);
      res.status(500).send("Error getting rejected users");
    }
  }

  getFeed = async (req: Request, res: Response) => {
    try {
      // create feed
      const feed = new Feed({
        title: "Event Feed",
        description:
          "This is an amazing feed informing you about events.",
        id: process.env.APP_URL + "/feed",
        link: process.env.APP_URL + "/feed",
        language: "en",
        copyright: "2024"
      });

      // get events from db
      const events = await this.repository.list();

      events.forEach((event) => {
        feed.addItem({
          title: event.name?? '',
          id: "urn:uuid:" + event.id,
          link: event.federationId,
          author: [{ name: event.attributedTo }],
          date: event.updated?? new Date(),
          description: event.content?? '',
          published: event.published?? new Date(),
        });

      });
      res.set("Content-Type", "application/atom+xml");
      res.send(feed.atom1());
    } catch (e) {
      console.log(e);
      res.status(400).send("error requesting feed");
    }
  }
}

export default EventController;
