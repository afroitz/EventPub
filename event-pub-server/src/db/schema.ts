import { serial, text, pgSchema } from "drizzle-orm/pg-core";

export const eventPubSchema = pgSchema("event_pub_schema")
export const eventPubEvents = eventPubSchema.table('events', {
  id: serial('id').primaryKey(),
  name: text('name'),
});

