import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CheckCircle, 
  BarChart, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const [role, setRole] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoleFromLocalStorage = () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        navigate('/login');
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        setRole(parsedUser.role);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        navigate('/login');
      }
    };

    fetchRoleFromLocalStorage();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const SidebarItem = ({ icon: Icon, label, onClick }) => (
    <li 
      onClick={onClick}
      className="flex items-center px-4 py-3 cursor-pointer 
        hover:bg-blue-900/30 rounded-lg transition-all duration-300 
        group relative"
    >
      <Icon className="w-5 h-5 mr-3 text-blue-300 group-hover:text-white" />
      {isExpanded && (
        <span className="text-blue-200 group-hover:text-white font-medium">
          {label}
        </span>
      )}
    </li>
  );

  const renderAdminItems = () => (
    <>
      <SidebarItem 
        icon={LayoutDashboard} 
        label="Dashboard" 
        onClick={() => navigate('/dashboard')} 
      />
      <SidebarItem 
        icon={Users} 
        label="Manage Users" 
        onClick={() => navigate('/users')} 
      />
      <SidebarItem 
        icon={Briefcase} 
        label="Manage Programs" 
        onClick={() => navigate('/programs')} 
      />
      <SidebarItem 
        icon={Briefcase} 
        label="Manage Chapters" 
        onClick={() => navigate('/chapters')} 
      />
       <SidebarItem 
        icon={BarChart} 
        label="Chats" 
        onClick={() => navigate('/chats')} 
      />
    </>
  );

  const renderProfessionalItems = () => (
    <>
      <SidebarItem 
        icon={LayoutDashboard} 
        label="Dashboard" 
        onClick={() => navigate('/dashboard')} 
      />
      <SidebarItem 
        icon={BarChart} 
        label="Your Programs" 
        onClick={() => navigate('/professional/programs')} 
      />
      <SidebarItem 
        icon={Briefcase} 
        label="Manage Chapters" 
        onClick={() => navigate('/chapters')} 
      />
       <SidebarItem 
        icon={BarChart} 
        label="Participants Progress" 
        onClick={() => navigate('/professional/progress')} 
      />
       <SidebarItem 
        icon={BarChart} 
        label="Chats" 
        onClick={() => navigate('/chats')} 
      />
    </>
  );

  const renderParticipantItems = () => (
    <>
      <SidebarItem 
        icon={LayoutDashboard} 
        label="My Dashboard" 
        onClick={() => navigate('/dashboard')} 
      />
      <SidebarItem 
        icon={CheckCircle} 
        label="Progress" 
        onClick={() => navigate('/progress')} 
      />
    </>
  );

  return (
    <div 
      className={`bg-blue-950 text-white h-screen fixed top-0 left-0 
        shadow-2xl transition-all duration-300 
        ${isExpanded ? 'w-64' : 'w-20'} z-50`}
    >
      <div className="flex items-center justify-between p-5 border-b border-blue-900">
        {isExpanded && (
          <h3 className="text-xl font-bold text-blue-200">Dashboard</h3>
        )}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-300 hover:text-white focus:outline-none"
        >
          {isExpanded ? '←' : '→'}
        </button>
      </div>

      <ul className="mt-6 space-y-2">
        {role === 'admin' && renderAdminItems()}
        {role === 'professional' && renderProfessionalItems()}
        {role === 'participant' && renderParticipantItems()}
      </ul>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-900">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center 
            bg-red-700 text-white py-3 rounded-lg 
            hover:bg-red-800 transition-colors duration-300"
        >
          <LogOut className="w-5 h-5 mr-2" />
          {isExpanded && 'Logout'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;