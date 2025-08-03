import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { signOut, onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import { ref, onValue, set } from 'firebase/database';

import CityDashboard from './CityDashboard';
import CitizenReport from './CitizenReport';
import AnalyticsDashboard from './AnalyticsDashboard';
import HelpSection from './HelpSection';
import Login from './Login';
import SignUp from './SignUp';
import './i18n';
import { auth, database } from './firebase';
import './styles.css';

function App() {
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState('');
  const [lastSeenEventId, setLastSeenEventId] = useState(null);
  const [users, setUsers] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && !currentUser.emailVerified) {
        sendVerification(currentUser);
      }
    });
    return unsubscribe;
  }, []);

  const sendVerification = (user) => {
    sendEmailVerification(user)
      .then(() => setNotification('📧 Verification email sent. Check inbox/spam.'))
      .catch(() => setNotification('❌ Failed to send verification email.'));
    setTimeout(() => setNotification(''), 5000);
  };

  useEffect(() => {
    if (!user || !user.emailVerified) return;

    const eventsRef = ref(database, 'events');
    const eventsListener = onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entries = Object.entries(data);
        const [latestId, latestEvent] = entries[entries.length - 1];
        if (latestId !== lastSeenEventId && latestEvent) {
          const description = latestEvent.description?.replace(/(^"|"$)/g, '') ?? 'No Description';
          const location = latestEvent.location?.replace(/(^"|"$)/g, '') ?? 'Unknown';
          setNotification(`📢 New event: ${description} at ${location}`);
          setLastSeenEventId(latestId);
          setTimeout(() => setNotification(''), 5000);

          const usersRef = ref(database, 'users');
          onValue(usersRef, (snap) => {
            const userData = snap.val() ?? {};
            Object.keys(userData).forEach(uid => {
              if (uid !== user.uid) {
                set(ref(database, `users/${uid}/lastNotification`), {
                  message: `New event: ${description} at ${location}`,
                  timestamp: Date.now()
                });
              }
            });
          }, { onlyOnce: true });
        }
      }
    });

    const userRef = ref(database, `users/${user.uid}/lastNotification`);
    const userListener = onValue(userRef, (snap) => {
      const data = snap.val();
      if (data && data.timestamp > (users[user.uid]?.lastNotification?.timestamp || 0)) {
        setUsers(prev => ({
          ...prev,
          [user.uid]: { lastNotification: data }
        }));
      }
    });

    return () => {
      eventsListener();
      userListener();
    };
  }, [user, lastSeenEventId]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      signOut(auth).catch((error) => console.error(error));
    }
  };

  return (
    <BrowserRouter>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ backgroundColor: '#3498db', color: '#fff', padding: '10px', textAlign: 'center' }}>
          <h1>🌆 City Pulse App</h1>
          <p>
            <strong>Status:</strong> {user ? `Connected as ${user.email}` : 'Not Connected'}
          </p>
        </div>

        {/* Main content scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {/* Notifications */}
          {notification && (
            <div style={{
              backgroundColor: notification.startsWith('❌') ? '#e74c3c' : '#2ecc71',
              color: '#fff',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '5px'
            }}>
              {notification}
            </div>
          )}

          {/* User event notification */}
          {user && users[user.uid]?.lastNotification && (
            <div style={{ backgroundColor: '#ecf0f1', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
              <strong>{users[user.uid].lastNotification.message}</strong><br />
              <small>{new Date(users[user.uid].lastNotification.timestamp).toLocaleString()}</small>
            </div>
          )}

          {/* Help button */}
          <Link to="/help">
            <button style={{
              backgroundColor: '#2ecc71',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              marginBottom: '15px'
            }}>❓ Help & Guide</button>
          </Link>

          {/* Routes */}
          <Routes>
            <Route path="/" element={
              user ? (
                user.emailVerified ? (
                  <>
                    <button onClick={handleLogout} style={{
                      backgroundColor: '#e74c3c',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      marginBottom: '15px'
                    }}>Logout</button>

                    <CitizenReport />
                    <CityDashboard key={user.uid} />
                    <AnalyticsDashboard />
                  </>
                ) : (
                  <>
                    <p style={{ color: '#e67e22', fontWeight: 'bold' }}>⚠️ Verify your email to access features.</p>
                    <button onClick={() => sendVerification(user)} style={{
                      backgroundColor: '#3498db',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      marginBottom: '10px'
                    }}>Resend Verification Email</button>
                    <br />
                    <button onClick={handleLogout} style={{
                      backgroundColor: '#e74c3c',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}>Logout</button>
                  </>
                )
              ) : (
                <>
                  <Login />
                  <SignUp />
                  <p style={{ color: '#7f8c8d' }}>Please log in or sign up to continue.</p>
                </>
              )
            } />

            <Route path="/help" element={<HelpSection />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
