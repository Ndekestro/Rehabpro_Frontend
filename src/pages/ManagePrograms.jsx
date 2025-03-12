import React, { useState, useEffect } from 'react';
import API from '../api';
import { X, Edit2, Trash2, Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const ManagePrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    id: null,
    name: '',
    description: '',
    assigned_to: '',
    created_by: '',
    progress: '',
    remarks: '',
    status: 'active',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programResponse, professionalsResponse] = await Promise.all([
          fetch(`${API.baseUrl}/programs`),
          fetch(`${API.baseUrl}/programs/professionals`),
        ]);

        const programsData = await programResponse.json();
        const professionalsData = await professionalsResponse.json();

        setPrograms(programsData);
        setProfessionals(professionalsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const userDataStr = localStorage.getItem('user');
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        setForm(prevForm => ({ ...prevForm, created_by: userData.id }));
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditing) {
        await fetch(`${API.baseUrl}/programs/${form.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        await fetch(`${API.baseUrl}/programs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }

      const response = await fetch(`${API.baseUrl}/programs`);
      const data = await response.json();
      setPrograms(data);
      
      const userDataStr = localStorage.getItem('user');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      
      setForm({
        id: null,
        name: '',
        description: '',
        assigned_to: '',
        created_by: userData ? userData.id : '',
        progress: '',
        remarks: '',
        status: 'active',
      });
      setIsEditing(false);
      setShowModal(false);
    } catch (error) {
      console.error('Error submitting program:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this program?')) return;

    try {
      await fetch(`${API.baseUrl}/programs/${id}`, { method: 'DELETE' });
      setPrograms(programs.filter((program) => program.id !== id));
    } catch (error) {
      console.error('Error deleting program:', error);
    }
  };

  const handleEdit = (program) => {
    setForm({
      ...program,
      status: program.status || 'active'
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const openModal = () => {
    const userDataStr = localStorage.getItem('user');
    const userData = userDataStr ? JSON.parse(userDataStr) : null;
    
    setForm({
      id: null,
      name: '',
      description: '',
      assigned_to: '',
      created_by: userData ? userData.id : '',
      progress: '',
      remarks: '',
      status: 'active',
    });
    setIsEditing(false);
    setShowModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center space-y-4 animate-pulse">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-indigo-400 border-t-transparent animate-spin delay-150"></div>
          </div>
          <p className="text-indigo-600 font-semibold text-lg tracking-wide">Loading Programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white tracking-tight animate-fade-in-down">Program Surveys Management</h1>
            <button
              onClick={openModal}
              className="group flex items-center px-6 py-2.5 bg-white text-indigo-600 rounded-lg shadow-md hover:bg-indigo-50 hover:text-indigo-700 transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <Plus className="h-5 w-5 mr-2 group-hover:animate-pulse" />
              <span className="font-semibold">Add Program</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/80 backdrop-blur-sm">
                <tr>
                  {['Program Details', 'Assignment', 'Status', 'Actions'].map((header, index) => (
                    <th
                      key={header}
                      className={`px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                        index === 3 ? 'text-right' : ''
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {programs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-20">
                      <div className="flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
                        <AlertCircle className="h-20 w-20 text-gray-300" />
                        <h3 className="text-xl font-semibold text-gray-900">No Programs Available</h3>
                        <p className="text-gray-500 max-w-md">Create your first program by clicking the "Add Program" button above.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  programs.map((program) => (
                    <tr
                      key={program.id}
                      className="hover:bg-gray-50 transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                      <td className="px-6 py-5">
                        <div className="flex flex-col space-y-1">
                          <div className="text-sm font-semibold text-gray-900 line-clamp-1">{program.name}</div>
                          <div className="text-sm text-gray-600 line-clamp-2">{program.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col space-y-1">
                          <div className="text-sm text-gray-900 font-medium">
                            {program.assigned_to_name || 'Not Assigned'}
                          </div>
                          <div className="text-sm text-gray-500">
                            By: {program.created_by_name === 'participant' ? 'Guardian' : program.created_by_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`px-3 py-1.5 inline-flex items-center text-xs font-semibold rounded-full shadow-sm ${
                            program.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {program.status === 'active' ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1 animate-pulse" />
                              Active
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4 mr-1" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => handleEdit(program)}
                            className="p-2 text-yellow-600 hover:text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-full transition-all duration-200 transform hover:scale-110"
                            title="Edit Program"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(program.id)}
                            className="p-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-full transition-all duration-200 transform hover:scale-110"
                            title="Delete Program"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Enhanced Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm transition-opacity"></div>

            <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-95 animate-modal-in">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-white tracking-tight">
                    {isEditing ? 'Edit Program' : 'New Program'}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-1 text-white hover:text-gray-200 rounded-full hover:bg-white/10 transition-all duration-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Program Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50"
                      placeholder="Enter program name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                    <input
                      type="text"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50"
                      placeholder="Program description"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign To</label>
                    <select
                      name="assigned_to"
                      value={form.assigned_to}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50"
                      required
                    >
                      <option value="">Select Professional</option>
                      {professionals.map((professional) => (
                        <option key={professional.id} value={professional.id}>
                          {professional.first_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <div className="flex space-x-6">
                      {[
                        { value: 'active', label: 'Active' },
                        { value: 'inactive', label: 'Inactive' },
                      ].map((status) => (
                        <label key={status.value} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="status"
                            value={status.value}
                            checked={form.status === status.value}
                            onChange={handleChange}
                            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-700">{status.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Remarks</label>
                    <textarea
                      name="remarks"
                      value={form.remarks}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50"
                      placeholder="Additional notes or remarks"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        {isEditing ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      isEditing ? 'Update Program' : 'Create Program'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.5s ease-out;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-modal-in {
          animation: modalIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ManagePrograms;