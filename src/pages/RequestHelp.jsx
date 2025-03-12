import React, { useEffect, useState } from 'react';
import API from '../api';
import { 
  HelpCircle, Send, User, Calendar, 
  Clock, AlertCircle, CheckCircle, 
  XCircle, MessageSquare, Users
} from 'lucide-react';

const GuardianHelpRequests = () => {
  const [participants, setParticipants] = useState([]);
  const [requests, setRequests] = useState([]);
  const [participantId, setParticipantId] = useState('');
  const [requestText, setRequestText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const guardianId = JSON.parse(localStorage.getItem('user'))?.id;

  useEffect(() => {
    fetchParticipants();
    fetchRequests();
  }, []);

  const fetchParticipants = async () => {
    try {
      const response = await fetch(`${API.baseUrl}/rehab/guardians/${guardianId}/participants`);
      const data = await response.json();
      setParticipants(data.participants || []);
    } catch (err) {
      console.error('Error fetching participants:', err);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${API.baseUrl}/help/guardian/${guardianId}`);
      const data = await response.json();
      setRequests(data.help_requests || []);
    } catch (err) {
      console.error('Error fetching help requests:', err);
    }
  };

  const handleSubmitRequest = async () => {
    if (!participantId || !requestText) {
      alert('Please select a participant and enter a request.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API.baseUrl}/help/request-help`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          guardian_id: guardianId, 
          participant_id: participantId, 
          request: requestText 
        }),
      });

      if (!response.ok) throw new Error('Error submitting request');
      setRequestText('');
      setParticipantId('');
      fetchRequests();
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <HelpCircle className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">Request Help</h2>
          </div>
          <p className="text-gray-600 ml-11">Submit assistance requests for participants in rehabilitation</p>
        </div>

        {/* Request Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="max-w-3xl">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Participant</label>
              <div className="relative">
                <select
                  value={participantId}
                  onChange={(e) => setParticipantId(e.target.value)}
                  className="w-full p-3 pr-10 bg-white border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           appearance-none transition-shadow text-gray-900"
                >
                  <option value="">Choose a participant</option>
                  {participants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.first_name} (Condition: {p.condition})
                    </option>
                  ))}
                </select>
                <Users className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Describe the Issue</label>
              <div className="relative">
                <textarea
                  value={requestText}
                  onChange={(e) => setRequestText(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-blue-500 focus:border-blue-500 transition-shadow
                           min-h-[120px] text-gray-900"
                  placeholder="Please provide detailed information about the issue..."
                ></textarea>
                <MessageSquare className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <button
              onClick={handleSubmitRequest}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg
                       hover:bg-blue-700 focus:outline-none focus:ring-2 
                       focus:ring-offset-2 focus:ring-blue-500 transition-colors
                       disabled:bg-gray-400 disabled:cursor-not-allowed
                       flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Previous Requests Section */}
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <Clock className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">Previous Requests</h3>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        No requests found
                      </td>
                    </tr>
                  ) : (
                    requests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {request.participant_first_name} {request.participant_last_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 max-w-md">
                            {request.request}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                                       border ${getStatusStyles(request.status)}`}>
                            {request.status === 'resolved' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {request.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                            {request.status === 'in progress' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(request.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 max-w-md">
                            {request.notes}
                          </p>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuardianHelpRequests;