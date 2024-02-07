import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { text, pgSchema, timestamp, serial, uuid, jsonb, boolean } from "drizzle-orm/pg-core";

export const eventPubSchema = pgSchema("event_pub_schema")
export const dbEvents = eventPubSchema.table('events', {
  id: uuid('id').primaryKey(),
  isInternal: boolean('is_internal'), // Whether the event was created by a local user or received from a federated server
  federationId: text('federation_id').notNull().unique(), // The id of the event in the federated network
  attributedTo: text('attributed_to').notNull(), // The id of the user who created the event
  name: text('name'), // The name of the event
  content: text('content'), // The description of the event
  startTime: text('start_time'), // The start time of the event
  endTime: text('end_time'), // The end time of the event
  location: text('location'), // The location of the event
  accepted: jsonb('accepted').$type<string[]>().notNull(), // The list of federation ids of users who have accepted the event. Should be mutually exclusive with rejected.
  rejected: jsonb('rejected').$type<string[]>().notNull(), // The list of federation ids of users who have rejected the event Should be mutually exclusive with accepted.
  published: timestamp('created').defaultNow(), // The time the event was created in the local database
  updated: timestamp('updated').defaultNow(), // The time the event was last updated in the local database
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