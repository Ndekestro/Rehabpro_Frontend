import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Briefcase, CheckCircle, 
  BarChart, LogOut, ChevronLeft, ChevronRight,
  Home, BookOpen, Award, Settings, HelpCircle,
  UserCircle, Activity, Heart, Brain, FileText,
  Shield, Gauge,MessageSquareWarning
} from 'lucide-react';

const Sidebar = () => {
  const [role, setRole] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeItem, setActiveItem] = useState('');
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
        console.error('Error parsing user data:', error);
        navigate('/login');
      }
    };

    fetchRoleFromLocalStorage();
    setActiveItem(window.location.pathname);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const SidebarItem = ({ icon: Icon, label, path, badge }) => {
    const isActive = activeItem === path;
    
    return (
      <li 
        onClick={() => {
          setActiveItem(path);
          navigate(path);
        }}
        className={`flex items-center px-4 py-3 cursor-pointer
          rounded-lg transition-all duration-200 relative
          ${isActive 
            ? 'bg-blue-600 text-white' 
            : 'hover:bg-white/10 text-blue-100'}`}
      >
        <div className="flex items-center w-full">
          <div className={`flex items-center justify-center w-8 h-8 
            ${isActive ? 'text-white' : 'text-blue-300'}`}>
            <Icon className="w-5 h-5" />
          </div>
          
          {isExpanded && (
            <div className="flex items-center justify-between w-full ml-3">
              <span className={`font-medium transition-colors duration-200
                ${isActive ? 'text-white' : 'text-blue-100'}`}>
                {label}
              </span>
              {badge && (
                <span className="px-2 py-1 text-xs font-bold rounded-full 
                  bg-red-500 text-white">
                  {badge}
                </span>
              )}
            </div>
          )}
        </div>
        
        {isActive && (
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2
            w-1 h-8 bg-white rounded-r-full" />
        )}
      </li>
    );
  };

  const SidebarSection = ({ title, children }) => (
    <div className="mb-6">
      {isExpanded && title && (
        <h3 className="px-4 mb-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <ul className="space-y-1">
        {children}
      </ul>
    </div>
  );

  const renderAdminItems = () => (
    <>
      <SidebarSection title="Main">
        <SidebarItem 
          icon={LayoutDashboard} 
          label="Dashboard" 
          path="/dashboard"
        />
        <SidebarItem 
          icon={Shield} 
          label="Manage Users" 
          path="/users"
          badge="New"
        />
      </SidebarSection>

      <SidebarSection title="Management">
        <SidebarItem 
          icon={BookOpen} 
          label="Programs" 
          path="/programs"
        />
        <SidebarItem 
          icon={FileText} 
          label="Chapters" 
          path="/chapters"
        />
        <SidebarItem 
          icon={Brain} 
          label="Rehab Participants" 
          path="/rehab"
        />
        <SidebarItem 
          icon={MessageSquareWarning} 
          label="Reports" 
          path="/reports"
        />
      </SidebarSection>

      <SidebarSection title="Support">
        <SidebarItem 
          icon={HelpCircle} 
          label="Help Center" 
          path="/admin/help"
        />
      </SidebarSection>
    </>
  );

  const renderProfessionalItems = () => (
    <>
      <SidebarSection title="Overview">
        <SidebarItem 
          icon={LayoutDashboard} 
          label="Dashboard" 
          path="/dashboard"
        />
        <SidebarItem 
          icon={Briefcase} 
          label="Your Programs" 
          path="/professional/programs"
        />
      </SidebarSection>

      <SidebarSection title="Participants">
        <SidebarItem 
          icon={Activity} 
          label="Progress Tracking" 
          path="/professional/progress"
        />
        <SidebarItem 
          icon={Users} 
          label="Assigned Participants" 
          path="/assignedprofessionals"
          badge="5"
        />
      </SidebarSection>

      <SidebarSection title="Resources">
        <SidebarItem 
          icon={FileText} 
          label="Chapters" 
          path="/chapters"
        />
        <SidebarItem 
          icon={HelpCircle} 
          label="Help Center" 
          path="/professional/help"
        />
        <SidebarItem 
          icon={UserCircle} 
          label="Your Profile" 
          path="/profile"
        />
      </SidebarSection>
    </>
  );

  const renderParticipantItems = () => (
    <>
      <SidebarSection title="Your Journey">
        <SidebarItem 
          icon={Home} 
          label="My Dashboard" 
          path="/dashboard"
        />
        <SidebarItem 
          icon={Activity} 
          label="Progress" 
          path="/progress"
        />
        <SidebarItem 
          icon={Award} 
          label="Achievements" 
          path="/achievements"
        />
      </SidebarSection>
    </>
  );

  return (
    <div 
      className={`bg-gradient-to-b from-blue-900 to-blue-950 min-h-screen
        fixed top-0 left-0 shadow-xl transition-all duration-300 
        ${isExpanded ? 'w-64' : 'w-20'} z-50
        border-r border-blue-800/50`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-blue-800/50">
        {isExpanded && (
          <div className="flex items-center space-x-2">
            <Gauge className="w-6 h-6 text-blue-300" />
            <h3 className="text-lg font-bold bg-gradient-to-r from-blue-200 to-blue-400 
              bg-clip-text text-transparent">
              RehabCenter
            </h3>
          </div>
        )}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg hover:bg-white/10 text-blue-300 
            hover:text-white transition-colors duration-200"
        >
          {isExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="py-6 space-y-4">
        {role === 'admin' && renderAdminItems()}
        {role === 'professional' && renderProfessionalItems()}
        {role === 'participant' && renderParticipantItems()}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-800/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2
            bg-gradient-to-r from-red-600 to-red-700 text-white
            px-4 py-3 rounded-lg font-medium
            hover:from-red-700 hover:to-red-800
            transform hover:scale-[0.98] active:scale-[0.97]
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
            focus:ring-offset-blue-950"
        >
          <LogOut className="w-5 h-5" />
          {isExpanded && 'Logout'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;