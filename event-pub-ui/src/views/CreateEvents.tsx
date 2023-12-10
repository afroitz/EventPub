import React, { useState } from 'react';

const CreateEvents: React.FC = () => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    

    /* const formData = new FormData();
    formData.append('event_title', title);
    formData.append('event_summary', summary); */

    try {
      const response = await fetch(process.env.REACT_APP_API_URL + 'create', {
        method: 'POST',
        body: JSON.stringify({
          event_title: title,
          event_summary: summary,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Event created successfully');
      } else {
        console.error('Failed to create event');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <>
      <h2>Create Events</h2>
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
        <button type="submit">Create</button>
      </form>
    </>
  );
};

export default CreateEvents;
