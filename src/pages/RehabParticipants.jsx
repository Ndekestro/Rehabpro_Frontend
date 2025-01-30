import React, { useEffect, useState } from 'react';
import API from '../api';
import { 
  Plus, X, Edit2, Trash2, User, Calendar, 
  AlertCircle, CheckCircle2, FileText, Users,
  Heart, Activity, Clock
} from 'lucide-react';

const RehabManagement = () => {
  const [participants, setParticipants] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [form, setForm] = useState({
    id: null,
    name: '',
    gender: 'Male',
    age: '',
    condition: '',
    guardian_id: '',
    professional_id: '',
    admission_date: '',
    status: 'Active',
    notes: '',
  });
  const [guardians, setGuardians] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  
  useEffect(() => {
    fetchParticipants();
    fetchGuardians();
    fetchProfessionals();
  }, []);

  // ✅ Fetch all rehabilitation participants
  const fetchParticipants = async () => {
    try {
      const response = await fetch(`${API.baseUrl}/rehab/participants`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch participants');
      setParticipants(data.participants);
    } catch (err) {
      setError(err.message);
    }
  };

  // ✅ Fetch all available guardians
  const fetchGuardians = async () => {
    try {
      const response = await fetch(`${API.baseUrl}/rehab/guardians`);
      const data = await response.json();
      setGuardians(data.guardians || []);
    } catch (err) {
      console.error('Error fetching guardians:', err);
    }
  };

  // ✅ Fetch all available professionals
  const fetchProfessionals = async () => {
    try {
      const response = await fetch(`${API.baseUrl}/rehab/professionals`);
      const data = await response.json();
      setProfessionals(data.professionals || []);
    } catch (err) {
      console.error('Error fetching professionals:', err);
    }
  };

  // ✅ Handle form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Create or Update a Rehabilitation Participant
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditing 
        ? `${API.baseUrl}/rehab/participants/${form.id}` // Notice the plural 'participants'
        : `${API.baseUrl}/rehab/participants`;
      const method = isEditing ? 'PUT' : 'POST';
  
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
  
      if (!response.ok) throw new Error('Error saving participant');
  
      setMessage(isEditing ? 'Participant updated successfully' : 'Participant added successfully');
      resetForm();
      fetchParticipants();
      setShowFormModal(false);
    } catch (err) {
      setError('Error submitting participant');
    }
  };

  // ✅ Delete a Rehabilitation Participant
  const handleDelete = async (id) => {
    try {
      await fetch(`${API.baseUrl}/rehab/participant/${id}`, { method: 'DELETE' });
      setParticipants(participants.filter((p) => p.id !== id));
      setMessage('Participant deleted successfully');
    } catch (error) {
      setError('Error deleting participant');
    }
  };

  // ✅ Edit a Rehabilitation Participant
  const handleEdit = (participant) => {
    // Format the date to YYYY-MM-DD for the input field
    const formattedParticipant = {
      ...participant,
      admission_date: participant.admission_date.split('T')[0] // Format date for input
    };
    setForm(formattedParticipant);
    setIsEditing(true);
    setShowFormModal(true);
  };

  // ✅ Reset Form
  const resetForm = () => {
    setForm({
      id: null,
      name: '',
      gender: 'Male',
      age: '',
      condition: '',
      guardian_id: '',
      professional_id: '',
      admission_date: '',
      status: 'Active',
      notes: '',
    });
    setIsEditing(false);
    setShowFormModal(false); // Also close the modal
  };

  // Keep existing fetch functions...

  const handleViewDetails = (participant) => {
    setSelectedParticipant(participant);
    setShowDetailsModal(true);
  };
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Discharged':
        return 'bg-gray-100 text-gray-800';
      case 'Transferred':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const FormModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-2xl font-semibold text-gray-900">
            {isEditing ? 'Edit Participant' : 'Add New Participant'}
          </h3>
          <button
            onClick={() => setShowFormModal(false)}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select
                name="condition"
                value={form.condition}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Condition</option>
                <option value="Drug Addiction">Drug Addiction</option>
                <option value="Alcoholism">Alcoholism</option>
                <option value="Mental Health Issue">Mental Health Issue</option>
                <option value="Trauma Recovery">Trauma Recovery</option>
                <option value="Physical Rehabilitation">Physical Rehabilitation</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guardian</label>
              <select
                name="guardian_id"
                value={form.guardian_id}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Guardian</option>
                {guardians.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Professional</label>
              <select
                name="professional_id"
                value={form.professional_id}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Professional</option>
                {professionals.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} - {p.profession}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date</label>
              <input
                type="date"
                name="admission_date"
                value={form.admission_date}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Discharged">Discharged</option>
                <option value="Transferred">Transferred</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                placeholder="Additional notes..."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowFormModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              {isEditing ? 'Update Participant' : 'Add Participant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const DetailsModal = ({ participant, onClose }) => {
    if (!participant) return null;

    const DetailRow = ({ icon: Icon, label, value }) => (
      <div className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg">
        <div className="flex-shrink-0">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-sm text-gray-900">{value || 'Not provided'}</p>
        </div>
      </div>
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="border-b border-gray-200">
            <div className="p-6 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Participant Details</h3>
                <p className="mt-1 text-sm text-gray-500">Complete information about the participant</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Header Information */}
            <div className="flex items-center justify-between pb-6 border-b">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {participant.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{participant.name}</h4>
                  <p className="text-sm text-gray-500">{participant.condition}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(participant.status)}`}>
                {participant.status}
              </span>
            </div>

            {/* Details Grid */}
            <div className="mt-6 space-y-1">
              <DetailRow icon={User} label="Gender" value={participant.gender} />
              <DetailRow icon={Calendar} label="Age" value={participant.age} />
              <DetailRow icon={Heart} label="Condition" value={participant.condition} />
              <DetailRow icon={Users} label="Guardian" value={participant.guardian_name} />
              <DetailRow icon={Activity} label="Professional" value={participant.professional_name} />
              <DetailRow icon={Clock} label="Admission Date" value={participant.admission_date} />
              
              {/* Notes Section */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Additional Notes</h5>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {participant.notes || 'No additional notes'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rehabilitation Management</h1>
            <p className="mt-1 text-sm text-gray-500">Manage and monitor rehabilitation participants</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowFormModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg
                     text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                     shadow-sm transition-colors duration-200 gap-2"
          >
            <Plus className="h-5 w-5" />
            Add New Participant
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-4 p-4 rounded-md bg-red-50 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-4 p-4 rounded-md bg-green-50 flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-400 mr-2" />
            <p className="text-green-700">{message}</p>
          </div>
        )}

        {/* Participants Table */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Support Team</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {participants.map((participant) => (
                  <tr key={participant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {participant.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                          <div className="text-sm text-gray-500">Age: {participant.age}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{participant.condition}</div>
                      <div className="text-sm text-gray-500">
                        Admitted: {new Date(participant.admission_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">Guardian: {participant.guardian_name}</div>
                      <div className="text-sm text-gray-500">Professional: {participant.professional_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(participant.status)}`}>
                        {participant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(participant)}
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm
                                   text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Details
                        </button>
                        <button
                          onClick={() => handleEdit(participant)}
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm
                                   text-amber-600 hover:bg-amber-50 transition-colors duration-200"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(participant.id)}
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm
                                   text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modals */}
        {showFormModal && <FormModal />}
        {showDetailsModal && (
          <DetailsModal 
            participant={selectedParticipant} 
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedParticipant(null);
            }} 
          />
        )}
      </div>
    </div>
  );
};

export default RehabManagement;