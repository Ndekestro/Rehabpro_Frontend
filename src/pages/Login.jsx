import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, LogIn } from 'lucide-react';
import API from '../api';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const loginData = { identifier, password };

    try {
      const response = await fetch(`${API.baseUrl}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'  // Explicitly request JSON response
        },
        body: JSON.stringify(loginData),
      });

      // Log response details for debugging
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Get the raw response text first
      const rawResponse = await response.text();
      console.log('Raw response:', rawResponse);

      let data;
      try {
        // Try to parse the raw response as JSON
        data = rawResponse ? JSON.parse(rawResponse) : null;
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.log('Response that failed to parse:', rawResponse);
        throw new Error(
          `Invalid JSON response from server. Status: ${response.status}. ` +
          `Content-Type: ${response.headers.get('content-type')}. ` +
          'Please check the console for full response details.'
        );
      }

      if (!response.ok) {
        throw new Error(data?.message || `Server error: ${response.status}`);
      }

      if (!data || !data.token || !data.user) {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response data: missing token or user information');
      }

      const { token, user } = data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'participant') {
        navigate('/home');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-blue-600 text-white text-center py-6">
            <h2 className="text-3xl font-bold tracking-wider">Welcome Back</h2>
            <p className="text-blue-100 mt-2">Sign in to continue</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Email or Username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Login
                </>
              )}
            </button>

            <div className="text-center">
              <a 
                href="/signup" 
                className="text-sm text-blue-600 hover:text-blue-800 transition duration-300"
              >
                Sign Up
              </a>
              <a 
                href="/forgot-password" 
                className="text-sm text-blue-600 hover:text-blue-800 transition duration-300"
              >
                Forgot Password
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;