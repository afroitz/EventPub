import { DbEvent } from "../db/schema";

class EventService {
  /**
   * Returns an ActivityPub representation of an event
   */
  public getApEvent(event: DbEvent) {
    return {
      type: "Event",
      id: event.federationId,
      attributedTo: event.attributedTo,
      name: event.name,
      content: event.content,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      accepted: "IMPLEMENT",
      rejected: "IMPLEMENT",
      published: event.published,
      updated: event.updated,
    };
  }

  /**
   * Returns an ActivityPub representation of an event wrapped in a Create activity
   */
  public getApCreateEvent(event: DbEvent) {
    const apEvent = this.getApEvent(event);

    return {
      "@context": "https://www.w3.org/ns/activitystreams",
      type: "Create",
      id: event.federationId,
      actor: event.attributedTo,
      object: apEvent,
    };
  }
}

export default EventService;
