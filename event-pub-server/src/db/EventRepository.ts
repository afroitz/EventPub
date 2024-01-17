import { dbEvents } from "./schema";
import { db } from "./db";
import { eq } from "drizzle-orm";


type NewEvent = typeof dbEvents.$inferInsert;
type EventId = Pick<typeof dbEvents, 'id'>;


class EventRepository {

  async create(event: NewEvent){
    return db.insert(dbEvents).values(event)
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
  
  async delete(eventId: EventId) {
    return await db.delete(dbEvents).where(eq(dbEvents.id, eventId.id));
  }

  async getEvent(eventId: EventId) {
    console.log('getting event from db');
    const row = await db.select().from(dbEvents).where(eq(dbEvents.id, eventId.id));
    return row;
  }

  async list(){
    return await db.query.dbEvents.findMany();
  }
}

export default EventRepository;