import React, { useEffect, useState } from 'react';
import API from '../api';
import { 
  CheckCircle2, XCircle, Users, AlertCircle, MessageSquare, 
  FileText, Filter, User, Calendar, HelpCircle, Clock,
  Loader2, Shield, Bell, ChevronRight, Search, Zap
} from 'lucide-react';

const ProfessionalHelpRequests = () => {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchHelpRequests();
  }, [statusFilter]);

  const fetchHelpRequests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API.baseUrl}/help/all`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch help requests');
      setRequests(data.help_requests || []);
    } catch (err) {
      console.error('Error fetching help requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${API.baseUrl}/help/update/${selectedRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });

      if (!response.ok) throw new Error('Error updating status');
      await fetchHelpRequests();
      setShowModal(false);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200',
          icon: <Clock className="h-4 w-4 animate-spin animate-duration-[2s]" />
        };
      case 'In Progress':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-200',
          icon: <Loader2 className="h-4 w-4 animate-spin" />
        };
      case 'Resolved':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200',
          icon: <CheckCircle2 className="h-4 w-4 animate-pulse" />
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200',
          icon: <AlertCircle className="h-4 w-4 animate-bounce" />
        };
    };
  };
  
  const filteredRequests = requests
    .filter(r => statusFilter ? r.status === statusFilter : true)
    .filter(r => 
      r.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.guardian_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.request.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
                <HelpCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent 
                             bg-gradient-to-r from-blue-600 to-indigo-600">
                  Help Requests
                </h2>
                <p className="mt-1 text-gray-500 flex items-center">
                  <Bell className="h-4 w-4 mr-2" />
                  Manage and respond to participant assistance requests
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Filter className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <select
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Requests</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>
            <div className="relative flex-1 max-w-sm">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guardian</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center">
                      <Loader2 className="h-8 w-8 mx-auto mb-4 text-blue-600 animate-spin" />
                      <p className="text-gray-500">Loading requests...</p>
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center">
                      <AlertCircle className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500">No help requests found</p>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => {
                    const statusStyle = getStatusStyle(request.status);
                    return (
                      <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{request.guardian_name}</p>
                              <p className="text-xs text-gray-500">{request.guardian_email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">{request.participant_name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 max-w-md truncate">
                            {request.request}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full 
                                       text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} 
                                       ${statusStyle.border}`}>
                            <span className="mr-1.5">{statusStyle.icon}</span>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setStatus(request.status);
                              setNotes(request.notes || '');
                              setShowModal(true);
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent
                                     rounded-lg text-sm font-medium text-blue-600 bg-blue-50
                                     hover:bg-blue-100 focus:outline-none focus:ring-2
                                     focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Update Help Request</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Managing request for {selectedRequest.participant_name}
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             transition-shadow"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             transition-shadow min-h-[120px]"
                    placeholder="Add detailed notes about the request status..."
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700
                           hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={isUpdating}
                  className={`px-4 py-2 rounded-lg font-medium text-white
                           flex items-center space-x-2 ${
                             isUpdating 
                               ? 'bg-gray-400 cursor-not-allowed' 
                               : 'bg-blue-600 hover:bg-blue-700'
                           }`}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Save Changes</span>
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

export default ProfessionalHelpRequests;