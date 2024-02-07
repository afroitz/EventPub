import React, { useEffect, useState } from "react";
import * as xmlbuilder2 from "xmlbuilder2";

const FeedEvents: React.FC = () => {
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

  const generateAtomFeed = () => {
    if (!events || events.length === 0) {
      console.error('No events to generate feed.');
      return;
    }

    const feed = xmlbuilder2.create({
      version: '1.0',
      encoding: 'UTF-8',
    }).ele({
      rss: {
        '@version': '2.0',
        channel: {
          title: 'ATOM Feed',
          link: 'http://example.com/feed',
          description: 'Latest events feed',
          lastBuildDate: new Date().toUTCString(),
          item: events.map((event: any) => ({
            title: { '#text': event.name || 'Event Title' },
            link: { '#text': `http://example.com/events/${event.id || '1'}` },
            description: { '#text': `Start Time: ${event.start_time || 'N/A'}` },
            pubDate: { '#text': event.start_time || 'N/A' },
          })),
        },
      },
    });

    const xmlString = feed.end({ prettyPrint: true });
    console.log(xmlString);
    // Display the Atom feed content in the component, or handle it as needed
  };

  return (
    <div>
      <h2>Feed Events</h2>
      <button onClick={generateAtomFeed}>Generate Atom Feed</button>
    </div>
  );
};

export default FeedEvents;