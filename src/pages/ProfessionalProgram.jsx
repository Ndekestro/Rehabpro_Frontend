import React, { useEffect, useState } from 'react';
import API from '../api';
import { 
  BookOpen, Users, Award, User, UserPlus, UserMinus, Briefcase,
  CheckCircle, AlertTriangle, ChevronRight, Shield, UserCheck
} from 'lucide-react';

const ProfessionalPage = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [participantDetails, setParticipantDetails] = useState({});
  const [availableUsers, setAvailableUsers] = useState([]);
  const [newParticipantId, setNewParticipantId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });

  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'info' }), 4000);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'participant': return <User className="h-4 w-4" />;
      case 'counselor': return <Shield className="h-4 w-4" />;
      case 'professional': return <UserCheck className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'participant': return 'bg-blue-100 text-blue-700';
      case 'counselor': return 'bg-green-100 text-green-700';
      case 'professional': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id || user.role !== 'professional') {
        setError('Unauthorized access. Please log in as a professional.');
        showNotification('Unauthorized access. Please log in as a professional.', 'error');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API.baseUrl}/programs/role?role=professional&userId=${user.id}`);
      
      if (!response.ok) {
        if (response.status === 500) {
          setPrograms([]);
          showNotification('You are not currently assigned to any programs.', 'info');
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      } else {
        const data = await response.json();
        setPrograms(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      setError('Unable to fetch programs. You may not have any programs assigned yet.');
      showNotification('Error fetching programs. Please try again later.', 'error');
      setPrograms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      // Fetch all users from the correct endpoint
      const response = await fetch(`${API.baseUrl}/programs/participants`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const allUsers = await response.json();
      
      // Create details map for all users
      const detailsMap = {};
      allUsers.forEach(user => {
        detailsMap[user.id] = user;
      });
      setParticipantDetails(detailsMap);
      
      // Filter available users by role (participants and counselors only)
      // Exclude users already in the current program
      const currentParticipantIds = participants.map(id => id.toString());
      const availableUsers = allUsers.filter(user => 
        (user.role === 'participant' || user.role === 'counselor') &&
        !currentParticipantIds.includes(user.id.toString())
      );
      
      setAvailableUsers(availableUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('Could not load available users.', 'warning');
      setAvailableUsers([]);
    }
  };

  const handleSelectProgram = async (program) => {
    try {
      setSelectedProgram(program);
      setIsLoading(true);
      setError(null);
      
      const participantIds = program.participants ? 
        (typeof program.participants === 'string' ? program.participants.split(',') : program.participants) 
        : [];
      
      setParticipants(participantIds);
      await fetchAllUsers();
    } catch (error) {
      console.error('Error selecting program:', error);
      setError('An unexpected error occurred. Please try again.');
      showNotification('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    if (!newParticipantId) {
      showNotification('Please select a user to add', 'warning');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API.baseUrl}/programs/addparticipant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: selectedProgram.id,
          userId: newParticipantId,
        }),
      });

      if (response.ok) {
        const addedUser = availableUsers.find(p => p.id.toString() === newParticipantId);
        const userName = addedUser ? 
          `${addedUser.first_name || ''} ${addedUser.last_name || ''}`.trim() : 
          'User';

        showNotification(`${userName} successfully added to the program`, 'success');
        
        // Update participants list
        setParticipants(prev => [...prev, newParticipantId]);
        // Remove from available users
        setAvailableUsers(prev => prev.filter(p => p.id.toString() !== newParticipantId));
        setNewParticipantId('');
      } else {
        const errorData = await response.json().catch(() => ({}));
        showNotification(errorData.error || 'Error adding user. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error adding participant:', error);
      showNotification('Network error. Please check your connection and try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveParticipant = async (userId) => {
    setIsSubmitting(true);
    
    const userDetails = participantDetails[userId];
    const userName = userDetails ? 
      `${userDetails.first_name || ''} ${userDetails.last_name || ''}`.trim() : 
      'User';
    
    try {
      const response = await fetch(`${API.baseUrl}/programs/removeparticipant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: selectedProgram.id,
          userId,
        }),
      });

      if (response.ok) {
        setParticipants(prev => prev.filter(participantId => participantId !== userId));
        
        // Add back to available users if they're participant or counselor
        if (userDetails && (userDetails.role === 'participant' || userDetails.role === 'counselor')) {
          setAvailableUsers(prev => [...prev, userDetails]);
        }
        
        showNotification(`${userName} successfully removed from the program`, 'success');
      } else {
        const errorData = await response.json().catch(() => ({}));
        showNotification(errorData.error || 'Error removing user. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error removing participant:', error);
      showNotification('Network error. Please check your connection and try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFullName = (participantId) => {
    const details = participantDetails[participantId];
    if (!details) return `User ${participantId}`;
    return `${details.first_name || ''} ${details.last_name || ''}`.trim() || `User ${participantId}`;
  };

  const getUserRole = (participantId) => {
    const details = participantDetails[participantId];
    return details?.role || 'unknown';
  };

  if (isLoading && !selectedProgram) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading your programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
          notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
          notification.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
          notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
          'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Program Management</h1>
              <p className="text-gray-600">Manage programs and participants</p>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Programs */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2 text-blue-600" />
            Your Programs
          </h2>
          
          {programs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Programs Assigned</h3>
              <p className="text-gray-600">Contact an administrator if you believe this is an error.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {programs.map((program) => (
                <div
                  key={program.id}
                  onClick={() => handleSelectProgram(program)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedProgram?.id === program.id
                      ? 'bg-blue-50 border-2 border-blue-500 shadow-md'
                      : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">{program.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{program.description}</p>
                  
                  <div className="space-y-1 text-xs text-gray-500">
                    <p>Created by: <span className="font-medium">{program.created_by_name}</span></p>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                        ${program.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                      `}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {program.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Program Details */}
        {selectedProgram && (
          <div className="space-y-6">
            {isLoading ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading program details...</p>
              </div>
            ) : (
              <>
                {/* Add User Section */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <UserPlus className="h-5 w-5 mr-2 text-green-600" />
                    Add User to {selectedProgram.name}
                  </h3>
                  
                  {availableUsers.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-gray-600">No available users to add</p>
                    </div>
                  ) : (
                    <form onSubmit={handleAddParticipant} className="flex gap-4">
                      <div className="flex-1">
                        <select
                          value={newParticipantId}
                          onChange={(e) => setNewParticipantId(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Select a user to add</option>
                          {availableUsers.map((user) => (
                            <option key={user.id} value={user.id}>
                              {`${user.first_name || ''} ${user.last_name || ''}`.trim() || `User ${user.id}`} 
                              ({user.role})
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {isSubmitting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        ) : (
                          <UserPlus className="h-4 w-4 mr-2" />
                        )}
                        Add
                      </button>
                    </form>
                  )}
                </div>

                {/* Current Participants */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Current Participants ({participants.length})
                  </h3>
                  
                  {participants.length > 0 ? (
                    <div className="space-y-2">
                      {participants.map((participantId) => {
                        const role = getUserRole(participantId);
                        return (
                          <div
                            key={participantId}
                            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                {getRoleIcon(role)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{getFullName(participantId)}</p>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(role)}`}>
                                  {role}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveParticipant(participantId)}
                              disabled={isSubmitting}
                              className="px-3 py-1 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors disabled:opacity-50 flex items-center"
                            >
                              <UserMinus className="h-4 w-4 mr-1" />
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Participants</h4>
                      <p className="text-gray-600">Add participants using the form above.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalPage;