import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Home, Key, IdCard, FileText, Check } from 'lucide-react';
import API from '../api';

const SignUp = () => {
  const [form, setForm] = useState({
    name: '',
    national_id: '',
    address: '',
    rehab_reason: '',
    email: '',
    username: '',
    password: '',
    role: 'participant',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'national_id' && value.length > 16) return;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.national_id.length !== 16) {
      setError('National ID must be exactly 16 characters');
      return;
    }
    
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`${API.baseUrl}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Registration successful! Please wait for admin verification.');
        setForm({
          name: '',
          national_id: '',
          address: '',
          rehab_reason: '',
          email: '',
          username: '',
          password: '',
          role: 'participant',
        });
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (error) {
      setError('Error signing up. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left Side - Form Info */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-12 text-white">
              <div className="max-w-md">
                <h2 className="text-3xl font-bold mb-6">Welcome to Our Platform</h2>
                <p className="text-blue-100 mb-8">
                  Join our rehabilitation program and start your journey towards wellness. 
                  Fill out the form to create your account.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="h-5 w-5" />
                    </div>
                    <p>Professional guidance and support</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="h-5 w-5" />
                    </div>
                    <p>Personalized rehabilitation programs</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="h-5 w-5" />
                    </div>
                    <p>Track your progress efficiently</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="p-12">
              <div className="max-w-md mx-auto">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">Create Account</h3>

                {message && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
                    {message}
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    {/* Name Input */}
                    <div>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Full Name"
                          required
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
                        />
                      </div>
                    </div>

                    {/* National ID Input */}
                    <div>
                      <div className="relative">
                        <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          name="national_id"
                          value={form.national_id}
                          onChange={handleChange}
                          placeholder="National ID (16 characters)"
                          maxLength={16}
                          required
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
                        />
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {form.national_id.length}/16 characters
                      </div>
                    </div>

                    {/* Address Input */}
                    <div>
                      <div className="relative">
                        <Home className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          name="address"
                          value={form.address}
                          onChange={handleChange}
                          placeholder="Address"
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Rehab Reason Input */}
                    <div>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                        <textarea
                          name="rehab_reason"
                          value={form.rehab_reason}
                          onChange={handleChange}
                          placeholder="Reason for rehabilitation"
                          rows={3}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors resize-none"
                        />
                      </div>
                    </div>

                    {/* Email Input */}
                    <div>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="Email address"
                          required
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Username Input */}
                    <div>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          name="username"
                          value={form.username}
                          onChange={handleChange}
                          placeholder="Username"
                          required
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          placeholder="Password"
                          required
                          className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <input type="hidden" name="role" value="participant" />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg 
                             transition-colors duration-200 transform hover:scale-[1.02]
                             focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                             disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                  Already have an account?{' '}
                  <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                    Sign in
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;