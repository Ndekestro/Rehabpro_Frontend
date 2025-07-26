import React, { useEffect, useState } from 'react';
import API from '../api';
import { 
  Users, User, BookOpen, Calendar, AlertCircle, CheckCircle, 
  Clock, TrendingUp, Eye, Activity, Heart, Brain,
  ChevronRight, Timer, AlertTriangle, Trophy, Star
} from 'lucide-react';

const GuardianParticipants = () => {
  const [participants, setParticipants] = useState([]);
  const [summary, setSummary] = useState({});
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const guardianId = JSON.parse(localStorage.getItem('user'))?.id;

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API.baseUrl}/rehab/guardian/${guardianId}/participants`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to fetch participants');
      
      setParticipants(data.participants || []);
      setSummary(data.summary || {});
      setError('');
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipantDetails = async (participantId) => {
    try {
      const response = await fetch(`${API.baseUrl}/rehab/guardian/participant/${participantId}/progress?guardianId=${guardianId}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to fetch participant details');
      
      setSelectedParticipant(data.participant);
    } catch (err) {
      console.error('Error:', err);
      alert('Error fetching participant details: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Discharged':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Transferred':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return <Activity className="h-4 w-4" />;
      case 'Discharged':
        return <CheckCircle className="h-4 w-4" />;
      case 'Transferred':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading participants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <Heart className="h-8 w-8 text-green-600" />
            <h2 className="text-3xl font-bold text-gray-900">
              My Participants
            </h2>
          </div>
          <div className="flex items-center text-gray-600">
            <ChevronRight className="h-4 w-4 mx-2" />
            <span>Monitor the rehabilitation progress of your participants</span>
          </div>
        </div>

        {/* Summary Cards */}
        {Object.keys(summary).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-blue-600">{summary.active || 0}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Discharged</p>
                  <p className="text-2xl font-bold text-green-600">{summary.discharged || 0}</p>
                </div>
                <Trophy className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-amber-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Transferred</p>
                  <p className="text-2xl font-bold text-amber-600">{summary.transferred || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{summary.overdue || 0}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {participants.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Users className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No participants found</p>
            <p className="text-gray-500">You don't have any participants assigned to you yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-green-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-green-900">Participant</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-green-900">Professional</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-green-900">Condition</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-green-900">Progress</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-green-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-green-900">Time Info</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-green-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {participants.map((p) => (
                    <tr key={p.id} className="hover:bg-green-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {p.first_name?.charAt(0)?.toUpperCase()}{p.last_name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{p.first_name + ' ' + p.last_name}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {p.gender}, {p.age} years
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{p.professional_info?.name}</div>
                        <div className="text-sm text-gray-500">{p.professional_info?.profession}</div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700">
                          <BookOpen className="h-4 w-4 mr-2" />
                          {p.condition}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(p.progress_percentage)}`}
                              style={{ width: `${p.progress_percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {p.progress_percentage}%
                          </span>
                        </div>
                        {p.is_overdue && (
                          <div className="flex items-center text-red-600 text-xs mt-1">
                            <Timer className="h-3 w-3 mr-1" />
                            Overdue
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(p.status)}`}>
                          {getStatusIcon(p.status)}
                          <span className="ml-1">{p.status}</span>
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center mb-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            Started: {formatDate(p.admission_date)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {p.time_remaining > 0 ? `${p.time_remaining} days left` : 'Time expired'}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => fetchParticipantDetails(p.id)}
                          className="inline-flex items-center px-3 py-2 rounded-md
                                   text-sm font-medium text-green-600 hover:text-green-700
                                   hover:bg-green-50 transition-colors duration-150"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Participant Details Modal */}
        {selectedParticipant && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full m-4 overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full bg-green-600 flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {selectedParticipant.first_name?.charAt(0)?.toUpperCase()}{selectedParticipant.last_name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {selectedParticipant.first_name + ' ' + selectedParticipant.last_name}
                      </h3>
                      <p className="text-gray-600">{selectedParticipant.gender}, {selectedParticipant.age} years old</p>
                      <div className="flex items-center mt-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedParticipant.status)}`}>
                          {getStatusIcon(selectedParticipant.status)}
                          <span className="ml-1">{selectedParticipant.status}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedParticipant(null)}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Progress Section */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Rehabilitation Progress
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Overall Progress</span>
                      <span className="font-semibold text-green-600">{selectedParticipant.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(selectedParticipant.progress_percentage)}`}
                        style={{ width: `${selectedParticipant.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Brain className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="text-gray-900">{selectedParticipant.condition}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date</label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-gray-900">{formatDate(selectedParticipant.admission_date)}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Days in Rehabilitation</label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Timer className="h-5 w-5 text-orange-500 mr-2" />
                        <span className="text-gray-900">{selectedParticipant.days_in_rehab} days</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time Remaining</label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Clock className="h-5 w-5 text-purple-500 mr-2" />
                        <span className={`font-medium ${selectedParticipant.time_remaining <= 0 ? 'text-red-600' : 'text-gray-900'}`}>
                          {selectedParticipant.time_remaining > 0 ? `${selectedParticipant.time_remaining} days left` : 'Time expired'}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expected Completion</label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Star className="h-5 w-5 text-yellow-500 mr-2" />
                        <span className={`${
                          selectedParticipant.expected_completion_date === 'Overdue' ? 'text-red-600 font-semibold' :
                          selectedParticipant.expected_completion_date === 'Completed' ? 'text-green-600 font-semibold' :
                          selectedParticipant.expected_completion_date === 'Transferred' ? 'text-amber-600 font-semibold' :
                          'text-gray-900'
                        }`}>
                          {selectedParticipant.expected_completion_date === 'Completed' || 
                           selectedParticipant.expected_completion_date === 'Transferred' || 
                           selectedParticipant.expected_completion_date === 'Overdue' || 
                           selectedParticipant.expected_completion_date === 'Unknown' 
                            ? selectedParticipant.expected_completion_date 
                            : formatDate(selectedParticipant.expected_completion_date)}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Professional</label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900">{selectedParticipant.professional_info?.name}</div>
                        <div className="text-sm text-gray-600">{selectedParticipant.professional_info?.profession}</div>
                        <div className="text-sm text-blue-600">{selectedParticipant.professional_info?.email}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                {selectedParticipant.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Professional Notes</label>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-gray-800">{selectedParticipant.notes}</p>
                    </div>
                  </div>
                )}

                {/* Alerts */}
                {selectedParticipant.is_overdue && selectedParticipant.status === 'Active' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      <p className="text-red-800 font-medium">
                        This rehabilitation program is overdue. Please contact the assigned professional.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setSelectedParticipant(null)}
                  className="px-6 py-2 rounded-lg bg-green-600 text-white font-medium
                           hover:bg-green-700 transition-colors focus:outline-none 
                           focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuardianParticipants;