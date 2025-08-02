import React, { useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user && !userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user);
        setFeedback('⚠️ Verification email sent. Please check your inbox.');
        setTimeout(() => setFeedback(''), 5000);
      }
    } catch (error) {
      setFeedback('❌ ' + error.message);
      setTimeout(() => setFeedback(''), 5000);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '5px', maxWidth: '400px' }}>
      <h2 style={{ color: '#333', marginBottom: '15px' }}>Login</h2>
      {feedback && (
        <div style={{ 
          color: feedback.startsWith('⚠️') ? 'orange' : 'red', 
          marginBottom: '15px', 
          padding: '5px', 
          borderRadius: '3px',
          backgroundColor: feedback.startsWith('⚠️') ? '#fff3e6' : '#ffe6e6'
        }}>
          {feedback}
        </div>
      )}
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
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
            fontSize: '14px'
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;