import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, database } from './firebase';
import { ref, set } from 'firebase/database';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user data to Firebase Realtime Database
      await set(ref(database, `users/${user.uid}`), {
        email: user.email,
        role: role,
        createdAt: Date.now()
      });

      alert('✅ Account created! Please check your email for verification.');
    } catch (error) {
      alert('❌ ' + error.message);
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <select onChange={e => setRole(e.target.value)}>
        <option value="user">Citizen</option>
        <option value="admin">Admin</option>
      </select>
      <button onClick={handleSignUp}>Register</button>
    </div>
  );
}

export default SignUp;
