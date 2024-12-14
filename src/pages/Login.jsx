// src/components/Login.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api'; // Import the simplified API class

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare login data with only username and password
    const loginData = { username, password };

    try {
      // Make the POST request to /api/users/login
      const response = await fetch(`${API.baseUrl}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData), // Send only username and password
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      const { token, role, userId } = data;

      // Store token, role, and userId in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', userId);

      // Redirect based on the user role
      if (role === 'participant') {
        navigate('/home'); // Redirect to home for participants
      } else if (role === 'admin' || role === 'professional') {
        navigate('/dashboard'); // Redirect to dashboard for admins and professionals
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        {/* Input for only username */}
        <div>
          <label>Username:</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </div>

        <div>
          <label>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
