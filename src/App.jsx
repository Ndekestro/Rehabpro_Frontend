// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';

const App = () => {
  return (
    <Router> {/* Router should wrap everything */}
      <AppContent />
    </Router>
  );
};

// Separate out the content of App to use useLocation() hook correctly
const AppContent = () => {
  const location = useLocation(); // Get the current route location

  // Hide the Sidebar on the login page
  const showSidebar = location.pathname !== '/login';

  return (
    <>
      {showSidebar && <Sidebar />} {/* Conditionally render Sidebar */}
      <div className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
