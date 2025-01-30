import React, { useEffect, useState } from 'react';
import { UserCircle, Mail, Briefcase, User, Users } from 'lucide-react';
import API from '../api';

const ProfessionalDashboard = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem('user'));

        if (!loggedInUser || loggedInUser.role !== 'professional') {
          setError('Access denied. Only professionals can view their details.');
          return;
        }

        const response = await fetch(
          `${API.baseUrl}/users/professionals/view-user/${loggedInUser.id}/${loggedInUser.role}`
        );
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Failed to fetch user details');

        setUser(data.user);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUserDetails();
  }, []);

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="bg-blue-100 p-3 rounded-full">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">My Profile</h2>
          <p className="text-blue-600 font-medium">Professional Dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {user ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem
              icon={UserCircle}
              label="Full Name"
              value={user.name}
            />
            <InfoItem
              icon={Briefcase}
              label="Role"
              value={user.role}
            />
            <InfoItem
              icon={Briefcase}
              label="Profession"
              value={user.profession}
            />
            <InfoItem
              icon={Mail}
              label="Email"
              value={user.email}
            />
            <InfoItem
              icon={User}
              label="Username"
              value={user.username}
            />
            <InfoItem
              icon={Users}
              label="Gender"
              value={user.gender}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-sm">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-gray-500 font-medium">Loading your profile...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalDashboard;