// src/firebase.js

// ✅ All imports at the top
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getDatabase,
  onDisconnect,
  ref,
  goOffline,
  goOnline,
  connectDatabaseEmulator
} from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCVCyvTBliZS12QmnA0fdeyWd5mEPtGm8c",
  authDomain: "citypulseapp-619cc.firebaseapp.com",
  databaseURL: "https://citypulseapp-619cc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "citypulseapp-619cc",
  storageBucket: "citypulseapp-619cc.appspot.com",
  messagingSenderId: "737072225668",
  appId: "1:737072225668:web:b0e4414fbbb07de36411d1",
  measurementId: "G-FNE0G8ZFXS"
};

// ✅ Only initialize if no apps have been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const database = getDatabase(app);

// ✅ Enable offline data persistence (or reconnect, if needed)
try {
  database.goOnline?.(); // Ensure it's online
  console.log('✅ Realtime Database offline support enabled');
} catch (err) {
  console.error('❌ Failed to enable offline support:', err);
}

export { auth, database };
