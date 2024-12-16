import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ManageUsers from './pages/ManageUsers';
import ManagePrograms from './pages/ManagePrograms';
import ProfessionalPage from './pages/ProfessionalProgram';
import ManageChapters from './pages/ManageChapters';

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

const AppContent = () => {
  const location = useLocation();
  const isLoggedIn = Boolean(localStorage.getItem('user')); // Check if the user is logged in by presence of user data

  return (
    <div className="flex">
      {/* Render Sidebar only if the user is logged in */}
      {isLoggedIn && location.pathname !== '/login' && <Sidebar />}
      <div className={isLoggedIn ? 'ml-64 flex-1 p-5' : 'flex-1 p-5'}>
        <Routes>
          <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/users" element={isLoggedIn ? <ManageUsers /> : <Navigate to="/login" />} />
          <Route path="/programs" element={isLoggedIn ? <ManagePrograms /> : <Navigate to="/login" />} />
          <Route path="/chapters" element={isLoggedIn ? <ManageChapters /> : <Navigate to="/login" />} />
          <Route path="/professional/programs" element={isLoggedIn ? <ProfessionalPage /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
