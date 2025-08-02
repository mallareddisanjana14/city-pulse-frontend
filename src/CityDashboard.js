import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { database, auth } from './firebase';
import { ref, onValue, remove, update } from 'firebase/database';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const CityDashboard = () => {
  const { t, i18n } = useTranslation();

  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [error, setError] = useState(null);
  const [editEvent, setEditEvent] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [eventCounts, setEventCounts] = useState({});
  const [userRole, setUserRole] = useState('citizen');

  useEffect(() => {
    const eventsRef = ref(database, 'events');

    const getCityNameFromCoords = async (latLng) => {
      const [lat, lng] = latLng.split(',');
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        return (
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.state ||
          'Unknown'
        );
      } catch (err) {
        console.error('Reverse geocoding failed:', err);
        return 'Unknown';
      }
    };

    const unsubscribeEvents = onValue(eventsRef, async (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const eventsArray = await Promise.all(
            Object.entries(data).map(async ([id, event]) => {
              let location = String(event.location || 'Unknown Location').replace(/"/g, '');
              if (location.includes(',')) {
                location = await getCityNameFromCoords(location);
              }
              return {
                id,
                description: String(event.description || 'No description').replace(/"/g, ''),
                location,
                timestamp: event.timestamp || Date.now(),
                resolved: event.resolved || false
              };
            })
          );

          eventsArray.sort((a, b) => b.timestamp - a.timestamp);
          setEvents(eventsArray);

          const counts = eventsArray.reduce((acc, event) => {
            acc[event.location] = (acc[event.location] || 0) + 1;
            return acc;
          }, {});
          setEventCounts(counts);
          setError(null);
        } else {
          setEvents([]);
          setEventCounts({});
        }
      } catch (err) {
        setError(t('error_load'));
      }
    });

    const userRef = ref(database, `users/${auth.currentUser?.uid}/role`);
    const unsubscribeUser = onValue(userRef, (snap) => {
      const role = snap.val();
      setUserRole(role || 'citizen');
    });

    return () => {
      unsubscribeEvents();
      unsubscribeUser();
    };
  }, [t]);

  const filteredEvents = events.filter((event) => {
    const location = event.location.toLowerCase();
    return (
      (!selectedCity || location.includes(selectedCity.toLowerCase())) &&
      location.includes(filter.toLowerCase())
    );
  });

  const handleDelete = async (eventId) => {
    try {
      const eventRef = ref(database, `events/${eventId}`);
      await remove(eventRef);
      setError(null);
    } catch (err) {
      setError(t('error_delete'));
    }
  };

  const handleResolve = async (eventId) => {
    if (userRole === 'admin') {
      try {
        const eventRef = ref(database, `events/${eventId}`);
        await update(eventRef, { resolved: true });
        setError(null);
      } catch (err) {
        setError(t('error_resolve'));
      }
    } else {
      setError(t('only_admin_resolve'));
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEdit = (event) => {
    setEditEvent(event);
    setEditDescription(event.description);
    setEditLocation(event.location);
  };

  const handleSaveEdit = async () => {
    try {
      const eventRef = ref(database, `events/${editEvent.id}`);
      await update(eventRef, {
        description: editDescription,
        location: editLocation
      });
      setEditEvent(null);
      setEditDescription('');
      setEditLocation('');
      setError(null);
    } catch (err) {
      setError(t('error_edit'));
    }
  };

  const handleCancelEdit = () => {
    setEditEvent(null);
    setEditDescription('');
    setEditLocation('');
  };

  const chartData = {
    labels: Object.keys(eventCounts),
    datasets: [
      {
        label: t('num_events'),
        data: Object.values(eventCounts),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        borderColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: t('chart_title') }
    },
    scales: { y: { beginAtZero: true } }
  };

  return (
    <div style={{ padding: '10px' }}>
      <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button onClick={() => i18n.changeLanguage('en')}>{t('english')}</button>
        <button onClick={() => i18n.changeLanguage('hi')}>{t('hindi')}</button>
        <a href="/help" style={{ marginLeft: 'auto', textDecoration: 'none', color: 'blue' }}>
          {t('help_title')}
        </a>
      </div>

      <h2>{t('city_dashboard')}</h2>

      <label>{t('select_city')}: </label>
      <select
        value={selectedCity}
        onChange={(e) => setSelectedCity(e.target.value)}
        style={{ marginLeft: '10px', marginBottom: '10px' }}
      >
        <option value="">{t('all_cities')}</option>
        <option value="Hyderabad">Hyderabad</option>
        <option value="Bengaluru">Bengaluru</option>
        <option value="Mumbai">Mumbai</option>
        <option value="Delhi">Delhi</option>
      </select>

      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder={t('filter_location')}
        style={{ marginLeft: '10px', padding: '5px' }}
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {filteredEvents.length === 0 ? (
          <p>{t('no_events')}</p>
        ) : (
          filteredEvents.map((event) => (
            <li key={event.id} style={{ marginBottom: '15px' }}>
              {editEvent && editEvent.id === event.id ? (
                <>
                  <input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    style={{ marginRight: '10px' }}
                  />
                  <input
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    style={{ marginRight: '10px' }}
                  />
                  <button onClick={handleSaveEdit} style={{ marginRight: '10px' }}>{t('save')}</button>
                  <button onClick={handleCancelEdit}>{t('cancel')}</button>
                </>
              ) : (
                <>
                  {event.description} {t('at')} {event.location} <br />
                  ({t('time')}: {new Date(event.timestamp).toLocaleString()})
                  {event.resolved && <span style={{ color: 'green', marginLeft: '10px' }}> ({t('resolved')})</span>}
                  {userRole === 'admin' && (
                    <>
                      <button onClick={() => handleDelete(event.id)} style={{ marginLeft: '10px' }}>{t('delete')}</button>
                      <button onClick={() => handleResolve(event.id)} style={{ marginLeft: '10px' }}>{t('resolve')}</button>
                      <button onClick={() => handleEdit(event)} style={{ marginLeft: '10px' }}>{t('edit')}</button>
                    </>
                  )}
                </>
              )}
            </li>
          ))
        )}
      </ul>

      {Object.keys(eventCounts).length > 0 && (
        <div style={{ marginTop: '20px', maxWidth: '600px' }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
};

export default CityDashboard;
