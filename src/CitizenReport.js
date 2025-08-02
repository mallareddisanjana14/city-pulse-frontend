import React, { useState } from 'react';
import { database } from './firebase';
import { ref, push } from 'firebase/database';

const CitizenReport = () => {
  const [description, setDescription] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      setFeedback('⚠️ Please provide a description.');
      setTimeout(() => setFeedback(''), 3000);
      return;
    }

    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Fetch city name using OpenCage
          const res = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=f2b69427c9cd4491bd71fbdb28e8a10a`
          );
          const data = await res.json();

          if (!data.results || data.results.length === 0) {
            setFeedback('❌ Unable to determine location.');
            setTimeout(() => setFeedback(''), 3000);
            return;
          }

          const components = data.results[0].components;
          const cityName = components.city || components.town || components.village || components.county || 'Unknown';

          const eventsRef = ref(database, 'events');
          const newEventRef = push(eventsRef, {
            description: description.trim(),
            city: cityName,
            timestamp: Date.now(),
            resolved: false,
          });

          console.log('New event ID:', newEventRef.key);
          setFeedback(`✅ Event submitted for ${cityName}!`);
          setDescription('');
          setTimeout(() => setFeedback(''), 3000);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setFeedback('❌ Please enable location permissions.');
          setTimeout(() => setFeedback(''), 3000);
        }
      );
    } catch (error) {
      setFeedback('❌ Error submitting event: ' + error.message);
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  return (
    <div
      style={{
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        maxWidth: '400px',
        marginTop: '20px',
      }}
    >
      <h2 style={{ color: '#333', marginBottom: '15px' }}>Report an Event</h2>
      {feedback && (
        <div
          style={{
            color: feedback.startsWith('✅') ? 'green' : 'red',
            marginBottom: '15px',
            padding: '5px',
            borderRadius: '3px',
            backgroundColor: feedback.startsWith('✅') ? '#e6ffe6' : '#ffe6e6',
          }}
        >
          {feedback}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
      >
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the event"
          style={{
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
          required
        />
        <button
          type="submit"
          style={{
            padding: '8px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#007BFF',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default CitizenReport;
