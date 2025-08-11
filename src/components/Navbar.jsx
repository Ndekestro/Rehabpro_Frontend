import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Home, BookOpen, HelpCircle, Menu, X, User, Bell, Settings, Users, FileText, Calendar, BarChart3 } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  
  // Get user data from localStorage (if available)
  const userData = JSON.parse(localStorage.getItem('user') || '{"name": "Guest", "avatar": null, "role": "participant"}');
  const userRole = userData.role || 'participant';

  // Handle scroll effect with enhanced threshold
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowNotifications(false);
  }, [location]);

  const handleLogout = () => {
    // Add subtle animation before logout
    const navbar = document.querySelector('nav');
    if (navbar) {
      navbar.classList.add('animate-pulse');
      setTimeout(() => {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }, 300);
    } else {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const navLinkClass = (path) => `
    relative group flex items-center gap-3 px-6 py-3 rounded-xl
    transition-all duration-500 ease-out transform
    hover:scale-105 hover:-translate-y-0.5
    ${isActivePath(path) 
      ? 'bg-gradient-to-r from-white/25 to-white/15 text-white font-semibold shadow-lg backdrop-blur-sm border border-white/20' 
      : 'text-blue-50/90 hover:bg-gradient-to-r hover:from-white/15 hover:to-white/10 hover:text-white hover:shadow-md backdrop-blur-sm border border-transparent hover:border-white/10'}
    focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent
  `;

  // Dummy notifications for demo
  const notifications = [
    { id: 1, title: "New program available", time: "2 hours ago", type: "info" },
    { id: 2, title: "Upcoming session reminder", time: "Yesterday", type: "warning" },
    { id: 3, title: "Document uploaded", time: "3 days ago", type: "success" },
  ];

  const getNotificationIcon = (type) => {
    const colors = {
      info: 'bg-blue-500',
      warning: 'bg-amber-500',
      success: 'bg-emerald-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <>
      {/* Backdrop blur effect */}
      
      <nav className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-700 ease-out transform
        ${isScrolled 
          ? 'bg-gradient-to-r from-indigo-900/95 via-blue-800/95 to-purple-900/95 shadow-2xl py-2 backdrop-blur-xl border-b border-white/10' 
          : 'bg-gradient-to-r from-indigo-800/90 via-blue-700/90 to-purple-800/90 py-4 backdrop-blur-lg'}
      `}>
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-pulse delay-300" />
          <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-blue-200/30 rounded-full animate-ping delay-700" />
          <div className="absolute bottom-0 left-2/3 w-1.5 h-1.5 bg-purple-200/25 rounded-full animate-pulse delay-500" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand with enhanced visual appeal */}
            <div className="flex items-center">
              <Link 
                to="/home" 
                className="flex items-center gap-4 text-white font-bold text-xl hover:opacity-90 transition-all duration-500 transform hover:scale-110 group"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative bg-gradient-to-r from-white to-blue-50 p-3 rounded-full shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:rotate-12">
                    <Home className="h-6 w-6 text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}} />
                  </div>
                </div>
                <div className="hidden sm:block">
                  <span className="bg-gradient-to-r from-white via-blue-50 to-purple-50 bg-clip-text text-transparent text-2xl font-extrabold tracking-tight">
                    Rehab
                  </span>
                  <div className="h-0.5 w-full bg-gradient-to-r from-blue-400 to-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>
              </Link>
            </div>

            {/* Desktop Navigation with enhanced styling */}
            <div className="hidden md:flex items-center gap-2">
              {userRole === 'participant' && (
                <>
            
                  <Link 
                    to="/help" 
                    className={navLinkClass('/help')}
                  >
                    <HelpCircle className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>Request Help</span>
                    {isActivePath('/help') && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl animate-pulse" />
                    )}
                  </Link>

                  <Link 
                    to="/yourparticipants" 
                    className={navLinkClass('/yourparticipants')}
                  >
                    <HelpCircle className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>Your Participant/Member</span>
                    {isActivePath('/yourparticipants') && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl animate-pulse" />
                    )}
                  </Link>
                </>
              )}

              {userRole === 'counselor' && (
                <>
                 

                  <Link 
                    to="/counselor/yourparticipants" 
                    className={navLinkClass('/counselor/yourparticipants')}
                  >
                    <Users className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                    <span>All Participants</span>
                    {isActivePath('/counselor/participants') && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl animate-pulse" />
                    )}
                  </Link>

                  <Link 
                    to="/counselor/programs" 
                    className={navLinkClass('/counselor/programs')}
                  >
                    <BookOpen className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                    <span>Programs</span>
                    {isActivePath('/counselor/programs') && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl animate-pulse" />
                    )}
                  </Link>

                  <Link 
                    to="/help" 
                    className={navLinkClass('/help')}
                  >
                    <HelpCircle className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>Support</span>
                    {isActivePath('/help') && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl animate-pulse" />
                    )}
                  </Link>
                </>
              )}
             
              {/* Enhanced User Profile */}
              <div className="flex items-center ml-4">
                <div className="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm flex items-center gap-3 px-4 py-2 rounded-full border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  {userData.avatar ? (
                    <img 
                      src={userData.avatar} 
                      alt="User avatar" 
                      className="h-10 w-10 rounded-full border-2 border-white/50 shadow-md"
                    />
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-sm opacity-75" />
                      <div className="relative h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg">
                        <User className="h-5 w-5" />
                      </div>
                    </div>
                  )}
                  <div className="text-left">
                    <div className="text-white text-sm font-semibold">{userData.name}</div>
                    <div className="text-blue-100/80 text-xs">{userRole === 'counselor' ? 'Counselor' : 'Participant'}</div>
                  </div>
                </div>
              </div>

              {/* Enhanced Logout Button */}
              <button
                onClick={handleLogout}
                className="
                  flex items-center gap-3 px-6 py-3 ml-4
                  bg-gradient-to-r from-red-500 via-red-600 to-pink-600
                  hover:from-red-600 hover:via-red-700 hover:to-pink-700
                  text-white rounded-xl font-semibold
                  transition-all duration-500 ease-out
                  transform hover:scale-110 hover:-translate-y-1 hover:shadow-2xl
                  focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:ring-offset-2 focus:ring-offset-transparent
                  border border-red-400/20 backdrop-blur-sm
                  relative overflow-hidden group
                "
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-pink-400/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                <LogOut className="h-5 w-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative z-10">Logout</span>
              </button>
            </div>

            {/* Enhanced Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="
                  relative p-3 rounded-xl text-white
                  bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm
                  hover:from-white/20 hover:to-white/15 border border-white/20
                  focus:outline-none focus:ring-2 focus:ring-white/50
                  transition-all duration-500 ease-out
                  transform hover:scale-110 hover:shadow-xl group
                "
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6 transform rotate-0 group-hover:rotate-90 transition-transform duration-300" />
                  ) : (
                    <Menu className="h-6 w-6 transform rotate-0 group-hover:rotate-12 transition-transform duration-300" />
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        <div className={`
          md:hidden
          transition-all duration-500 ease-out
          ${isMobileMenuOpen 
            ? 'max-h-screen opacity-100 visible transform translate-y-0'
            : 'max-h-0 opacity-0 invisible transform -translate-y-4'}
        `}>
          <div className="px-4 pt-4 pb-6 space-y-2 bg-gradient-to-b from-indigo-900/95 via-blue-800/95 to-purple-900/95 shadow-2xl backdrop-blur-xl border-t border-white/10">
            {/* Enhanced User Profile for Mobile */}
            <div className="flex items-center gap-4 px-4 py-4 mb-4 rounded-xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/20 shadow-lg">
              {userData.avatar ? (
                <img 
                  src={userData.avatar} 
                  alt="User avatar" 
                  className="h-12 w-12 rounded-full border-2 border-white/50 shadow-md"
                />
              ) : (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-sm opacity-75" />
                  <div className="relative h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg">
                    <User className="h-6 w-6" />
                  </div>
                </div>
              )}
              <div>
                <div className="text-white font-bold text-lg">{userData.name}</div>
                <div className="text-blue-200 text-sm">{userRole === 'counselor' ? 'Counselor' : 'Participant'}</div>
              </div>
            </div>
          
            {userRole === 'participant' && (
              <>
                

                <Link
                  to="/help"
                  className="
                    flex items-center gap-4 px-4 py-4 rounded-xl
                    text-white bg-gradient-to-r from-transparent to-transparent
                    hover:from-white/10 hover:to-white/5 backdrop-blur-sm
                    transition-all duration-300 border border-transparent hover:border-white/20
                    transform hover:translate-x-2 hover:shadow-lg group
                  "
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <HelpCircle className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-semibold">Request Help</span>
                </Link>

                 <Link
                  to="/yourparticipants"
                  className="
                    flex items-center gap-4 px-4 py-4 rounded-xl
                    text-white bg-gradient-to-r from-transparent to-transparent
                    hover:from-white/10 hover:to-white/5 backdrop-blur-sm
                    transition-all duration-300 border border-transparent hover:border-white/20
                    transform hover:translate-x-2 hover:shadow-lg group
                  "
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <HelpCircle className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-semibold">Your Participant/Member</span>
                </Link>
              </>
            )}

            {userRole === 'counselor' && (
              <>
                
                <Link
                  to="/counselor/yourparticipants"
                  className="
                    flex items-center gap-4 px-4 py-4 rounded-xl
                    text-white bg-gradient-to-r from-transparent to-transparent
                    hover:from-white/10 hover:to-white/5 backdrop-blur-sm
                    transition-all duration-300 border border-transparent hover:border-white/20
                    transform hover:translate-x-2 hover:shadow-lg group
                  "
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Users className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="font-semibold">All Participants</span>
                </Link>

                <Link
                  to="/counselors/programs"
                  className="
                    flex items-center gap-4 px-4 py-4 rounded-xl
                    text-white bg-gradient-to-r from-transparent to-transparent
                    hover:from-white/10 hover:to-white/5 backdrop-blur-sm
                    transition-all duration-300 border border-transparent hover:border-white/20
                    transform hover:translate-x-2 hover:shadow-lg group
                  "
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <BookOpen className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="font-semibold">Programs</span>
                </Link>

               
                <Link
                  to="/help"
                  className="
                    flex items-center gap-4 px-4 py-4 rounded-xl
                    text-white bg-gradient-to-r from-transparent to-transparent
                    hover:from-white/10 hover:to-white/5 backdrop-blur-sm
                    transition-all duration-300 border border-transparent hover:border-white/20
                    transform hover:translate-x-2 hover:shadow-lg group
                  "
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <HelpCircle className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-semibold">Support</span>
                </Link>
              </>
            )}
            
            <div className="pt-4 border-t border-white/20 mt-4"></div>

            <button
              onClick={handleLogout}
              className="
                w-full flex items-center gap-4 px-4 py-4
                text-left text-white font-semibold
                bg-gradient-to-r from-red-500/20 via-red-600/20 to-pink-600/20
                hover:from-red-500/30 hover:via-red-600/30 hover:to-pink-600/30
                rounded-xl transition-all duration-300
                backdrop-blur-sm border border-red-400/30 hover:border-red-400/50
                transform hover:scale-[1.02] hover:shadow-lg group
              "
            >
              <LogOut className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
              <span>Logout</span>
            </button>
          </div>
        </div>
        
        {/* Enhanced CSS animations */}
        <style jsx>{`
          @keyframes grow {
            from { width: 0; }
            to { width: 100%; }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes slideInFromTop {
            from { opacity: 0; transform: translateY(-20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          
          .animate-grow {
            animation: grow 0.3s ease-out forwards;
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out forwards;
          }

          .animate-in {
            animation: slideInFromTop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          .slide-in-from-top-2 {
            animation-name: slideInFromTop;
          }

          .fade-in {
            animation-fill-mode: both;
          }
        `}</style>
      </nav>
    </>
  );
};

export default Navbar;