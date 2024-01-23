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
  const accept = async () => {
    console.log("accepting event");
  };

  const reject = async () => {
    console.log("rejecting event");
  };

  const undoAccept = async () => {
    console.log("undoing accept event");
  };

  const undoReject = async () => {
    console.log("undoing reject event");
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
              undoAccept();
            }}
          >
            Undo Accept
          </button>
        )}
        {event.rsvpStatus === "rejected" && (
          <button
            className="list-event-button"
            onClick={() => {
              undoReject();
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
                accept();
              }}
            >
              Accept
            </button>
            <button
              className="list-event-button reject"
              onClick={() => {
                reject();
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
