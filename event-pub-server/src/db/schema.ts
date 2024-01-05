import { text, pgSchema, timestamp, serial } from "drizzle-orm/pg-core";

export const eventPubSchema = pgSchema("event_pub_schema")
export const dbEvents = eventPubSchema.table('events', {
  context: text('context'),
  id: text('id').primaryKey(),
  type: text('type'),
  attributedTo: text('attributed_to'),
  name: text('name'),
  content: text('content'),
  startTime: text('start_time'),
  endTime: text('end_time'),
  location: text('location'),
  accepted: text('accepted'),
  rejected: text('rejected'),
  published: text('published'),
  updated: text('updated'),
});

export const dbUsers = eventPubSchema.table('users', {
  id: serial('id').primaryKey(),
  created: timestamp('created').defaultNow(),
  updated: timestamp('updated').defaultNow(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
});

export const dbServers = eventPubSchema.table('servers', {
  id: text('id').primaryKey(),
  created: timestamp('created'),
  updated: timestamp('updated'),
  inbox: text('inbox'),
});