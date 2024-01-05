import { dbUsers } from "./schema";
import { db } from "./db";

type NewUser = typeof dbUsers.$inferInsert;

class EventRepository {

  async create(user: NewUser){
    return db.insert(dbUsers).values(user)
  }
}

export default EventRepository;