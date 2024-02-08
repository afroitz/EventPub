import React, { useState } from 'react';


const CreateEvents: React.FC = () => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [error, setError] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    /* const formData = new FormData();
    formData.append('event_title', title);
    formData.append('event_summary', summary); */

    try {
      // const response = await fetch(process.env.REACT_APP_API_URL + '/create', {
      let api_url = process.env.REACT_APP_API_URL + '/create' || 'http://localhost:3001/create';
      const response = await fetch(api_url,  {
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify({
          context: 'https://www.w3.org/ns/activitystreams',
          type: 'event',
          attributedTo: 'https://fdls.org/group', //replace with actual url or identifier of user
          name: title,
          content: summary,
          startTime: startTime,
          endTime: endTime,
          location: location,
          published: new Date().toISOString(),
          updated: new Date().toISOString()
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Event created successfully');
        setTitle('');
        setSummary('');
        setLocation('');
        setStartTime('');
        setEndTime('');
        setError(false);
        setMessage('Event created successfully');
      } else {
        console.error('Error creating event');
        setError(true);
        setMessage('Error creating event');

      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <>
        <h2>Create Events</h2>
        {message !== '' && <p className={error ? 'create-error' : 'create-success'}>{message}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title">Title</label>
            <input 
              type="text" 
              id="title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="summary">Summary</label>
            <textarea 
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="location">Location</label>
            <input 
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="startTime">Start</label>
            <input
              type="datetime-local"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="endTime">End</label>
            <input
              type="datetime-local"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>      
          <button type="submit">Create</button>
        </form>
    </>
  );
};

export default CreateEvents;
