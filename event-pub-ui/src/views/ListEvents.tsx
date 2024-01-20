import { useEffect, useState } from "react";

const ListItem: React.FC<{ event: any }> = ({ event }) => {
  return (
    <li>
      <h3>{event.data.name}</h3>
      <p>{event.data.start_time}</p>
    </li>
  );
}

const ListEvents: React.FC = () => {

  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(process.env.REACT_APP_API_URL + '/list', { credentials: 'include' });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Fetching events failed:', error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <>
        <h2>Events</h2>
        <ul>
          {events.map((event: any) => (
            <li key={event.data.id}>
              <h3>{event.data.name}</h3>
              <p>{event.data.start_time}</p>
            </li>
          ))}
        </ul>
    </>
  );
};

export default ListEvents;
