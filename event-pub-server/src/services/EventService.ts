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
      accepted: event.accepted,
      rejected: event.rejected,
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

  /**
   * Returns an ActivityPub representation of an event wrapped in an Accept activity
   */
  public getApAcceptEvent(eventId: string, actorId: string) {
    return {
      "@context": "https://www.w3.org/ns/activitystreams",
      type: "Accept",
      id: eventId,
      actor: actorId,
      object: {
        id: eventId,
        type: "Event",
        attributedTo: actorId,
      }
    };
  }

  /**
   * Returns an ActivityPub representation of an event wrapped in a Reject activity
   */
  public getApRejectEvent(eventId: string, actorId: string) {
    return {
      "@context": "https://www.w3.org/ns/activitystreams",
      type: "Reject",
      id: eventId,
      actor: actorId,
      object: {
        id: eventId,
        type: "Event",
        attributedTo: actorId,
      }
    };
  }

  /**
   * Returns an ActivityPub representation of an event wrapped in an Accept and an Undo activity
   */
  public getApUndoAcceptEvent(eventId: string, actorId: string) {
    return {
      "@context": "https://www.w3.org/ns/activitystreams",
      type: "Undo",
      id: eventId,
      actor: actorId,
      object: this.getApAcceptEvent(eventId, actorId),
    };
  }

  /**
   * Returns an ActivityPub representation of an event wrapped in a Reject and an Undo activity
   */
  public getApUndoRejectEvent(eventId: string, actorId: string) {
    return {
      "@context": "https://www.w3.org/ns/activitystreams",
      type: "Undo",
      id: eventId,
      actor: actorId,
      object: this.getApRejectEvent(eventId, actorId),
    };
  }

  /**
   * Returns an ActivityPub representation of an event wrapped in an Update activity
   */
  public getApUpdateEvent(event: DbEvent) {
    const apEvent = this.getApEvent(event);

    return {
      "@context": "https://www.w3.org/ns/activitystreams",
      type: "Update",
      id: event.federationId,
      actor: event.attributedTo,
      object: apEvent,
    };
  }

  /**
   * Returns the event's federation ID
   * @param eventId
   */
  public getEventFederationId(eventId: string){
    return `${process.env.APP_URL}/events/${eventId}`
  }
}

export default EventService;
