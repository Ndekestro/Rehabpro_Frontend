import React, { useEffect, useState } from 'react';
import API from '../api';
import { 
  Edit2, Save, XCircle, Users, User, BookOpen, 
  Calendar, AlertCircle, CheckCircle, ClipboardList,
  ChevronRight
} from 'lucide-react';

const AssignedParticipants = () => {
  const [participants, setParticipants] = useState([]);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const professionalId = JSON.parse(localStorage.getItem('user'))?.id;

  useEffect(() => {
    fetchAssignedParticipants();
  }, []);

  const fetchAssignedParticipants = async () => {
    try {
      const response = await fetch(`${API.baseUrl}/rehab/assigned/${professionalId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch participants');
      setParticipants(data.participants);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleUpdateStatus = async (participantId) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${API.baseUrl}/rehab/update-status/${participantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });

      if (!response.ok) throw new Error('Error updating status');

      setIsUpdating(false);
      fetchAssignedParticipants();
      setSelectedParticipant(null);
    } catch (err) {
      setIsUpdating(false);
      console.error('Error:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Discharged':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Transferred':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">
              Assigned Participants
            </h2>
          </div>
          <div className="flex items-center text-gray-600">
            <ChevronRight className="h-4 w-4 mx-2" />
            <span>Manage and monitor your assigned rehabilitation participants</span>
          </div>
        </div>

        {participants.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <AlertCircle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No assigned participants found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">Participant</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">Guardian</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">Condition</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">Notes</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {participants.map((p) => (
                    <tr key={p.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {p.first_name?.charAt(0)?.toUpperCase() + p.last_name?.charAt(0)?.toUpperCase()}
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
                        <div className="font-medium text-gray-900">{p.guardian_first_name  + ' ' + p.guardian_last_name}</div>
                        <div className="text-sm text-gray-500">{p.guardian_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                          <BookOpen className="h-4 w-4 mr-2" />
                          {p.condition}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="text-sm text-gray-600 truncate">
                          {p.notes || <span className="text-gray-400 italic">No notes</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => {
                            setSelectedParticipant(p);
                            setStatus(p.status);
                            setNotes(p.notes || '');
                          }}
                          className="inline-flex items-center px-3 py-2 rounded-md
                                   text-sm font-medium text-blue-600 hover:text-blue-700
                                   hover:bg-blue-50 transition-colors duration-150"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Update Status Modal */}
        {selectedParticipant && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full m-4 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {selectedParticipant.first_name?.charAt(0)?.toUpperCase() + selectedParticipant.last_name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Update Status
                      </h3>
                      <p className="text-sm text-gray-500">{selectedParticipant.first_name + ' ' + selectedParticipant.last_name}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedParticipant(null)}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 
                             focus:ring-blue-500 focus:border-blue-500 transition-shadow
                             text-gray-900"
                  >
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Discharged">Discharged</option>
                    <option value="Transferred">Transferred</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    placeholder="Add detailed notes about the participant's progress..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 
                             focus:ring-blue-500 focus:border-blue-500 transition-shadow
                             text-gray-900 min-h-[120px]"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedParticipant(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 
                           text-gray-700 hover:bg-gray-50 transition-colors
                           font-medium focus:outline-none focus:ring-2 
                           focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedParticipant.id)}
                  disabled={isUpdating}
                  className={`px-4 py-2 rounded-lg font-medium text-white
                            focus:outline-none focus:ring-2 focus:ring-offset-2 
                            focus:ring-blue-500 flex items-center ${
                              isUpdating 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                >
                  {isUpdating ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedParticipants;