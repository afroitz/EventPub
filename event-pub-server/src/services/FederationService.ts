import { db } from "../db/db";
import { NewEvent, dbActivityQueue, dbEvents } from "../db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import EventService from "./EventService";

class FederationService {

  eventService: EventService;

  constructor() {
    this.eventService = new EventService();
  }

  handleCreate = async (activity: any) => {
    try {
      console.log("processing create event".toUpperCase());

      if(activity.type !== "Create") {
        throw new Error("Wrong activity type");
      }

      // parse event data and store in db
      const newEvent: NewEvent = {
        id: uuidv4(),
        federationId: activity.object.id,
        isInternal: false,
        attributedTo: activity.actor,
        name: activity.object.name,
        content: activity.object.content,
        startTime: activity.object.startTime,
        endTime: activity.object.endTime,
        location: activity.object.location,
        accepted: activity.object.accepted,
        rejected: activity.object.rejected,
      };

      await db.insert(dbEvents).values(newEvent)
    } catch (e) {
      console.log("Error creating event".toUpperCase());
      console.log(e)
      throw new Error("Error creating event");
    }
  };

  handleUpdate = async (activity: any) => {
    try {
      console.log("processing update event".toUpperCase());

      if(activity.type !== "Update") {
        throw new Error("Wrong activity type");
      }

      // check if event exists in db
      const event = await db.query.dbEvents.findFirst({
        where: eq(dbEvents.federationId, activity.object.id)
      });

      if(!event) {
        throw new Error("Event not found");
      }

      if(event.isInternal){
        throw new Error("Event is internal");
      }

      if(event.attributedTo !== activity.actor) {
        throw new Error("Actor not authorized to update event");
      }

      await db.update(dbEvents).set({
        name: activity.object.name,
        content: activity.object.content,
        startTime: activity.object.startTime,
        endTime: activity.object.endTime,
        location: activity.object.location,
        accepted: activity.object.accepted,
        rejected: activity.object.rejected,
        updated: new Date()
      }).where(eq(dbEvents.federationId, activity.object.id));

    } catch (e) {
      console.log("Error updating event".toUpperCase());
      console.log(e)
      throw new Error("Error updating event");
    }
  };

  handleAccept = async (activity: any) => {
    try {
      console.log("processing accept event".toUpperCase());

      if(activity.type !== "Accept") {
        throw new Error("Wrong activity type");
      }

      // check if event exists in db
      const event = await db.query.dbEvents.findFirst({
        where: eq(dbEvents.federationId, activity.object.id)
      });

      if(!event) {
        throw new Error("Event not found");
      }

      if(!event.isInternal){
        throw new Error("Event is external");
      }

      if(event.accepted.includes(activity.actor)) {
        throw new Error("Actor already accepted event");
      }

      // add actor to accepted and remove from rejected if present
      const accepted = [...event.accepted, activity.actor];
      const rejected = event.rejected.filter((u: string) => u !== activity.actor);

      const updatedEvent = (await db.update(dbEvents).set({
        accepted: accepted,
        rejected: rejected,
        updated: new Date()
      }).where(eq(dbEvents.federationId, activity.object.id)).returning())[0];

      // make update activity and save to activity queue
      const updateActivity = this.eventService.getApUpdateEvent(updatedEvent);
      const serverIds = (await db.query.dbServers.findMany()).map((s) => s.id);

      await db.insert(dbActivityQueue).values({
        activity: updateActivity,
        publishTo: JSON.stringify(serverIds),
      });

    } catch (e) {
      console.log("Error accepting event".toUpperCase());
      console.log(e)
      throw new Error("Error accepting event");
    }
  };

