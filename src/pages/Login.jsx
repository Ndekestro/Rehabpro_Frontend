import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, LogIn, Heart, Shield, Award, CheckCircle, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import API from '../api';
import RehabImage from '../assets/rehab.jpg';
import RehabImage2 from '../assets/RehabImage2.jpg'; // Replace with your actual second image
import RehabImage3 from '../assets/RehabImage3.jpg'; // Replace with your actual third image 
import RehabImage4 from '../assets/RehabImage4.jpg'; // Replace with your actual fourth image

// Sample slideshow images - replace with your actual images
const slideshowImages = [
  RehabImage,
  RehabImage2,
  RehabImage3,
  RehabImage4,
];

const inspirationalQuotes = [
  { text: "Recovery is not a race. You don't have to feel guilty if it takes you longer than you thought it would.", author: "Unknown" },
  { text: "The comeback is always stronger than the setback.", author: "Unknown" },
  { text: "Your present circumstances don't determine where you can go; they merely determine where you start.", author: "Nido Qubein" },
  { text: "Healing is an art. It takes time, it takes practice. It takes love.", author: "Maza Dohta" }
];

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Auto-advance slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slideshowImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slideshowImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slideshowImages.length) % slideshowImages.length);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const loginData = { identifier, password, role: selectedRole };

    try {
      const response = await fetch(`${API.baseUrl}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(loginData),
      });
      
      const rawResponse = await response.text();
      
      let data;
      try {
        data = rawResponse ? JSON.parse(rawResponse) : null;
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
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

  const userRoles = [
    { 
      id: 'professional', 
      name: 'Professional', 
      description: 'Healthcare providers and clinicians',
      icon: <Award className="w-6 h-6" />
    },
    { 
      id: 'admin', 
      name: 'Administrator', 
      description: 'System and facility administrators',
      icon: <Shield className="w-6 h-6" />
    },
    { 
      id: 'guardian', 
      name: 'Guardian', 
      description: 'Family members and caregivers',
      icon: <Heart className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen flex items-stretch bg-gray-50">
      {/* Slideshow Section */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        {/* Slideshow Images */}
        <div className="absolute inset-0 transition-all duration-1000 ease-in-out">
          {slideshowImages.map((image, index) => (
            <div 
              key={index} 
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`} 
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-600/40"></div>
        </div>

        {/* Navigation Arrows */}
        <div className="absolute inset-y-0 left-0 flex items-center z-10">
          <button 
            onClick={prevSlide}
            className="bg-white/10 hover:bg-white/20 text-white rounded-r-lg p-2 backdrop-blur-sm transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center z-10">
          <button 
            onClick={nextSlide}
            className="bg-white/10 hover:bg-white/20 text-white rounded-l-lg p-2 backdrop-blur-sm transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Slideshow Content */}
        <div className="absolute inset-0 flex flex-col justify-between z-10 p-12">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-2">Rehab Center Recovery</h1>
            <p className="text-xl opacity-80">Empowering Your Recovery Journey</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white max-w-lg transition-all duration-1000">
            <blockquote className="text-xl italic leading-relaxed">
              "{inspirationalQuotes[currentSlide].text}"
            </blockquote>
            <p className="mt-4 text-right text-white/80">
              - {inspirationalQuotes[currentSlide].author}
            </p>
          </div>
          
          <div className="flex justify-center space-x-8">
            <div className="flex flex-col items-center">
              <div className="bg-white/10 p-3 rounded-full mb-2 backdrop-blur-sm">
                <CheckCircle className="w-6 h-6 text-green-300" />
              </div>
              <span className="text-white">Track Progress</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white/10 p-3 rounded-full mb-2 backdrop-blur-sm">
                <Heart className="w-6 h-6 text-pink-300" />
              </div>
              <span className="text-white">Support Recovery</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white/10 p-3 rounded-full mb-2 backdrop-blur-sm">
                <Shield className="w-6 h-6 text-yellow-300" />
              </div>
              <span className="text-white">Ensure Safety</span>
            </div>
          </div>
        </div>

        {/* Slideshow Indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
          {slideshowImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Login Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-xl transition-all duration-500">
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white text-center py-8 px-4">
            <h2 className="text-3xl font-bold tracking-wider">Welcome Back</h2>
            <p className="text-blue-100 mt-2">Sign in to access the platform</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-md" role="alert">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* User Role Selection */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {userRoles.map(role => (
                <div key={role.id} className="h-full">
                  <div 
                    className={`h-full py-3 px-2 border-2 rounded-xl flex flex-col items-center text-center cursor-pointer transition-all ${
                      selectedRole === role.id 
                        ? 'border-blue-600 bg-blue-50 shadow-lg' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow'
                    }`}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <div className={`p-2 rounded-full mb-2 transition-all ${
                      selectedRole === role.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {role.icon}
                    </div>
                    <h3 className="font-medium text-sm">{role.name}</h3>
                    {selectedRole === role.id && (
                      <div className="mt-1 text-blue-600">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500">
                <User className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500" />
              </div>
              <input
                type="text"
                placeholder="Email or Username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500" />
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !selectedRole}
              className={`w-full flex items-center justify-center py-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                selectedRole 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md hover:shadow-lg' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
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

            <div className="flex justify-center space-x-8 pt-2">
              <a 
                href="/signup" 
                className="text-blue-600 hover:text-blue-800 hover:underline transition duration-300 flex items-center"
              >
                <User className="w-4 h-4 mr-1" />
                <span>Create Account</span>
              </a>
              <a 
                href="/forgot-password" 
                className="text-blue-600 hover:text-blue-800 hover:underline transition duration-300 flex items-center"
              >
                <Lock className="w-4 h-4 mr-1" />
                <span>Reset Password</span>
              </a>
            </div>
          </form>
          
          <div className="bg-gray-50 py-4 px-8 text-center text-gray-500 text-sm border-t border-gray-100">
            &copy; {new Date().getFullYear()} Rehab Center. All rights reserved.
          </div>
        </div>
      </div>
      
      {/* Mobile specific background for screens without the slideshow */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10 block lg:hidden" 
           style={{ 
            backgroundImage: `url(${slideshowImages[0]})`,
             filter: 'brightness(0.7)'
           }}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 to-blue-600/50 backdrop-blur-sm"></div>
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
          animation-iteration-count: 1;
        }
        
        .animate-slideIn {
          animation: slideIn 0.5s ease-out forwards;
          animation-iteration-count: 1;
        }
      `}</style>
    </div>
  );
};

export default Login;