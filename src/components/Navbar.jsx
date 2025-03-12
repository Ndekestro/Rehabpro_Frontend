import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Home, BookOpen, HelpCircle, Menu, X, User, Bell, Settings } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  
  // Get user data from localStorage (if available)
  const userData = JSON.parse(localStorage.getItem('user') || '{"name": "Guest", "avatar": null}');

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
    relative group flex items-center gap-2 px-4 py-2 rounded-lg
    transition-all duration-300 ease-in-out
    ${isActivePath(path) 
      ? 'bg-white/15 text-white font-medium' 
      : 'text-blue-50 hover:bg-white/10 hover:text-white'}
  `;

  // Dummy notifications for demo
  const notifications = [
    { id: 1, title: "New program available", time: "2 hours ago" },
    { id: 2, title: "Upcoming session reminder", time: "Yesterday" },
    { id: 3, title: "Document uploaded", time: "3 days ago" },
  ];

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50
      transition-all duration-500 ease-in-out
      ${isScrolled 
        ? 'bg-gradient-to-r from-blue-700 to-blue-600 shadow-lg py-2' 
        : 'bg-gradient-to-r from-blue-600 to-blue-500 py-3'}
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link 
              to="/home" 
              className="flex items-center gap-3 text-white font-bold text-xl hover:opacity-90 transition-all duration-300 transform hover:scale-105"
            >
              <div className="bg-white p-2 rounded-full shadow-md">
                <Home className="h-5 w-5 text-blue-600" />
              </div>
              <span className="hidden sm:block">Guardian Portal</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            <Link 
              to="/participant/programs" 
              className={navLinkClass('/participant/programs')}
            >
              <BookOpen className="h-5 w-5" />
              <span>My Programs</span>
              {isActivePath('/participant/programs') && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-white transform origin-left animate-grow" />
              )}
            </Link>

            <Link 
              to="/help" 
              className={navLinkClass('/help')}
            >
              <HelpCircle className="h-5 w-5" />
              <span>Request Help</span>
              {isActivePath('/help') && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-white transform origin-left animate-grow" />
              )}
            </Link>

            {/* Notification Bell */}
            <div className="relative">
             
              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="
                  absolute right-0 mt-2 w-80 
                  bg-white rounded-lg shadow-xl 
                  overflow-hidden z-10
                  animate-fadeIn
                ">
                  <div className="p-3 bg-blue-50 border-b border-blue-100">
                    <h3 className="font-semibold text-blue-800">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id}
                        className="p-4 hover:bg-blue-50 border-b border-gray-100 transition-colors duration-200"
                      >
                        <p className="text-gray-800 font-medium">{notification.title}</p>
                        <p className="text-gray-500 text-sm mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-blue-50 border-t border-blue-100 text-center">
                    <Link to="/notifications" className="text-blue-600 text-sm font-medium hover:text-blue-800">
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center ml-2">
              <div className="bg-white/10 flex items-center gap-2 px-3 py-1.5 rounded-full">
                {userData.avatar ? (
                  <img 
                    src={userData.avatar} 
                    alt="User avatar" 
                    className="h-8 w-8 rounded-full border-2 border-white/50"
                  />
                ) : (
                  <div className="h-8 w-8 bg-blue-800 rounded-full flex items-center justify-center text-white">
                    <User className="h-4 w-4" />
                  </div>
                )}
                <span className="text-white text-sm">{userData.name}</span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="
                flex items-center gap-2 px-4 py-2 ml-4
                bg-gradient-to-r from-red-500 to-red-600
                hover:from-red-600 hover:to-red-700
                text-white rounded-lg
                transition-all duration-300 ease-in-out
                transform hover:scale-105 hover:shadow-lg
                focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-blue-600
              "
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="
                p-2 rounded-lg text-white
                hover:bg-white/10
                focus:outline-none focus:ring-2 focus:ring-white/50
                transition-transform duration-300 ease-in-out
                transform hover:scale-110
              "
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu with improved animation */}
      <div className={`
        md:hidden
        transition-all duration-300 ease-in-out
        ${isMobileMenuOpen 
          ? 'max-h-screen opacity-100 visible'
          : 'max-h-0 opacity-0 invisible'}
      `}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-gradient-to-b from-blue-600 to-blue-700 shadow-lg">
          {/* User Profile for Mobile */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-blue-500/30">
            {userData.avatar ? (
              <img 
                src={userData.avatar} 
                alt="User avatar" 
                className="h-10 w-10 rounded-full border-2 border-white/50"
              />
            ) : (
              <div className="h-10 w-10 bg-blue-800 rounded-full flex items-center justify-center text-white">
                <User className="h-5 w-5" />
              </div>
            )}
            <div>
              <div className="text-white font-medium">{userData.name}</div>
              <div className="text-blue-200 text-sm">Participant</div>
            </div>
          </div>
        
          <Link
            to="/participant/programs"
            className="
              flex items-center gap-3 px-4 py-3 rounded-lg
              text-white hover:bg-white/10
              transition-all duration-200
              transform hover:translate-x-1
            "
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <BookOpen className="h-5 w-5" />
            <span>My Programs</span>
          </Link>

          <Link
            to="/help"
            className="
              flex items-center gap-3 px-4 py-3 rounded-lg
              text-white hover:bg-white/10
              transition-all duration-200
              transform hover:translate-x-1
            "
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <HelpCircle className="h-5 w-5" />
            <span>Request Help</span>
          </Link>
          
          <Link
            to="/notifications"
            className="
              flex items-center gap-3 px-4 py-3 rounded-lg
              text-white hover:bg-white/10
              transition-all duration-200
              transform hover:translate-x-1
            "
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">3</span>
          </Link>
          
          <Link
            to="/settings"
            className="
              flex items-center gap-3 px-4 py-3 rounded-lg
              text-white hover:bg-white/10
              transition-all duration-200
              transform hover:translate-x-1
            "
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>

          <div className="pt-2 border-t border-blue-500/30 mt-2"></div>

          <button
            onClick={handleLogout}
            className="
              w-full flex items-center gap-3 px-4 py-3
              text-left text-white bg-red-500/20 hover:bg-red-500/30
              rounded-lg transition-all duration-200
            "
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes grow {
          from { width: 0; }
          to { width: 100%; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-grow {
          animation: grow 0.3s ease-out forwards;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;