import { CronJob } from "cron";
import { db } from "../db/db";
import { dbActivityQueue } from "../db/schema";
import { eq } from "drizzle-orm";

const CRON_TIME = "*/10 * * * * *"; // every 10 seconds
const VERBOSE = true;

async function publishActivities() {
  VERBOSE && console.log("Publishing activities...");

  // load activities from database
  const activities = await db
    .select()
    .from(dbActivityQueue)
    .orderBy(dbActivityQueue.created);

  if (activities.length === 0) {
    VERBOSE && console.log("\tNo activities found");
    return;
  }

  // load servers from database
  const servers = await db.query.dbServers.findMany();

  // publish activities
  for (const activity of activities) {
    const activityObj = activity.activity;
    let publishTo = JSON.parse(activity.publishTo);

    for (const server of servers) {
      if (publishTo.includes(server.id)) {
        VERBOSE && console.log(`\tPublishing activity to ${server.id}`);
        try {
          await fetch(server.inbox, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(activityObj),
          });

          // remove server from publishTo list
          publishTo = publishTo.filter((id: string) => id !== server.id);
          VERBOSE && console.log(`\t\tPublishing to ${server.id} complete`);
        } catch (e) {
          VERBOSE && console.log(`\t\tPublishing to ${server.id} failed: ${e}`);
        }
      }
    }

    if (publishTo.length === 0) {
      // remove activity from queue
      await db
        .delete(dbActivityQueue)
        .where(eq(dbActivityQueue.id, activity.id));
    } else {
      // update publishTo list
      await db
        .update(dbActivityQueue)
        .set({
          publishTo: JSON.stringify(publishTo),
          updated: new Date(),
        })
        .where(eq(dbActivityQueue.id, activity.id));
    }
  }
}

export function setupPublishJob() {
  new CronJob(
    CRON_TIME,
    publishActivities,
    null, // onComplete
    true, // start
    Intl.DateTimeFormat().resolvedOptions().timeZone // timeZone
  );
}
