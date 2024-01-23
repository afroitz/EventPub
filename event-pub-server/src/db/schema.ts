import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { text, pgSchema, timestamp, serial, uuid, jsonb } from "drizzle-orm/pg-core";

export const eventPubSchema = pgSchema("event_pub_schema")
export const dbEvents = eventPubSchema.table('events', {
  context: text('context'),
  id: uuid('id').primaryKey(),
  federationId: text('federation_id').notNull(), // TODO: Separate internal and external ID
  type: text('type'),
  attributedTo: text('attributed_to'),
  name: text('name'),
  content: text('content'),
  startTime: text('start_time'),
  endTime: text('end_time'),
  location: text('location'),
  accepted: text('accepted'),
  rejected: text('rejected'),
  published: timestamp('created').defaultNow(),
  updated: timestamp('updated').defaultNow(),
});

export type NewEvent = InferInsertModel<typeof dbEvents>;
export type DbEvent = InferSelectModel<typeof dbEvents>;

export const dbUsers = eventPubSchema.table('users', {
  id: serial('id').primaryKey(),
  created: timestamp('created').defaultNow(),
  updated: timestamp('updated').defaultNow(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
});

export type DbUser = InferSelectModel<typeof dbUsers>;
export type NewUser = InferInsertModel<typeof dbUsers>;

export const dbServers = eventPubSchema.table('servers', {
  id: uuid('id').primaryKey(),
  created: timestamp('created').defaultNow(),
  updated: timestamp('updated').defaultNow(),
  inbox: text('inbox').notNull(),
});

export type NewServer = InferInsertModel<typeof dbServers>;

export const dbActivityQueue = eventPubSchema.table('activity_queue', {
  id: serial('id').primaryKey(),
  created: timestamp('created').defaultNow(),
  updated: timestamp('updated').defaultNow(),
  activity: jsonb('activity').notNull(),
  publishTo: text('publish_to').notNull(), /* Stringified list of ids of servers to publish to. Should be refactored to many-to-many table */ 
});