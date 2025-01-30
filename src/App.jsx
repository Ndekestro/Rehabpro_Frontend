import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar'; // Navbar component
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ManageUsers from './pages/ManageUsers';
import ManagePrograms from './pages/ManagePrograms';
import ProfessionalPage from './pages/ProfessionalProgram';
import ManageChapters from './pages/ManageChapters';
import ParticipantPage from './pages/ParticipantPrograms'; // Participant Page
import ProfessionalProgress from './pages/ProgressProfessional';
import Home from './pages/Home';
import SignUp from './pages/Signup';
import ParticipantChatPage from './pages/Chats';
import AdminProfessionalChatPage from './pages/ProfessionalProfile';
import ForgotPassword from './pages/ForgotPassword';
import RehabParticipants from './pages/RehabParticipants';

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

const AppContent = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user')); // Retrieve user data from local storage
  const isLoggedIn = Boolean(user); // Check if the user is logged in
  const userRole = user?.role || ''; // Get the user's role

  return (
    <div className="flex flex-col min-h-screen">
      {/* Render Navbar for participants */}
      {isLoggedIn && userRole === 'participant' && location.pathname !== '/login' && <Navbar />}
      
      {/* Render Sidebar only for non-participant roles */}
      {isLoggedIn && userRole !== 'participant' && location.pathname !== '/login' && (
        <div className="flex">
          <Sidebar />
          <div className="ml-64 flex-1 p-5">
            <Routes>
              <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />} />
              <Route path="/home" element={<Home />} />

              <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/rehab" element={isLoggedIn ? <RehabParticipants/> : <Navigate to="/rehab" />} />
              <Route path="/users" element={isLoggedIn ? <ManageUsers /> : <Navigate to="/login" />} />
              <Route path="/programs" element={isLoggedIn ? <ManagePrograms /> : <Navigate to="/login" />} />
              <Route path="/chapters" element={isLoggedIn ? <ManageChapters /> : <Navigate to="/login" />} />
              <Route path="/professional/progress" element={isLoggedIn ? <ProfessionalProgress /> : <Navigate to="/login" />} />
              <Route path="/professional/programs" element={isLoggedIn ? <ProfessionalPage /> : <Navigate to="/login" />} />
              <Route path="/profile" element={isLoggedIn ? <AdminProfessionalChatPage /> : <Navigate to="/login" />} />
            </Routes>
          </div>
        </div>
      )}

      {/* Render content for participants */}
      {isLoggedIn && userRole === 'participant' && location.pathname !== '/login' && (
        <div className="flex-1 p-5 mt-16"> {/* Add margin-top to push content below Navbar */}
          <Routes>
            <Route path="/participant/programs" element={<ParticipantPage />} />
            <Route path="/home" element={<Home />} />

            <Route path="/chats" element={<ParticipantChatPage />} />
          </Routes>
        </div>
      )}

      {/* Login route */}
      {!isLoggedIn && (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ForgotPassword />} />

        </Routes>
      )}
    </div>
  );
};

export default App;
