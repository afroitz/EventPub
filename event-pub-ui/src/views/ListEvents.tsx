import { useEffect, useState } from "react";

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
            <li key={event.id}>
              <h3>{event.name}</h3>
              <p>{event.start_time}</p>
            </li>
          ))}
        </ul>
    </>
  );
};

export default ListEvents;
