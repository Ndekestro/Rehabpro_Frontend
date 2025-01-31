import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Home, BookOpen, HelpCircle, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const navLinkClass = (path) => `
    relative group flex items-center gap-2 px-4 py-2 rounded-lg
    transition-all duration-200 ease-in-out
    ${isActivePath(path) 
      ? 'bg-white/10 text-white' 
      : 'text-blue-100 hover:bg-white/10 hover:text-white'}
  `;

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50
      transition-all duration-300 ease-in-out
      ${isScrolled ? 'bg-blue-600 shadow-lg' : 'bg-blue-600'}
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 text-white font-bold text-xl hover:opacity-90 transition-opacity"
            >
              <Home className="h-6 w-6" />
              <span className="hidden sm:block">Participant Portal</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link 
              to="/participant/programs" 
              className={navLinkClass('/participant/programs')}
            >
              <BookOpen className="h-5 w-5" />
              <span>My Programs</span>
              {isActivePath('/participant/programs') && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-white transform origin-left" />
              )}
            </Link>

            <Link 
              to="/help" 
              className={navLinkClass('/help')}
            >
              <HelpCircle className="h-5 w-5" />
              <span>Request Help</span>
              {isActivePath('/help') && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-white transform origin-left" />
              )}
            </Link>

            <button
              onClick={handleLogout}
              className="
                flex items-center gap-2 px-4 py-2 ml-4
                bg-red-500 hover:bg-red-600 
                text-white rounded-lg
                transition-all duration-200 ease-in-out
                transform hover:scale-105
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
                p-2 rounded-lg text-blue-100 
                hover:bg-white/10 hover:text-white
                focus:outline-none focus:ring-2 focus:ring-white
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

      {/* Mobile Menu */}
      <div className={`
        md:hidden
        transition-all duration-300 ease-in-out
        ${isMobileMenuOpen 
          ? 'max-h-screen opacity-100 visible'
          : 'max-h-0 opacity-0 invisible'}
      `}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-blue-600 shadow-lg">
          <Link
            to="/participant/programs"
            className="
              flex items-center gap-2 px-4 py-3 rounded-lg
              text-blue-100 hover:bg-white/10 hover:text-white
              transition-colors duration-200
            "
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <BookOpen className="h-5 w-5" />
            <span>My Programs</span>
          </Link>

          <Link
            to="/help"
            className="
              flex items-center gap-2 px-4 py-3 rounded-lg
              text-blue-100 hover:bg-white/10 hover:text-white
              transition-colors duration-200
            "
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <HelpCircle className="h-5 w-5" />
            <span>Help</span>
          </Link>

          <button
            onClick={handleLogout}
            className="
              w-full flex items-center gap-2 px-4 py-3
              text-left text-red-100 hover:bg-red-500/20 hover:text-white
              rounded-lg transition-colors duration-200
            "
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;