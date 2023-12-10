import { dbEvents } from "./schema";
import { db } from "./db";

type NewEvent = typeof dbEvents.$inferInsert;

class EventRepository {

  async create(event: NewEvent){
    return db.insert(dbEvents).values(event)
  }
}

export default EventRepository;