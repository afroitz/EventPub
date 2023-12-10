import { serial, text, pgSchema, timestamp } from "drizzle-orm/pg-core";

export const eventPubSchema = pgSchema("event_pub_schema")
export const dbEvents = eventPubSchema.table('events', {
  id: serial('id').primaryKey(),
  created: timestamp("created_at"),
  updated: timestamp("updated_at"),
  title: text('title'),
  summary: text('summary'),
});