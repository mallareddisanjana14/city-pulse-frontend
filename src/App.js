import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import CityDashboard from './CityDashboard';
import CitizenReport from './CitizenReport';
import AnalyticsDashboard from './AnalyticsDashboard';
import HelpSection from './HelpSection'; // ✅ NEW
import Login from './Login';
import SignUp from './SignUp';
import './i18n';
import { auth } from './firebase';
import { signOut, onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import { database } from './firebase';
import { ref, onValue, set } from 'firebase/database';
import './styles.css';

function App() {
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState('');
  const [lastSeenEventId, setLastSeenEventId] = useState(null);
  const [users, setUsers] = useState({});

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      console.log(currentUser ? `Logged in: ${currentUser.email}` : 'Logged out');

      if (currentUser && !currentUser.emailVerified) {
        sendVerification(currentUser);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const sendVerification = (user) => {
    sendEmailVerification(user)
      .then(() => {
        console.log("Verification email sent.");
        setNotification('📧 Verification email sent. Please check your inbox or spam folder.');
      })
      .catch((error) => {
        console.error("Error sending verification email:", error);
        setNotification('❌ Failed to send verification email. Try again later.');
      });

    setTimeout(() => setNotification(''), 7000);
  };

  useEffect(() => {
    if (!user || !user.emailVerified) return;

    const eventsRef = ref(database, 'events');
    const unsubscribeEvents = onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entries = Object.entries(data);
        const [latestId, latestEvent] = entries[entries.length - 1];

        if (latestId !== lastSeenEventId && latestEvent) {
          const description = (latestEvent.description || 'No Description').replace(/(^"|"$)/g, '');
          const location = (latestEvent.location || 'Unknown').replace(/(^"|"$)/g, '');
          setNotification(`📢 New event: ${description} at ${location}`);
          setLastSeenEventId(latestId);
          setTimeout(() => setNotification(''), 5000);

          const usersRef = ref(database, 'users');
          onValue(usersRef, (snap) => {
            const userData = snap.val() || {};
            Object.keys(userData).forEach(uid => {
              if (uid !== user.uid) {
                set(ref(database, `users/${uid}/lastNotification`), {
                  message: `New event: ${description} at ${location}`,
                  timestamp: Date.now()
                });
              }
            });
          });
        }
      }
    });

    const userRef = ref(database, `users/${user.uid}/lastNotification`);
    const unsubscribeUser = onValue(userRef, (snap) => {
      const notificationData = snap.val();
      if (notificationData && notificationData.timestamp > (users[user.uid]?.lastNotification?.timestamp || 0)) {
        setUsers(prev => ({
          ...prev,
          [user.uid]: { lastNotification: notificationData }
        }));
      }
    });

    return () => {
      unsubscribeEvents();
      unsubscribeUser && unsubscribeUser();
    };
  }, [user, lastSeenEventId]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      signOut(auth)
        .then(() => console.log('Logged out'))
        .catch((error) => console.error('Logout error:', error.message));
    }
  };

  return (
    <BrowserRouter>
      <div>
        <h1>🌆 City Pulse App</h1>
        <p>
          <strong>Firebase Auth Status:</strong>{' '}
          {user ? `Connected as ${user.email}` : 'Not Connected'}
        </p>

        {/* 🔔 Notifications */}
        {notification && (
          <div
            style={{
              color: notification.startsWith('⚠️') || notification.startsWith('❌') ? 'red' : 'green',
              marginBottom: '10px',
              fontWeight: 'bold'
            }}
          >
            {notification}
          </div>
        )}

        {/* 👁️ Event Info */}
        {user && users[user.uid]?.lastNotification?.message && (
          <div style={{ color: 'blue', marginBottom: '10px' }}>
            {users[user.uid].lastNotification.message} <br />
            <small>({new Date(users[user.uid].lastNotification.timestamp).toLocaleString()})</small>
          </div>
        )}

        {/* 🆘 Help Link */}
        <Link to="/help">
          <button style={{ marginBottom: '10px', backgroundColor: '#2ecc71', color: '#fff' }}>
            ❓ Help & Guide
          </button>
        </Link>

        {/* Main Routes */}
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                user.emailVerified ? (
                  <>
                    <button style={{ backgroundColor: '#e74c3c', color: '#fff' }} onClick={handleLogout}>Logout</button>
                    <CitizenReport />
                    <CityDashboard key={user.uid} />
                    <AnalyticsDashboard />
                  </>
                ) : (
                  <>
                    <p style={{ color: 'orange' }}>⚠️ Please verify your email to access dashboard features.</p>
                    <button style={{ backgroundColor: '#3498db', color: '#fff' }} onClick={() => sendVerification(user)}>
                      Resend Verification Email
                    </button>
                    <br /><br />
                    <button onClick={handleLogout}>Logout</button>
                  </>
                )
              ) : (
                <>
                  <Login />
                  <SignUp />
                  <p>Loading or not authenticated...</p>
                </>
              )
            }
          />

          {/* Help Page */}
          <Route path="/help" element={<HelpSection />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
