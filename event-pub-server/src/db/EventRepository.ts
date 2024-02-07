import { dbEvents, NewEvent } from "./schema";
import { db } from "./db";
import { eq } from "drizzle-orm";


class EventRepository {

  async create(event: NewEvent) {
    return db.insert(dbEvents).values(event).returning();
  }

  async update(event: NewEvent){
    return db.insert(dbEvents).values(event).onConflictDoUpdate({
      target: dbEvents.id, 
      set: {name: event.name, 
        content: event.content,
        startTime: event.startTime, 
        endTime: event.endTime, 
        location: event.location, 
        accepted: event.accepted, 
        rejected: event.rejected, 
        published: event.published, 
        updated: event.updated}});
  }
  
  async delete(eventId: string) {
    return await db.delete(dbEvents).where(eq(dbEvents.id, eventId));
  }

  async getEvent(eventId: string) {
    return await db.query.dbEvents.findFirst({
      where: eq(dbEvents.id, eventId)
    });
  }

  async list(){
    return await db.query.dbEvents.findMany();
  }
}

export default EventRepository;