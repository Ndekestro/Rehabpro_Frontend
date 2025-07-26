import React, { useEffect, useState } from 'react';
import API from '../api';
import { 
  Plus, X, Edit2, Trash2, User, Calendar, 
  AlertCircle, CheckCircle2, FileText, Users,
  Heart, Activity, Clock, AlertTriangle
} from 'lucide-react';

const RehabManagement = () => {
  const [participants, setParticipants] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [form, setForm] = useState({
    id: null,
    first_name: '',
    last_name: '',
    gender: 'Male',
    age: '',
    national_id: '',
    condition: '',
    guardian_id: '',
    professional_id: '',
    admission_date: '',
    status: 'Active',
    notes: '',
    reason: '',
    time_period: ''
  });  
  const [guardians, setGuardians] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // ✅ Reset Form
  const resetForm = () => {
    setForm({
      id: null,
      first_name: '',
      last_name: '',
      gender: 'Male',
      age: '',
      national_id: '',
      condition: '',
      guardian_id: '',
      professional_id: '',
      admission_date: '',
      status: 'Active',
      notes: '',
      reason: '',
      time_period: ''
    });
    setIsEditing(false);
    setShowFormModal(false); // Also close the modal
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
      id: participant.id, // Ensure ID is included ✅
      admission_date: participant.admission_date.split('T')[0], // Format date for input
    };
  
    setForm(formattedParticipant);
    setIsEditing(true);
    setShowFormModal(true);
  };

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

  const FormModal = () => {
    // Local state for form input
    const [localForm, setLocalForm] = useState({
      id: form.id || null,
      first_name: form.first_name || '',
      last_name: form.last_name || '',
      gender: form.gender || 'Male',
      age: form.age || '',
      national_id: form.national_id || '',
      condition: form.condition || '',
      guardian_id: form.guardian_id || '',
      professional_id: form.professional_id || '',
      admission_date: form.admission_date || '',
      status: form.status || 'Active',
      notes: form.notes || '', 
      reason: form.reason || '', 
      time_period: form.time_period || '' 
    });
    
    // State for validation errors
    const [errors, setErrors] = useState({});
    const [localSubmitting, setLocalSubmitting] = useState(false);
  
    const validateField = (name, value) => {
      switch (name) {
        case 'first_name':
          if (!value.trim()) return 'First name is required';
          if (value.trim().length < 2) return 'First name must be at least 2 characters';
          if (!/^[a-zA-Z\s]*$/.test(value.trim())) return 'First name can only contain letters and spaces';
          return '';

        case 'last_name':
          if (!value.trim()) return 'Last name is required';
          if (value.trim().length < 2) return 'Last name must be at least 2 characters';
          if (!/^[a-zA-Z\s]*$/.test(value.trim())) return 'Last name can only contain letters and spaces';
          return '';
  
        case 'age':
          if (!value) return 'Age is required';
          const age = parseInt(value);
          if (isNaN(age) || age < 0 || age > 120) return 'Please enter a valid age between 0 and 120';
          return '';
  
        case 'condition':
          if (!value) return 'Condition is required';
          return '';
  
        case 'admission_date':
          if (!value) return 'Admission date is required';
          return '';

        case 'reason':
          if (!value.trim()) return 'Reason for admission is required';
          if (value.trim().length < 3) return 'Reason should be at least 3 characters';
          return '';

        case 'time_period':
          if (!value.trim()) return 'Expected time period is required';
          return '';

        case 'national_id':
  if (!value) return 'National ID is required';
  if (value.length !== 16) return 'National ID must be exactly 16 characters';
  if (!/^\d+$/.test(value)) return 'National ID must contain only numbers';
  
  // Extract birth year from positions 1-4 (0-indexed)
  const birthYear = parseInt(value.substring(1, 5));
  const currentYear = new Date().getFullYear();
  const userAge = currentYear - birthYear;
  
  if (userAge < 16) return 'You must be at least 16 years old';
  
  return '';

default:
  return '';
      }
    };
  
    const handleLocalChange = (e) => {
      const { name, value } = e.target;
      
      // Update form
      setLocalForm(prev => ({
        ...prev,
        [name]: value
      }));
  
      // Validate field
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    };
  
    const validateForm = () => {
      const newErrors = {};
      const requiredFields = ['first_name', 'last_name', 'age', 'condition', 'admission_date', 'reason', 'time_period'];
      
      // Validate all required fields
      requiredFields.forEach(field => {
        const error = validateField(field, localForm[field]);
        if (error) newErrors[field] = error;
      });
      
      // Validate optional fields that have values
      const optionalFields = ['national_id'];
      optionalFields.forEach(field => {
        if (localForm[field]) {
          const error = validateField(field, localForm[field]);
          if (error) newErrors[field] = error;
        }
      });
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    const handleLocalSubmit = async (e) => {
      e.preventDefault();
      
      // Stop form submission if already submitting
      if (localSubmitting) return;
      
      // Validate all fields
      if (!validateForm()) {
        // Scroll to the first error
        const firstErrorField = document.querySelector('.border-red-500');
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
      
      setLocalSubmitting(true);
      setIsSubmitting(true);
      
      try {
        console.log("🚀 Sending Data to API:", localForm);
        
        const url = isEditing 
          ? `${API.baseUrl}/rehab/participants/${localForm.id}`
          : `${API.baseUrl}/rehab/participants`;
        const method = isEditing ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: localForm.id,
            first_name: localForm.first_name.trim(),
            last_name: localForm.last_name.trim(),
            gender: localForm.gender,
            age: localForm.age,
            national_id: localForm.national_id || null,
            condition: localForm.condition,
            guardian_id: localForm.guardian_id,
            professional_id: localForm.professional_id,
            admission_date: localForm.admission_date,
            status: localForm.status,
            notes: localForm.notes.trim() || '',
            reason: localForm.reason.trim(),
            time_period: localForm.time_period.trim()
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Error saving participant');
        }

        setMessage(isEditing ? 'Participant updated successfully' : 'Participant added successfully');
        await fetchParticipants(); // Refresh the participants list
        setShowFormModal(false);
        resetForm();
      } catch (err) {
        console.error('Form submission error:', err);
        setError(err.message || 'Error submitting participant');
      } finally {
        setLocalSubmitting(false);
        setIsSubmitting(false);
      }
    };
  
    const getInputClassName = (fieldName) => {
      return `w-full p-2 border ${errors[fieldName] ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md focus:ring-2 transition-all duration-200`;
    };
  
    return (
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
  
          <form onSubmit={handleLocalSubmit} className="p-6">
            {/* Form error summary */}
            {Object.keys(errors).length > 0 && (
              <div className="mb-6 p-4 bg-red-50 rounded-md border border-red-200">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Please correct the following errors:</h4>
                    <ul className="mt-2 list-disc list-inside text-sm text-red-700">
                      {Object.entries(errors).map(([field, message]) => (
                        <li key={field}>{message}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={localForm.first_name}
                  onChange={handleLocalChange}
                  className={getInputClassName('first_name')}
                  required
                />
                {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={localForm.last_name}
                  onChange={handleLocalChange}
                  className={getInputClassName('last_name')}
                  required
                />
                {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={localForm.gender}
                  onChange={handleLocalChange}
                  className={getInputClassName('gender')}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                <input
                  type="number"
                  name="age"
                  value={localForm.age}
                  onChange={handleLocalChange}
                  className={getInputClassName('age')}
                  min="0"
                  max="120"
                  required
                />
                {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age}</p>}
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition *</label>
                <select
                  name="condition"
                  value={localForm.condition}
                  onChange={handleLocalChange}
                  className={getInputClassName('condition')}
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
                {errors.condition && <p className="mt-1 text-sm text-red-600">{errors.condition}</p>}
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guardian *</label>
                <select
                  name="guardian_id"
                  value={localForm.guardian_id}
                  onChange={handleLocalChange}
                  className={getInputClassName('guardian_id')}
                  required
                >
                  <option value="">Select Guardian</option>
                  {guardians.map((g) => (
                    <option key={g.id} value={g.id}>{g.first_name} {g.last_name}</option>
                  ))}
                </select>
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professional *</label>
                <select
                  name="professional_id"
                  value={localForm.professional_id}
                  onChange={handleLocalChange}
                  className={getInputClassName('professional_id')}
                  required
                >
                  <option value="">Select Professional</option>
                  {professionals.map((p) => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name} - {p.profession}</option>
                  ))}
                </select>
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date *</label>
                <input
                  type="date"
                  name="admission_date"
                  value={localForm.admission_date}
                  onChange={handleLocalChange}
                  className={getInputClassName('admission_date')}
                  required
                />
                {errors.admission_date && <p className="mt-1 text-sm text-red-600">{errors.admission_date}</p>}
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={localForm.status}
                  onChange={handleLocalChange}
                  className={getInputClassName('status')}
                >
                  <option value="Active">Active</option>
                  <option value="Discharged">Discharged</option>
                  <option value="Transferred">Transferred</option>
                </select>
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">National ID (Optional)</label>
                <input
                  type="text"
                  name="national_id"
                  value={localForm.national_id}
                  onChange={(e) => {
                    // Limit to 16 characters
                    if (e.target.value.length <= 16) {
                      handleLocalChange(e);
                    }
                  }}
                  maxLength={16}
                  className={getInputClassName('national_id')}
                  placeholder="16 characters maximum"
                />
                {errors.national_id && <p className="mt-1 text-sm text-red-600">{errors.national_id}</p>}
                <p className="mt-1 text-xs text-gray-500">{localForm.national_id?.length || 0}/16 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Time Period *</label>
                <input
                  type="text"
                  name="time_period"
                  value={localForm.time_period}
                  onChange={handleLocalChange}
                  className={getInputClassName('time_period')}
                  placeholder="e.g. 3 months, 2 weeks"
                  required
                />
                {errors.time_period && <p className="mt-1 text-sm text-red-600">{errors.time_period}</p>}
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Admission *</label>
                <textarea 
                  name="reason"
                  value={localForm.reason}
                  onChange={handleLocalChange}
                  rows={4}
                  placeholder="Explain why the participant is admitted..."
                  className={getInputClassName('reason')}
                  required
                />
                {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason}</p>}
                <div className="mt-1 text-right text-xs text-gray-500">
                  {localForm.reason.length} / 1000 characters
                </div>
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea 
                  name="notes"
                  value={localForm.notes}
                  onChange={handleLocalChange}
                  rows={4}
                  placeholder="Document observations, treatment notes, or any additional information here..."
                  className={getInputClassName('notes')}
                />
                <div className="mt-1 text-right text-xs text-gray-500">
                  {localForm.notes.length} / 1000 characters
                </div>
              </div>
            </div>
  
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={localSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                  ${localSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} 
                  flex items-center`}
                disabled={localSubmitting}
              >
                {localSubmitting && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isEditing ? 
                  (localSubmitting ? 'Updating...' : 'Update Participant') : 
                  (localSubmitting ? 'Creating...' : 'Add Participant')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const DetailsModal = ({ participant, onClose }) => {
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
                    {participant.first_name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{participant.first_name} {participant.last_name}</h4>
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
              <DetailRow icon={User} label="Name" value={`${participant.first_name} ${participant.last_name}`} />
              <DetailRow icon={FileText} label="National ID" value={participant.national_id} />
              <DetailRow icon={AlertCircle} label="Reason for Admission" value={participant.reason} />
              
              {/* Expected Time Period with remaining days calculation */}
              <DetailRow 
                icon={Clock} 
                label="Expected Time Period" 
                value={
                  <>
                    <div className="font-medium">{participant.time_period}</div>
                    <div className="text-sm text-gray-600">
                      {(() => {
                        if (participant.admission_date && participant.time_period) {
                          try {
                            // Parse the time period (assuming format like "10 days", "3 months", etc.)
                            const timePattern = /(\d+)\s*(day|days|week|weeks|month|months|year|years)/i;
                            const match = participant.time_period.match(timePattern);
                            
                            if (match) {
                              const amount = parseInt(match[1]);
                              const unit = match[2].toLowerCase();
                              
                              // Calculate end date from admission date and time period
                              const admissionDate = new Date(participant.admission_date);
                              let expectedEndDate = new Date(admissionDate);
                              
                              switch(unit) {
                                case 'day':
                                case 'days':
                                  expectedEndDate.setDate(admissionDate.getDate() + amount);
                                  break;
                                case 'week':
                                case 'weeks':
                                  expectedEndDate.setDate(admissionDate.getDate() + (amount * 7));
                                  break;
                                case 'month':
                                case 'months':
                                  expectedEndDate.setMonth(admissionDate.getMonth() + amount);
                                  break;
                                case 'year':
                                case 'years':
                                  expectedEndDate.setFullYear(admissionDate.getFullYear() + amount);
                                  break;
                              }
                              
                              // Calculate days remaining
                              const today = new Date();
                              const timeDiff = expectedEndDate - today;
                              const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                              
                              if (daysRemaining > 0) {
                                return `${daysRemaining} days remaining`;
                              } else if (daysRemaining === 0) {
                                return "Last day today";
                              } else {
                                return `${Math.abs(daysRemaining)} days overdue`;
                              }
                            }
                            return "Unable to calculate remaining time";
                          } catch (error) {
                            console.error("Error calculating remaining days:", error);
                            return "Unable to calculate remaining time";
                          }
                        }
                        return "No time information available";
                      })()}
                    </div>
                  </>
                } 
              />

              {/* Admission Date */}
              <DetailRow 
                icon={Calendar} 
                label="Admission Date" 
                value={
                  <>
                    <div>{new Date(participant.admission_date).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-600">
                      {(() => {
                        if (participant.admission_date) {
                          const admissionDate = new Date(participant.admission_date);
                          const today = new Date();
                          const timeDiff = today - admissionDate;
                          const daysPassed = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                          
                          if (daysPassed === 0) {
                            return "Admitted today";
                          } else if (daysPassed === 1) {
                            return "Admitted yesterday";
                          } else {
                            return `${daysPassed} days since admission`;
                          }
                        }
                        return "";
                      })()}
                    </div>
                  </>
                }
              />
              <DetailRow icon={Calendar} label="Age" value={participant.age} />
              <DetailRow icon={Heart} label="Condition" value={participant.condition} />
              <DetailRow icon={Users} label="Guardian" value={participant.guardian_name} />
              <DetailRow icon={Activity} label="Professional" value={participant.professional_name} />
              
              {/* Notes Section */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Additional Notes</h5>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {participant?.notes?.trim() ? participant.notes : 'No additional notes'}
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
                {participants.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">No participants found. Add your first participant!</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  participants.map((participant) => (
                    <tr key={participant.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {participant.first_name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{participant.first_name} {participant.last_name}</div>
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
                        <div className="text-sm text-gray-900">Guardian: {participant.guardian_first_name || 'None'}</div>
                        <div className="text-sm text-gray-500">Professional: {participant.professional_first_name || 'None'}</div>
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
                  ))
                )}
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