  handleReject = async (activity: any) => {
    try {
      console.log("processing reject event".toUpperCase());

      if(activity.type !== "Reject") {
        throw new Error("Wrong activity type");
      }

      // check if event exists in db
      const event = await db.query.dbEvents.findFirst({
        where: eq(dbEvents.federationId, activity.object.id)
      });

      if(!event) {
        throw new Error("Event not found");
      }

      if(!event.isInternal){
        throw new Error("Event is external");
      }

      if(event.rejected.includes(activity.actor)) {
        throw new Error("Actor already rejected event");
      }

      // add actor to rejected and remove from accepted if present
      const rejected = [...event.rejected, activity.actor];
      const accepted = event.accepted.filter((u: string) => u !== activity.actor);

      const updatedEvent = (await db.update(dbEvents).set({
        accepted: accepted,
        rejected: rejected,
        updated: new Date()
      }).where(eq(dbEvents.federationId, activity.object.id)).returning())[0];

      // make update activity and save to activity queue
      const updateActivity = this.eventService.getApUpdateEvent(updatedEvent);
      const serverIds = (await db.query.dbServers.findMany()).map((s) => s.id);

      await db.insert(dbActivityQueue).values({
        activity: updateActivity,
        publishTo: JSON.stringify(serverIds),
      });

    } catch (e) {
      console.log("Error rejecting event".toUpperCase());
      console.log(e)
      throw new Error("Error rejecting event");
    }
  }

  handleUndoAccept = async (activity: any) => {
    try {
      console.log("processing undo accept event".toUpperCase());

      if(activity.type !== "Undo" || activity.object.type !== "Accept") {
        throw new Error("Wrong activity type");
      }

      // check if event exists in db
      const event = await db.query.dbEvents.findFirst({
        where: eq(dbEvents.federationId, activity.object.id)
      });

      if(!event) {
        throw new Error("Event not found");
      }

      if(!event.isInternal){
        throw new Error("Event is external");
      }

      if(!event.accepted.includes(activity.actor)) {
        throw new Error("Actor has not accepted event");
      }

      // remove actor from accepted
      const accepted = event.accepted.filter((u: string) => u !== activity.actor);

      const updatedEvent = (await db.update(dbEvents).set({
        accepted: accepted,
        updated: new Date()
      }).where(eq(dbEvents.federationId, activity.object.id)).returning())[0];

      // make update activity and save to activity queue
      const updateActivity = this.eventService.getApUpdateEvent(updatedEvent);
      const serverIds = (await db.query.dbServers.findMany()).map((s) => s.id);

      await db.insert(dbActivityQueue).values({
        activity: updateActivity,
        publishTo: JSON.stringify(serverIds),
      });

    } catch (e) {
      console.log("Error undoing accept event".toUpperCase());
      console.log(e)
      throw new Error("Error undoing accept event");
    }
  }

  handleUndoReject = async (activity: any) => {
    try {
      console.log("processing undo reject event".toUpperCase());

      if(activity.type !== "Undo" || activity.object.type !== "Reject") {
        throw new Error("Wrong activity type");
      }

      // check if event exists in db
      const event = await db.query.dbEvents.findFirst({
        where: eq(dbEvents.federationId, activity.object.id)
      });

      if(!event) {
        throw new Error("Event not found");
      }

      if(!event.isInternal){
        throw new Error("Event is external");
      }

      if(!event.rejected.includes(activity.actor)) {
        throw new Error("Actor has not rejected event");
      }

      // remove actor from rejected
      const rejected = event.rejected.filter((u: string) => u !== activity.actor);

      const updatedEvent = (await db.update(dbEvents).set({
        rejected: rejected,
        updated: new Date()
      }).where(eq(dbEvents.federationId, activity.object.id)).returning())[0];

      // make update activity and save to activity queue
      const updateActivity = this.eventService.getApUpdateEvent(updatedEvent);
      const serverIds = (await db.query.dbServers.findMany()).map((s) => s.id);

      await db.insert(dbActivityQueue).values({
        activity: updateActivity,
        publishTo: JSON.stringify(serverIds),
      });

    } catch (e) {
      console.log("Error undoing reject event".toUpperCase());
      console.log(e)
      throw new Error("Error undoing reject event");
    }
  }
}

export default FederationService;
