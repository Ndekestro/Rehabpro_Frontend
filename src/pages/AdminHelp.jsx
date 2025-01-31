import React, { useEffect, useState } from 'react';
import API from '../api';
import { 
  FileText, Users, AlertTriangle, CheckCircle2, 
  Clock, Loader2, BarChart2, Filter, User,
  Shield, ChevronUp, ChevronDown, Activity,
  Calendar
} from 'lucide-react';

const AdminHelpDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [summary, setSummary] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchHelpRequests(), fetchHelpSummary()]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHelpRequests = async () => {
    try {
      const response = await fetch(`${API.baseUrl}/help/help-requests`);
      const data = await response.json();
      if (!response.ok) throw new Error('Failed to fetch help requests');
      setRequests(data.help_requests || []);
    } catch (err) {
      console.error('Error fetching help requests:', err);
    }
  };

  const fetchHelpSummary = async () => {
    try {
      const response = await fetch(`${API.baseUrl}/help/help-summary`);
      const data = await response.json();
      if (!response.ok) throw new Error('Failed to fetch summary');
      setSummary(data);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const StatusIndicator = ({ value, label, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-600">{label}</p>
          </div>
        </div>
        <div className={`flex items-center text-sm ${
          value > 10 ? 'text-red-600' : 'text-green-600'
        }`}>
          {value > 10 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <span className="ml-1">{value}%</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="h-10 w-10 text-blue-600" />
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
              <p className="mt-1 text-gray-500">Monitor and manage help requests across the platform</p>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        {summary ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatusIndicator
              value={summary.pending_requests}
              label="Pending Requests"
              icon={AlertTriangle}
              color="bg-yellow-50 text-yellow-600"
            />
            <StatusIndicator
              value={summary.in_progress_requests}
              label="In Progress"
              icon={Activity}
              color="bg-blue-50 text-blue-600"
            />
            <StatusIndicator
              value={summary.resolved_requests}
              label="Resolved Cases"
              icon={CheckCircle2}
              color="bg-green-50 text-green-600"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        )}

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 max-w-xs p-2 border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       text-gray-700"
            >
              <option value="">All Requests</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
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
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Professional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="5" className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </td>
                    </tr>
                  ))
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      No help requests found
                    </td>
                  </tr>
                ) : (
                  requests
                    .filter((r) => (statusFilter ? r.status === statusFilter : true))
                    .map((request) => (
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
                          <p className="text-sm text-gray-600 max-w-md">{request.request}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm 
                                       font-medium border ${getStatusStyles(request.status)}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {request.professional_name ? (
                            <div className="flex items-center space-x-2">
                              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                <Users className="h-4 w-4 text-green-600" />
                              </div>
                              <span className="text-sm text-gray-900">{request.professional_name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 italic">Not Assigned</span>
                          )}
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
  );
};

export default AdminHelpDashboard;