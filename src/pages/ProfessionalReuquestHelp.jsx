import React, { useEffect, useState } from 'react';
import API from '../api';
import { CheckCircle2, XCircle, Users, AlertCircle, MessageSquare, FileText } from 'lucide-react';

const ProfessionalHelpRequests = () => {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchHelpRequests();
  }, [statusFilter]);

  // ✅ Fetch all help requests
  const fetchHelpRequests = async () => {
    try {
      const response = await fetch(`${API.baseUrl}/help/all`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch help requests');
      setRequests(data.help_requests || []);
    } catch (err) {
      console.error('Error fetching help requests:', err);
    }
  };

  // ✅ Update help request status and notes
  const handleUpdateStatus = async () => {
    try {
      const response = await fetch(`${API.baseUrl}/help/update/${selectedRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });

      if (!response.ok) throw new Error('Error updating status');
      fetchHelpRequests(); // Refresh list after update
      setShowModal(false);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Help Requests</h2>

      <div className="mb-4 flex items-center space-x-4">
        <label className="font-semibold">Filter by Status:</label>
        <select
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {requests.length === 0 ? (
        <p className="text-gray-600">No help requests found.</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
          <table className="w-full border-collapse border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-3 text-left">Guardian</th>
                <th className="border p-3 text-left">Participant</th>
                <th className="border p-3 text-left">Request</th>
                <th className="border p-3 text-left">Status</th>
                <th className="border p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests
                .filter((r) => (statusFilter ? r.status === statusFilter : true))
                .map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition">
                    <td className="border p-3">
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{r.guardian_name}</p>
                          <p className="text-xs text-gray-500">{r.guardian_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="border p-3">{r.participant_name}</td>
                    <td className="border p-3">{r.request}</td>
                    <td className="border p-3">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          r.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : r.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="border p-3">
                      <button
                        onClick={() => {
                          setSelectedRequest(r);
                          setStatus(r.status);
                          setNotes(r.notes || '');
                          setShowModal(true);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                      >
                        <FileText className="h-4 w-4 inline-block mr-1" />
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Update Help Request</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">Manage request for {selectedRequest.participant_name}</p>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">New Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Add any important updates..."
              ></textarea>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100">
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4 inline-block mr-1" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalHelpRequests;
