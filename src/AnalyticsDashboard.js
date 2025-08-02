import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from './firebase';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28FD0'];

function AnalyticsDashboard() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const eventsRef = ref(database, 'events');
    onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setEvents(Object.values(data));
      }
    });
  }, []);

  // Aggregations
  const eventTypes = {};
  const locations = {};
  const hourlyData = new Array(24).fill(0);

  events.forEach((e) => {
    const type = (e.description || 'Unknown').toLowerCase();
    const loc = e.location || 'Unknown';
    const hour = new Date(e.timestamp).getHours();

    eventTypes[type] = (eventTypes[type] || 0) + 1;
    locations[loc] = (locations[loc] || 0) + 1;
    hourlyData[hour]++;
  });

  // Format for charts
  const eventTypeData = Object.entries(eventTypes).map(([type, count]) => ({ name: type, value: count }));
  const locationData = Object.entries(locations).map(([loc, count]) => ({ name: loc, value: count }));
  const hourlyChartData = hourlyData.map((count, hour) => ({ hour: `${hour}:00`, count }));

  return (
    <div style={{ padding: '20px' }}>
      <h2>📊 CityPulse Analytics Dashboard</h2>
      <h3>🌀 Event Types</h3>
      <PieChart width={400} height={250}>
        <Pie
          data={eventTypeData}
          dataKey="value"
          nameKey="name"
          cx="50%" cy="50%"
          outerRadius={80}
          label
        >
          {eventTypeData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
        <Tooltip />
      </PieChart>

      <h3>📍 Events by Location</h3>
      <BarChart width={600} height={300} data={locationData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#82ca9d" />
      </BarChart>

      <h3>🕒 Hourly Distribution</h3>
      <BarChart width={600} height={300} data={hourlyChartData}>
        <XAxis dataKey="hour" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#8884d8" />
      </BarChart>
    </div>
  );
}

export default AnalyticsDashboard;
