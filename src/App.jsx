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
import AssignedParticipants from './pages/Assigned';
import GuardianHelpRequests from './pages/RequestHelp';
import ProfessionalHelpRequests from './pages/ProfessionalReuquestHelp';
import AdminHelpDashboard from './pages/AdminHelp';
import AdminReports from './pages/Report';
import SendEmail from './pages/Email';
import ReportsDashboard from './pages/ParticipantsReport';

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

  // Hilariously mocking messages for sneaky unauthenticated users
  const getHumorousMessage = () => {
    const messages = [
      "😂 HAHAHA! Did you really think you could just waltz in here without logging in? That's adorable! 🤣",
      "🙈 Oh honey, bless your heart! Trying to sneak into our exclusive club without a membership card? NICE TRY! 😆",
      "🤡 *Points and laughs* Look everyone, we've got a comedian here who thinks they can access this page for FREE! 🎪",
      "🕵️‍♂️ BUSTED! Our security system just had a good chuckle at your sneaky attempt! Better luck next time, agent 007! 🚨",
      "🍿 *Grabs popcorn* This is entertaining! Watching someone try to access premium content without logging in! What's next? 🎬",
      "🤦‍♀️ Oh dear... someone didn't read the 'MEMBERS ONLY' sign! It's okay, we all make embarrassing mistakes! 😅",
      "🚪 *Slams door* NOPE! Not today, mystery person! This VIP lounge has standards! Come back with proper credentials! 💅",
      "😏 Aww, look at you trying so hard! It's like watching a cat try to bark - adorable but completely pointless! 🐱",
      "🎭 What a PERFORMANCE! Truly Oscar-worthy attempt at sneaking in! Unfortunately, this theater requires tickets! 🏆",
      "🤪 LOL! You're about as sneaky as a neon sign in a dark room! Login required, my confused friend! ✨",
      "🙄 Really? REALLY?! You thought you could just... click and enter? That's not how this works, that's not how ANY of this works! 🤷‍♀️",
      "😈 *Evil laugh* MWAHAHAHA! Another soul tries to breach our fortress without the sacred login ritual! BEGONE! ⚡"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const UnauthenticatedMessage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center transform hover:scale-105 transition-transform duration-300">
        <div className="mb-6">
          <div className="text-6xl mb-4 animate-bounce">🤣</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">CAUGHT RED-HANDED!</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6 font-medium">
            {getHumorousMessage()}
          </p>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={() => window.location.href = '/login'}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
              text-white font-semibold py-3 px-6 rounded-lg transform hover:scale-105 transition-all duration-200 
              shadow-lg hover:shadow-xl"
          >
            🚀 Take Me to Login!
          </button>
          
          <button 
            onClick={() => window.location.href = '/signup'}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 
              text-white font-semibold py-3 px-6 rounded-lg transform hover:scale-105 transition-all duration-200 
              shadow-lg hover:shadow-xl"
          >
            ✨ New Here? Sign Up!
          </button>
          
          <button 
            onClick={() => window.location.href = '/home'}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 
              text-white font-semibold py-3 px-6 rounded-lg transform hover:scale-105 transition-all duration-200 
              shadow-lg hover:shadow-xl"
          >
            🏠 Back to Home
          </button>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>😏 Lesson learned: Always login before trying to be sneaky!</p>
          <p className="mt-1">🎯 Pro tip: We see EVERYTHING!</p>
        </div>
      </div>
    </div>
  );

  // Show humorous message for protected routes when not logged in
  const protectedRoutes = ['/dashboard', '/users', '/programs', '/chapters', '/profile', '/rehab', '/reports', '/assignedprofessionals', '/participantsreport', '/professional/programs', '/professional/progress', '/professional/help', '/admin/help', '/sendemail', '/participant/programs', '/chats', '/help'];
  
  if (!isLoggedIn && protectedRoutes.includes(location.pathname)) {
    return <UnauthenticatedMessage />;
  }

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
              <Route path="/professional/help" element={isLoggedIn ? <ProfessionalHelpRequests /> : <Navigate to="/login" />} />
              <Route path="/admin/help" element={isLoggedIn ? <AdminHelpDashboard /> : <Navigate to="/login" />} />
              <Route path="/reports" element={isLoggedIn ? <AdminReports /> : <Navigate to="/login" />} />
              <Route path="/assignedprofessionals" element={isLoggedIn ? <AssignedParticipants /> : <Navigate to="/assignedprofessionals" />} />
              <Route path="/users" element={isLoggedIn ? <ManageUsers /> : <Navigate to="/login" />} />
              <Route path="/programs" element={isLoggedIn ? <ManagePrograms /> : <Navigate to="/login" />} />
              <Route path="/chapters" element={isLoggedIn ? <ManageChapters /> : <Navigate to="/login" />} />
              <Route path="/participantsreport" element={isLoggedIn ? <ReportsDashboard /> : <Navigate to="/ReportsDashboard" />} />
              <Route path="/professional/progress" element={isLoggedIn ? <ProfessionalProgress /> : <Navigate to="/login" />} />
              <Route path="/professional/programs" element={isLoggedIn ? <ProfessionalPage /> : <Navigate to="/login" />} />
              <Route path="/profile" element={isLoggedIn ? <AdminProfessionalChatPage /> : <Navigate to="/login" />} />
              <Route path="/sendemail" element={isLoggedIn? <SendEmail /> : <Navigate to="/login" />} />
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
            <Route path="/help" element={<GuardianHelpRequests />} />
            <Route path="/chats" element={<ParticipantChatPage />} />
          </Routes>
        </div>
      )}

      {/* Login route */}
      {!isLoggedIn && (
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
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