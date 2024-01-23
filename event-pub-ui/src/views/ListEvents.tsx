import { useEffect, useState } from "react";

type Event = {
  data: {
    id: string;
    name: string;
    content: string;
    startTime: string;
    endTime: string;
    location: string;
  };
  isOwner: boolean;
  rsvpStatus: "accepted" | "rejected" | "none";
};

const EventsListItem: React.FC<{ event: Event }> = ({ event }) => {
  const handleRsvp = async (action: string, eventId: string) => {
    try {
      const response = await fetch(process.env.REACT_APP_API_URL + "/rsvp/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: action, id: eventId }),
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      window.location.reload();
    } catch (error) {
      console.error("RSVP failed:", error);
    }
  };

  return (
    <li className="list-event">
      <h3>{event.data.name}</h3>
      {event.rsvpStatus !== "none" && (
        <p className={`list-event-rsvp-status ${event.rsvpStatus}`}>
          You have {event.rsvpStatus} this event
        </p>
      )}
      <div className="list-event-body">
        <div className="list-event-left">
          <p>
            <b>From:</b> {new Date(event.data.startTime).toLocaleString()}
          </p>
          <p>
            <b>To:</b> {new Date(event.data.endTime).toLocaleString()}
          </p>
          <p>
            <b>Location:</b> {event.data.location}
          </p>
        </div>
        <div className="list-event-right">
          <p>{event.data.content}</p>
        </div>
      </div>
      <div className="list-event-buttons">
        {event.isOwner && (
          <button
            className="list-event-button edit"
            onClick={() => {
              window.location.href = `/events/${event.data.id}`;
            }}
          >
            Edit
          </button>
        )}
        {event.rsvpStatus === "accepted" && (
          <button
            className="list-event-button"
            onClick={() => {
              handleRsvp("undo-accept", event.data.id);
            }}
          >
            Undo Accept
          </button>
        )}
        {event.rsvpStatus === "rejected" && (
          <button
            className="list-event-button"
            onClick={() => {
              handleRsvp("undo-reject", event.data.id);
            }}
          >
            Undo Reject
          </button>
        )}
        {event.rsvpStatus === "none" && (
          <>
            <button
              className="list-event-button accept"
              onClick={() => {
                handleRsvp("accept", event.data.id);
              }}
            >
              Accept
            </button>
            <button
              className="list-event-button reject"
              onClick={() => {
                handleRsvp("reject", event.data.id);
              }}
            >
              Reject
            </button>
          </>
        )}
      </div>
    </li>
  );
};

const ListEvents: React.FC = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(process.env.REACT_APP_API_URL + "/list", {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Fetching events failed:", error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <>
      <h2>Events</h2>
      <ul className="events-list">
        {events.map((event: Event) => (
          <EventsListItem key={event.data.id} event={event} />
        ))}
      </ul>
    </>
  );
};

export default ListEvents;
